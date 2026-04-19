const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  eventType: {
    type: String,
    enum: ['match', 'tournament', 'workshop', 'camp'],
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  // Optional display overrides for venue name/address shown in frontend
  venueName: {
    type: String,
  },
  venueAddress: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  ticketCategories: [{
    name: String,
    price: Number,
    available: Number,
    sold: { type: Number, default: 0 },
  }],
  enabledVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  coaches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  images: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft',
  },
  featuredEvent: {
    type: Boolean,
    default: false,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
