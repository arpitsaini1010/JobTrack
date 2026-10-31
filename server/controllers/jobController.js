const JobFeed = require('../models/JobFeed');
const Application = require('../models/Application');
const { syncJobFeeds, closeJobPosting } = require('../services/jobFeedService');
const { ensureCompanyTracked } = require('./companyController');
const { getCompanyMetadata } = require('../services/companySimilarityService');

// @desc    Get aggregated job postings from portals with user application status
// @route   GET /api/jobs
// @access  Private
const getJobFeed = async (req, res, next) => {
  try {
    const { search, portal, location, type, status } = req.query;

    const query = {};

    // Filter by status (default to Active unless specified)
    if (status && status !== 'All') {
      query.status = status;
    } else if (!status) {
      query.status = 'Active';
    }

    // Portal filter
    if (portal && portal !== 'All') {
      query.portal = portal;
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    // Location filter
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Search query (company, role, skills, description)
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { company: { $regex: s, $options: 'i' } },
        { role: { $regex: s, $options: 'i' } },
        { skills: { $in: [new RegExp(s, 'i')] } },
        { description: { $regex: s, $options: 'i' } }
      ];
    }

    let jobs = await JobFeed.find(query).sort({ postedDate: -1, createdAt: -1 });

    // Auto-sync if database has no active feeds
    if (jobs.length === 0 && !search && !portal && !location) {
      await syncJobFeeds();
      jobs = await JobFeed.find(query).sort({ postedDate: -1, createdAt: -1 });
    }

    // Fetch current user's tracked applications to correlate
    const userApplications = await Application.find({ user: req.user.id });
    const appliedMap = new Map();
    userApplications.forEach((app) => {
      if (app.externalJobId) {
        appliedMap.set(app.externalJobId, app);
      }
      // Fallback matching by company and role
      const compRoleKey = `${app.company.toLowerCase().trim()}_${app.role.toLowerCase().trim()}`;
      appliedMap.set(compRoleKey, app);
    });

    // Enforce matching and status correlation
    const enrichedJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      const compRoleKey = `${job.company.toLowerCase().trim()}_${job.role.toLowerCase().trim()}`;
      const userApp = appliedMap.get(job.externalId) || appliedMap.get(compRoleKey);

      // Attach company metadata and similar companies
      const companyMeta = getCompanyMetadata(job.company);
      jobObj.industry = companyMeta.industry;
      jobObj.similarCompanies = companyMeta.similar || [];
      jobObj.companyWebsite = companyMeta.website;

      if (userApp) {
        jobObj.isApplied = true;
        jobObj.userApplicationId = userApp._id;
        jobObj.userApplicationStatus = userApp.status;
        jobObj.userAppliedDate = userApp.appliedDate;
      } else {
        jobObj.isApplied = false;
        jobObj.userApplicationId = null;
        jobObj.userApplicationStatus = null;
      }
      return jobObj;
    });

    // Summary stats
    const totalActive = await JobFeed.countDocuments({ status: 'Active' });
    const totalClosed = await JobFeed.countDocuments({ status: 'Closed' });
    const userAppliedCount = userApplications.filter(a => a.source && a.source !== 'Manual').length;

    res.status(200).json({
      jobs: enrichedJobs,
      meta: {
        totalFound: enrichedJobs.length,
        totalActive,
        totalClosed,
        userAppliedCount,
        portals: ['All', 'LinkedIn', 'Direct', 'Remotive'],
        region: 'India'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger sync from portals and APIs
// @route   POST /api/jobs/sync
// @access  Private
const syncJobs = async (req, res, next) => {
  try {
    const result = await syncJobFeeds();
    res.status(200).json({
      message: 'Job feeds successfully refreshed from live career portals and APIs',
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    1-Click Apply & Track or Bookmark
// @route   POST /api/jobs/apply-and-track
// @access  Private
const applyAndTrack = async (req, res, next) => {
  try {
    const { jobId, externalId, targetStatus } = req.body;

    let feedItem = null;
    if (jobId) {
      feedItem = await JobFeed.findById(jobId);
    } else if (externalId) {
      feedItem = await JobFeed.findOne({ externalId });
    }

    if (!feedItem) {
      return res.status(404).json({ message: 'Job posting not found in portal feed' });
    }

    const applicationStatus = targetStatus || 'Applied';

    // Check if user already tracked this job
    const existingApp = await Application.findOne({
      user: req.user.id,
      $or: [
        { externalJobId: feedItem.externalId },
        { company: feedItem.company, role: feedItem.role }
      ]
    });

    if (existingApp) {
      return res.status(200).json({
        message: 'You have already saved/tracked this position!',
        alreadyApplied: true,
        application: existingApp,
        jobUrl: feedItem.jobUrl
      });
    }

    // Parse salary numeric if available
    let numericSalary = feedItem.salaryNumeric;
    if (!numericSalary && feedItem.salary) {
      const match = feedItem.salary.match(/\d+[\d,]*/);
      if (match) {
        numericSalary = parseInt(match[0].replace(/,/g, ''), 10);
      }
    }

    // Create new Application directly into user's personal tracker
    const newApplication = new Application({
      user: req.user.id,
      company: feedItem.company,
      role: feedItem.role,
      location: feedItem.location,
      type: feedItem.type || 'Job',
      salary: numericSalary || undefined,
      appliedDate: new Date(),
      jobUrl: feedItem.jobUrl,
      source: feedItem.portal,
      externalJobId: feedItem.externalId,
      listingStatus: feedItem.status || 'Active',
      skills: feedItem.skills || [],
      excitement: 4,
      notes: `${applicationStatus === 'Bookmarked' ? 'Bookmarked' : 'Applied'} via Teal JobTrack from ${feedItem.portal}. Expected Package: ${feedItem.salary}.`,
      status: applicationStatus,
      statusHistory: [
        {
          status: applicationStatus,
          date: new Date()
        }
      ]
    });

    const savedApp = await newApplication.save();

    // Automatically track company in user's Company Tracker
    await ensureCompanyTracked(req.user.id, feedItem.company, feedItem.location, feedItem.jobUrl);

    // Increment applicants counter on the feed item if applying
    if (applicationStatus === 'Applied') {
      feedItem.applicantsCount = (feedItem.applicantsCount || 0) + 1;
      await feedItem.save();
    }

    res.status(201).json({
      message: applicationStatus === 'Bookmarked'
        ? `🔖 Saved to Bookmarked Tracker!`
        : `🎉 Successfully applied! Position added to your JobTrack tracker as 'Applied' and company added to Company Tracker.`,
      alreadyApplied: false,
      application: savedApp,
      jobUrl: feedItem.jobUrl
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate closing a job on portal (Demonstrates: applied application stays preserved)
// @route   POST /api/jobs/:id/simulate-close
// @access  Private
const simulateClose = async (req, res, next) => {
  try {
    const result = await closeJobPosting(req.params.id);
    res.status(200).json({
      message: `Job "${result.job.role} at ${result.job.company}" is now Closed on portal. All ${result.affectedApplicationsCount} user application(s) remain safely preserved in the tracker!`,
      job: result.job,
      affectedApplicationsCount: result.affectedApplicationsCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobFeed,
  syncJobs,
  applyAndTrack,
  simulateClose
};
