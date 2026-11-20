const router = require('express').Router();
const Application = require('../models/Application');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

function updateBadges(user) {
  const badges = new Set(user.badges);
  const hours = user.totalMinutes / 60;
  badges.add('First Task');
  if (hours >= 1) badges.add('1 Hour Hero');
  if (hours >= 5) badges.add('5 Hour Champion');
  if (hours >= 10) badges.add('10 Hour Legend');
  user.badges = [...badges];
}

// Volunteer: my applications
router.get('/mine', protect, restrictTo('volunteer'), async (req, res, next) => {
  try {
    const apps = await Application.find({ volunteer: req.user._id })
      .populate({ path: 'task', populate: { path: 'ngo', select: 'orgName city' } })
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) { next(err); }
});

// NGO: applicants for my tasks (?taskId= optional)
router.get('/ngo', protect, restrictTo('ngo'), async (req, res, next) => {
  try {
    const taskFilter = { ngo: req.user._id };
    if (req.query.taskId) taskFilter._id = req.query.taskId;
    const taskIds = (await Task.find(taskFilter).select('_id')).map((t) => t._id);
    const apps = await Application.find({ task: { $in: taskIds } })
      .populate('task', 'title durationMins date')
      .populate('volunteer', 'name email skills')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) { next(err); }
});

// NGO: accept or reject  body: { status: 'accepted' | 'rejected' }
router.patch('/:id', protect, restrictTo('ngo'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
    }
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    const task = await Task.findById(app.task);
    if (String(task.ngo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your task' });
    }
    if (app.status !== 'pending') {
      return res.status(400).json({ message: `Application already ${app.status}` });
    }
    if (status === 'accepted') {
      if (task.slotsAvailable <= 0) {
        return res.status(400).json({ message: 'No slots left for this task' });
      }
      task.slotsAvailable -= 1;
      if (task.slotsAvailable === 0) task.status = 'filled';
      await task.save();
    }
    app.status = status;
    await app.save();
    res.json(app);
  } catch (err) { next(err); }
});

// NGO: mark completed -> adds hours, badges
router.patch('/:id/complete', protect, restrictTo('ngo'), async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    const task = await Task.findById(app.task);
    if (String(task.ngo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your task' });
    }
    if (app.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted applications can be completed' });
    }
    app.status = 'completed';
    app.completedAt = new Date();
    await app.save();

    const volunteer = await User.findById(app.volunteer);
    volunteer.totalMinutes += task.durationMins;
    updateBadges(volunteer);
    await volunteer.save();

    res.json({ application: app, badges: volunteer.badges, totalMinutes: volunteer.totalMinutes });
  } catch (err) { next(err); }
});

module.exports = router;
