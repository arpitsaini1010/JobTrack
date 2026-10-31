const Company = require('../models/Company');
const Application = require('../models/Application');
const { getCompanyMetadata } = require('../services/companySimilarityService');

// @desc    Get all companies tracked by current user with linked application counts
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ user: req.user.id }).sort({ updatedAt: -1 });
    const userApplications = await Application.find({ user: req.user.id });

    // Aggregate application counts & active roles per company
    const enriched = companies.map((comp) => {
      const compObj = comp.toObject();
      const matchedApps = userApplications.filter(
        (app) => app.company.toLowerCase().trim() === comp.name.toLowerCase().trim()
      );

      compObj.applicationsCount = matchedApps.length;
      compObj.applications = matchedApps.map((a) => ({
        id: a._id,
        role: a.role,
        status: a.status,
        appliedDate: a.appliedDate
      }));

      // If user has applied to this company, reflect in company status if default
      if (matchedApps.some((a) => ['Applied', 'Interviewing', 'Interview', 'Offer', 'Accepted'].includes(a.status))) {
        if (compObj.status === 'Target') {
          compObj.status = 'Applied';
        }
      }

      return compObj;
    });

    res.status(200).json(enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a company to tracker manually
// @route   POST /api/companies
// @access  Private
const createCompany = async (req, res, next) => {
  try {
    const { name, industry, location, website, rating, status, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const trimmedName = name.trim();
    const existing = await Company.findOne({ user: req.user.id, name: trimmedName });
    if (existing) {
      return res.status(400).json({ message: `Company "${trimmedName}" is already in your tracker.` });
    }

    const meta = getCompanyMetadata(trimmedName);

    const colors = ['#004d40', '#0a66c2', '#2557a7', '#0caa41', '#4f46e5', '#7c3aed', '#d97706'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const company = await Company.create({
      user: req.user.id,
      name: trimmedName,
      industry: industry || meta.industry,
      location: location || '',
      website: website || meta.website,
      rating: rating || 4,
      status: status || 'Target',
      notes: notes || '',
      logoColor: randomColor,
      similarCompanies: meta.similar || []
    });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

// @desc    Update tracked company
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, user: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const { name, industry, location, website, rating, status, notes, similarCompanies } = req.body;

    if (name !== undefined) company.name = name.trim();
    if (industry !== undefined) company.industry = industry.trim();
    if (location !== undefined) company.location = location.trim();
    if (website !== undefined) company.website = website.trim();
    if (rating !== undefined) company.rating = Number(rating);
    if (status !== undefined) company.status = status;
    if (notes !== undefined) company.notes = notes.trim();
    if (similarCompanies !== undefined && Array.isArray(similarCompanies)) {
      company.similarCompanies = similarCompanies;
    }

    const saved = await company.save();
    res.status(200).json(saved);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company from tracker
// @route   DELETE /api/companies/:id
// @access  Private
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company removed from tracker' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar companies for a company
// @route   GET /api/companies/similar/:name
// @access  Private
const getSimilar = async (req, res, next) => {
  try {
    const meta = getCompanyMetadata(req.params.name);
    res.status(200).json(meta);
  } catch (error) {
    next(error);
  }
};

// Helper function to auto-track company when an application is created or applied to
const ensureCompanyTracked = async (userId, companyName, location = '', website = '') => {
  try {
    if (!companyName || !companyName.trim()) return null;
    const name = companyName.trim();
    let comp = await Company.findOne({ user: userId, name });

    if (!comp) {
      const meta = getCompanyMetadata(name);
      comp = await Company.create({
        user: userId,
        name,
        industry: meta.industry,
        location: location || '',
        website: website || meta.website,
        rating: 4,
        status: 'Applied',
        similarCompanies: meta.similar || []
      });
      console.log(`✓ Auto-tracked company "${name}" into user's Company Tracker`);
    } else {
      if (comp.status === 'Target') {
        comp.status = 'Applied';
        await comp.save();
      }
    }
    return comp;
  } catch (err) {
    console.error('ensureCompanyTracked error:', err.message);
    return null;
  }
};

module.exports = {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getSimilar,
  ensureCompanyTracked
};

