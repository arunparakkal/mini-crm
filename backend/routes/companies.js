const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

// @GET /api/companies
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/companies/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const leads = await Lead.find({ company: req.params.id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ company, leads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/companies
router.post('/', protect, async (req, res) => {
  try {
    const { name, industry, location, website, phone, email, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required' });

    const company = await Company.create({ name, industry, location, website, phone, email, description });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/companies/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/companies/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
