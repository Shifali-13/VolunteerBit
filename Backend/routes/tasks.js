const router = require('express').Router();
const Task = require('../models/Task');
const Application = require('../models/Application');
const { protect, restrictTo } = require('../middleware/auth');

// Browse tasks with filters: ?category=&mode=&maxDuration=&search=
router.get('/', async (req, res, next) => {
  try {
    const { category, mode, maxDuration, search } = req.query;
    const filter = { status: 'open', date: { $gte: new Date() } };
    if (category) filter.category = category;
    if (mode) filter.mode = mode;
    if (maxDuration) filter.durationMins = { $lte: Number(maxDuration) };
    if (search) filter.title = { $regex: search, $options: 'i' };
    const tasks = await Task.find(filter)
      .populate('ngo', 'orgName city')
      .sort({ date: 1 });
    res.json(tasks);
  } catch (err) { next(err); }
});

// "Recommended for you": open tasks whose category matches the volunteer's skills
router.get('/recommended', protect, restrictTo('volunteer'), async (req, res, next) => {
  try {
    const tasks = await Task.find({
      status: 'open',
      date: { $gte: new Date() },
      category: { $in: req.user.skills },
    })
      .populate('ngo', 'orgName city')
      .sort({ date: 1 })
      .limit(6);
    res.json(tasks);
  } catch (err) { next(err); }
});

// NGO: my posted tasks (with applicant counts)
router.get('/mine', protect, restrictTo('ngo'), async (req, res, next) => {
  try {
    const tasks = await Task.find({ ngo: req.user._id }).sort({ createdAt: -1 }).lean();
    for (const t of tasks) {
      t.applicantCount = await Application.countDocuments({ task: t._id });
    }
    res.json(tasks);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('ngo', 'orgName city description');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { next(err); }
});

// NGO: create task
router.post('/', protect, restrictTo('ngo'), async (req, res, next) => {
  try {
    const { title, description, category, durationMins, mode, location, date, slotsAvailable } = req.body;
    if (!title || !description || !durationMins || !date || !slotsAvailable) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    const task = await Task.create({
      ngo: req.user._id,
      title, description, category, durationMins, mode, location, date, slotsAvailable,
    });
    res.status(201).json(task);
  } catch (err) { next(err); }
});

// Volunteer: apply
router.post('/:id/apply', protect, restrictTo('volunteer'), async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'open') {
      return res.status(400).json({ message: 'This task is no longer open' });
    }
    const exists = await Application.findOne({ task: task._id, volunteer: req.user._id });
    if (exists) return res.status(400).json({ message: 'You already applied to this task' });
    const application = await Application.create({ task: task._id, volunteer: req.user._id });
    res.status(201).json(application);
  } catch (err) { next(err); }
});

module.exports = router;
