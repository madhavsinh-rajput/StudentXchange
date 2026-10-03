const express = require('express');
const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const router = express.Router();
const validId = (id) => mongoose.isValidObjectId(id);

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    for (const field of ['category', 'department', 'semester']) {
      if (req.query[field]) filter[field] = req.query[field];
    }
    if (req.query.search) {
      const search = req.query.search.trim();
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } }
      ];
    }
    res.json(await Resource.find(filter).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid resource id.' });
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json(resource);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid resource id.' });
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json(resource);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid resource id.' });
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json({ message: 'Resource deleted successfully.' });
  } catch (error) { next(error); }
});

module.exports = router;
