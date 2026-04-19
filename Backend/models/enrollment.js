const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
  },
  paymentMethod: {
    type: String,
    enum: ['RAZORPAY', 'UPI', 'COD'],
    default: 'RAZORPAY',
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING_VERIFICATION', 'PENDING', 'FAILED'],
    default: 'PENDING',
  },
  payment: {
    provider: String,
    method: String,
    status: String,
    amount: Number,
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    transactionId: String,
    paidAt: Date,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  attendedSessions: {
    type: Number,
    default: 0,
  },
  totalSessions: Number,
  progress: {
    skillLevel: String,
    notes: String,
    milestones: [{
      title: String,
      date: Date,
      achieved: Boolean,
    }],
  },
  performance: [{
    date: Date,
    metrics: Map,
    feedback: String,
  }],
  coachRating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    ratedAt: Date,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
