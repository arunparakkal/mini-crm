const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/tasks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, lead, assignedTo, dueDate, status } = req.body;
    if (!title || !lead || !assignedTo)
      return res.status(400).json({ message: 'Title, lead, and assignedTo are required' });

    const task = await Task.create({
      title, description, lead, assignedTo, dueDate, status,
      createdBy: req.user._id
    });

    const populated = await Task.findById(task._id)
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/tasks/:id
// Authorization: only assigned user or admin can update status
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check if updating status - only assigned user or admin can do it
    if (req.body.status !== undefined) {
      const isAssigned = task.assignedTo.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isAssigned && !isAdmin) {
        return res.status(403).json({ message: 'Only the assigned user or admin can update task status' });
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
