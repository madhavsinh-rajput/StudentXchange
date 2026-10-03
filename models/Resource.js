const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Study Materials', 'Lab Equipment', 'Calculators', 'Electronics', 'Other']
  },
  price: { type: Number, required: true, min: 0 },
  condition: { type: String, required: true, trim: true },
  department: { type: String, trim: true, default: '' },
  semester: { type: String, trim: true, default: '' },
  sellerName: { type: String, required: true, trim: true },
  sellerEmail: { type: String, required: true, trim: true, lowercase: true },
  image: { type: String, trim: true, default: '' }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Resource', resourceSchema);
