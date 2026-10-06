const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  collegeId: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, select: false },
  department: { type: String, trim: true, default: '' },
  semester: { type: String, trim: true, default: '' },
  profileImage: { type: String, trim: true, default: '' },
  bio: { type: String, trim: true, maxlength: 200, default: '' }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('User', userSchema);
