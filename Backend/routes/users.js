const router = require('express').Router();
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

router.get('/me/stats', protect, async (req, res, next) => {
  try {
    if (req.user.role === 'volunteer') {
      const [applied, completed] = await Promise.all([
        Application.countDocuments({ volunteer: req.user._id }),
        Application.countDocuments({ volunteer: req.user._id, status: 'completed' }),
      ]);
      return res.json({
        totalHours: +(req.user.totalMinutes / 60).toFixed(1),
        tasksApplied: applied,
        tasksCompleted: completed,
        badges: req.user.badges,
      });
    }
    // NGO stats
    const Task = require('../models/Task');
    const tasks = await Task.find({ ngo: req.user._id }).select('_id');
    const ids = tasks.map((t) => t._id);
    const [applicants, completed] = await Promise.all([
      Application.countDocuments({ task: { $in: ids } }),
      Application.countDocuments({ task: { $in: ids }, status: 'completed' }),
    ]);
    res.json({ tasksPosted: tasks.length, totalApplicants: applicants, completed });
  } catch (err) { next(err); }
});

module.exports = router;
