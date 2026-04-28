const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

//@GET /api/leads- list with pagination, search, filter
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '', status = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/leads/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('company', 'name industry');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/leads
router.post('/', protect, async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, company } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    const lead = await Lead.create({ name, email, phone, status, assignedTo, company });
    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('company', 'name');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate field value' });
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/leads/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, company } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status, assignedTo, company },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('company', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/leads/:id - soft delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
