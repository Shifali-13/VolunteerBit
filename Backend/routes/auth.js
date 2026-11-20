const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  skills: u.skills,
  orgName: u.orgName,
  city: u.city,
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, skills, orgName, city, description } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!['volunteer', 'ngo'].includes(role || 'volunteer')) {
      return res.status(400).json({ message: 'Role must be volunteer or ngo' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (role === 'ngo' && !orgName) {
      return res.status(400).json({ message: 'Organisation name is required for NGOs' });
    }
    const user = await User.create({
      name, email, password,
      role: role || 'volunteer',
      skills: Array.isArray(skills) ? skills : [],
      orgName, city, description,
    });
    res.status(201).json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
