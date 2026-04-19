const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    zipCode: String,
    country: { type: String, required: true },
  },
  capacity: {
    type: Number,
    required: true,
  },
  facilities: [String],
  seatLayout: {
    type: Map,
    of: {
      category: String,
      rows: Number,
      seatsPerRow: Number,
      priceMultiplier: Number,
    }
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue;
