const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user id.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(publicUser(user));
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user id.' });
    const fields = ['name', 'collegeId', 'department', 'semester', 'profileImage', 'bio'];
    const body = req.body || {};
    const updates = Object.fromEntries(fields.filter(field => Object.prototype.hasOwnProperty.call(body, field)).map(field => [field, body[field]]));
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(publicUser(user));
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message });
    if (error.code === 11000) return res.status(409).json({ message: 'College ID is already registered.' });
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, collegeId, password, department, semester } = req.body;
    if (!name || !email || !collegeId || !password) {
      return res.status(400).json({ message: 'Name, email, college ID and password are required.' });
    }
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { collegeId }] });
    if (existing) return res.status(409).json({ message: 'Email or college ID is already registered.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, collegeId, password: hashedPassword, department, semester });
    res.status(201).json({ message: 'Registration successful.', user: publicUser(user) });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    if (error.code === 11000) return res.status(409).json({ message: 'Email or college ID is already registered.' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.json({ message: 'Login successful.', user: publicUser(user) });
  } catch (error) { next(error); }
});

// Password hashes are excluded by the model's default projection.
router.get('/', async (req, res, next) => {
  try { res.json(await User.find().sort({ createdAt: -1 })); }
  catch (error) { next(error); }
});

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    collegeId: user.collegeId,
    department: user.department,
    semester: user.semester,
    profileImage: user.profileImage || '',
    bio: user.bio || '',
    createdAt: user.createdAt
  };
}

module.exports = router;
