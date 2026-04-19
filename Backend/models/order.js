const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  kitchen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
    },
    name: String,
    quantity: Number,
    price: Number,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  userDetails: {
    fullName: String,
    phone: String,
    email: String,
  },
  address: {
    houseNo: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
  },
  deliveryLocation: {
    seatNumber: String,
    section: String,
    venue: String,
  },
  paymentMethod: {
    type: String,
    enum: ['RAZORPAY', 'COD'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'COD', 'PENDING', 'FAILED'],
    default: 'COD',
  },
  payment: {
    provider: String,
    method: String,
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String,
    amount: Number,
    status: String,
    paidAt: Date,
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deliveryStatus: {
    type: String,
    enum: ['unassigned', 'assigned', 'accepted', 'delivered', 'cancelled'],
    default: 'unassigned',
  },
  deliveryTracking: {
    lastLocation: {
      city: String,
      area: String,
      lat: Number,
      lng: Number,
      accuracy: Number,
      updatedAt: Date,
    },
    history: [
      {
        city: String,
        area: String,
        lat: Number,
        lng: Number,
        accuracy: Number,
        updatedAt: Date,
      },
    ],
  },
  deliveryEtaMinutes: Number,
  deliveryEtaUpdatedAt: Date,
  dispatchedAt: Date,
  deliveryAssignedAt: Date,
  deliveryAcceptedAt: Date,
  deliveryChat: [
    {
      senderRole: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      message: String,
      sentAt: { type: Date, default: Date.now },
    },
  ],
  specialInstructions: String,
  orderDate: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: Date,
  preparedAt: Date,
  readyAt: Date,
  deliveredAt: Date,
  rating: {
    food: Number,
    service: Number,
    comment: String,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
