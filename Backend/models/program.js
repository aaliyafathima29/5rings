const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'professional'],
    required: true,
  },
  duration: {
    weeks: Number,
    sessionsPerWeek: Number,
    hoursPerSession: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  maxStudents: {
    type: Number,
    required: true,
  },
  enrolled: {
    type: Number,
    default: 0,
  },
  schedule: [{
    day: String,
    time: String,
  }],
  venue: String,
  images: [String],
  features: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
