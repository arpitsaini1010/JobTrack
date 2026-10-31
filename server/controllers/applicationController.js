const Application = require('../models/Application');
const { ensureCompanyTracked } = require('./companyController');

// @desc    Get all applications for the logged-in user
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user.id }).sort({ appliedDate: -1, createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get statistics for dashboard
// @route   GET /api/applications/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user.id });

    const byStatus = {
      Bookmarked: 0,
      Applying: 0,
      Applied: 0,
      Shortlisted: 0,
      Interviewing: 0,
      Interview: 0,
      Negotiating: 0,
      Offer: 0,
      Accepted: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    applications.forEach((app) => {
      if (byStatus[app.status] !== undefined) {
        byStatus[app.status] += 1;
      }
    });

    res.status(200).json({
      total: applications.length,
      byStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res, next) => {
  try {
    const {
      company,
      role,
      location,
      type,
      salary,
      appliedDate,
      jobUrl,
      notes,
      status,
      source,
      externalJobId,
      listingStatus,
      skills,
      offer
    } = req.body;

    if (!company || !company.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    if (!role || !role.trim()) {
      return res.status(400).json({ message: 'Role title is required' });
    }

    const initialStatus = status || 'Applied';

    // Validate offer CTC if provided
    if (offer && offer.ctc !== undefined && offer.ctc !== null && offer.ctc < 0) {
      return res.status(400).json({ message: 'CTC cannot be negative' });
    }

    const application = new Application({
      user: req.user.id,
      company: company.trim(),
      role: role.trim(),
      location: location ? location.trim() : '',
      type: type || 'Job',
      salary: salary !== undefined && salary !== '' ? Number(salary) : undefined,
      appliedDate: appliedDate || new Date(),
      jobUrl: jobUrl ? jobUrl.trim() : '',
      notes: notes ? notes.trim() : '',
      source: source || 'Manual',
      externalJobId: externalJobId || undefined,
      listingStatus: listingStatus || 'Active',
      skills: Array.isArray(skills) ? skills : [],
      excitement: req.body.excitement !== undefined ? Number(req.body.excitement) : 3,
      dateSaved: req.body.dateSaved || new Date(),
      deadline: req.body.deadline || undefined,
      followUpDate: req.body.followUpDate || undefined,
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          date: new Date()
        }
      ],
      offer: offer || null
    });

    const savedApplication = await application.save();

    // Auto-track company in Company Tracker
    await ensureCompanyTracked(req.user.id, company, location, jobUrl);

    res.status(201).json(savedApplication);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const {
      company,
      role,
      location,
      type,
      salary,
      appliedDate,
      jobUrl,
      notes,
      source,
      listingStatus,
      skills,
      externalJobId,
      status,
      offer
    } = req.body;

    if (company !== undefined) {
      if (!company.trim()) return res.status(400).json({ message: 'Company name is required' });
      application.company = company.trim();
    }

    if (role !== undefined) {
      if (!role.trim()) return res.status(400).json({ message: 'Role title is required' });
      application.role = role.trim();
    }

    if (location !== undefined) application.location = location ? location.trim() : '';
    if (type !== undefined) application.type = type;
    if (salary !== undefined) {
      if (salary !== '' && salary !== null && Number(salary) < 0) {
        return res.status(400).json({ message: 'Salary cannot be negative' });
      }
      application.salary = salary !== '' && salary !== null ? Number(salary) : undefined;
    }
    if (appliedDate !== undefined) application.appliedDate = appliedDate;
    if (jobUrl !== undefined) application.jobUrl = jobUrl ? jobUrl.trim() : '';
    if (notes !== undefined) application.notes = notes ? notes.trim() : '';
    if (source !== undefined) application.source = source ? source.trim() : 'Manual';
    if (listingStatus !== undefined) application.listingStatus = listingStatus;
    if (skills !== undefined && Array.isArray(skills)) application.skills = skills;
    if (externalJobId !== undefined) application.externalJobId = externalJobId;
    if (req.body.excitement !== undefined) application.excitement = Number(req.body.excitement);
    if (req.body.deadline !== undefined) application.deadline = req.body.deadline || undefined;
    if (req.body.followUpDate !== undefined) application.followUpDate = req.body.followUpDate || undefined;
    if (req.body.dateSaved !== undefined) application.dateSaved = req.body.dateSaved || undefined;

    // If status changed, record in status history (FR-C3)
    if (status && status !== application.status) {
      application.status = status;
      application.statusHistory.push({
        status,
        date: new Date()
      });
    }

    // Offer details validation and update
    if (offer !== undefined) {
      if (offer && offer.ctc !== undefined && offer.ctc !== null && offer.ctc < 0) {
        return res.status(400).json({ message: 'CTC cannot be negative' });
      }
      application.offer = offer;
    }

    const updatedApplication = await application.save();
    res.status(200).json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application and all its subdocuments
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an interview round to an application
// @route   POST /api/applications/:id/interviews
// @access  Private
const addInterview = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { round, type, date, meetingLink, notes } = req.body;

    if (!round || !round.trim()) {
      return res.status(400).json({ message: 'Interview round name is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Interview date is required' });
    }

    application.interviews.push({
      round: round.trim(),
      type: type || 'Technical',
      date,
      meetingLink: meetingLink ? meetingLink.trim() : '',
      notes: notes ? notes.trim() : ''
    });

    const updated = await application.save();
    res.status(201).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an interview round
// @route   PUT /api/applications/:id/interviews/:interviewId
// @access  Private
const updateInterview = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interview = application.interviews.id(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const { round, type, date, meetingLink, notes } = req.body;

    if (round !== undefined) {
      if (!round.trim()) return res.status(400).json({ message: 'Interview round name is required' });
      interview.round = round.trim();
    }
    if (type !== undefined) interview.type = type;
    if (date !== undefined) {
      if (!date) return res.status(400).json({ message: 'Interview date is required' });
      interview.date = date;
    }
    if (meetingLink !== undefined) interview.meetingLink = meetingLink ? meetingLink.trim() : '';
    if (notes !== undefined) interview.notes = notes ? notes.trim() : '';

    const updated = await application.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an interview round
// @route   DELETE /api/applications/:id/interviews/:interviewId
// @access  Private
const deleteInterview = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interview = application.interviews.id(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    application.interviews.pull(req.params.interviewId);
    const updated = await application.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getStats,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addInterview,
  updateInterview,
  deleteInterview
};
