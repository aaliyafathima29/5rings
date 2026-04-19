const Event = require('../models/event');
const Venue = require('../models/venue');
const Ticket = require('../models/ticket');
const serverError = require('../utils/serverError');
const { generateTicketQr } = require('../utils/qr');
const { buildTicketPdf } = require('../utils/pdf');

// Create Event (Event Organizer only)
exports.createEvent = async (req, res) => {
  try {
    // Check if venue exists, if not create a default one
    let venueId = req.body.venue;
    
    // If no venue or default, create/find default venue
    if (!venueId || venueId === 'default' || venueId === '') {
      // Check if default venue exists
      let defaultVenue = await Venue.findOne({ name: 'Main Stadium' });
      
      if (!defaultVenue) {
        console.log('Creating default venue...');
        // Create default venue
        defaultVenue = await Venue.create({
          name: 'Main Stadium',
          address: {
            street: '123 Sports Ave',
            city: 'Sports City',
            state: 'SC',
            zipCode: '12345',
            country: 'USA',
          },
          capacity: 1000,
          facilities: ['Parking', 'Restrooms', 'Food Court'],
          createdBy: req.user.id,
        });
        console.log('Default venue created:', defaultVenue._id);
      } else {
        console.log('Using existing default venue:', defaultVenue._id);
      }
      venueId = defaultVenue._id;
    }
    
    // Create event with valid venue ObjectId
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      sport: req.body.sport,
      eventType: req.body.eventType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      ticketCategories: req.body.ticketCategories,
      status: req.body.status || 'draft',
      venue: venueId,
      organizer: req.user.id,
      images: req.body.images || [], // Added to support image uploads
      // Optional display overrides for venue details on the frontend
      venueName: req.body.venueName,
      venueAddress: req.body.venueAddress,
    };
    
    const event = new Event(eventData);
    await event.save();
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { sport, eventType, status, featured } = req.query;
    const filter = {};
    
    if (sport) filter.sport = sport;
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (featured === 'true') filter.featuredEvent = true;

    const events = await Event.find(filter)
      .populate('organizer', 'name email organizerProfile')
      .populate('venue')
      .sort({ startDate: 1 });
    
    res.json({ success: true, events });
  } catch (error) {
    serverError(res, error);
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email organizerProfile')
      .populate('venue')
      .populate('coaches', 'name coachProfile');
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, event });
  } catch (error) {
    serverError(res, error);
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }
    
    const ALLOWED_FIELDS = [
      'title',
      'description',
      'sport',
      'eventType',
      'startDate',
      'endDate',
      'status',
      'ticketCategories',
      'enabledVendors',
      'coaches',
      'images',
      'venueName',
      'venueAddress',
    ];
    ALLOWED_FIELDS.forEach((key) => { if (req.body[key] !== undefined) event[key] = req.body[key]; });
    await event.save();
    
    res.json({ success: true, event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }
    
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    serverError(res, error);
  }
};

// Book ticket
exports.bookTicket = async (req, res) => {
  try {
    const { eventId, category, seatNumber, mealCombo, selectedSeats, payment } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const categories = event.ticketCategories || [];

    const resolveCategory = (requestedCategory) => {
      if (!requestedCategory) return null;
      const normalized = requestedCategory.toString().trim().toLowerCase();

      let found = categories.find((tc) => (tc.name || '').toString().trim().toLowerCase() === normalized);
      if (found) return found;

      if (normalized.includes('vip') || normalized.includes('diamond') || normalized.includes('premium')) {
        found = categories.find((tc) => /vip|diamond|premium/i.test(tc.name || ''));
        if (found) return found;
      }

      if (normalized.includes('normal') || normalized.includes('regular') || normalized.includes('general')) {
        found = categories.find((tc) => /normal|regular|general/i.test(tc.name || ''));
        if (found) return found;
      }

      return null;
    };

    const normalizedMealCombo = {
      included: !!mealCombo,
      items: [],
    };

    const normalizedMethod = (payment?.method || payment?.provider || 'RAZORPAY').toString().toUpperCase();
    const paymentMethod = normalizedMethod.includes('UPI') ? 'UPI' : 'RAZORPAY';
    const paymentStatus = (payment?.status || (paymentMethod === 'UPI' ? 'PENDING_VERIFICATION' : 'PAID')).toString().toUpperCase();
    const normalizedPayment = payment
      ? {
        ...payment,
        method: paymentMethod,
        status: paymentStatus,
      }
      : {
        method: paymentMethod,
        status: paymentStatus,
      };

    // Multi-seat booking flow
    if (Array.isArray(selectedSeats) && selectedSeats.length > 0) {
      const perCategoryCounts = {};
      const ticketPayloads = [];
      let totalBookingRevenue = 0;

      for (const seat of selectedSeats) {
        const resolvedCategory = resolveCategory(seat.category || category);
        if (!resolvedCategory) {
          return res.status(400).json({ success: false, message: `Invalid ticket category for seat ${seat.seatNumber || ''}`.trim() });
        }

        const categoryName = resolvedCategory.name;
        perCategoryCounts[categoryName] = (perCategoryCounts[categoryName] || 0) + 1;

        const nextSold = resolvedCategory.sold + perCategoryCounts[categoryName];
        if (nextSold > resolvedCategory.available) {
          return res.status(400).json({ success: false, message: `Tickets sold out for category ${categoryName}` });
        }

        const ticketPrice = Number(seat.price) > 0 ? Number(seat.price) : resolvedCategory.price;
        totalBookingRevenue += ticketPrice;

        const qrCode = await generateTicketQr({
          eventId,
          userId: req.user.id,
          seatNumber: seat.seatNumber || seatNumber,
          category: categoryName,
          price: ticketPrice,
        });

        ticketPayloads.push({
          event: eventId,
          user: req.user.id,
          category: categoryName,
          seatNumber: seat.seatNumber || seatNumber,
          price: ticketPrice,
          qrCode,
          mealCombo: normalizedMealCombo,
          paymentMethod,
          paymentStatus,
          payment: normalizedPayment,
        });
      }

      const tickets = await Ticket.insertMany(ticketPayloads);

      Object.keys(perCategoryCounts).forEach((categoryName) => {
        const tc = categories.find((c) => c.name === categoryName);
        if (tc) tc.sold += perCategoryCounts[categoryName];
      });

      event.totalRevenue += totalBookingRevenue;
      await event.save();

      return res.status(201).json({ success: true, ticket: tickets[0], tickets });
    }

    // Backward-compatible single ticket flow
    const ticketCategory = resolveCategory(category);
    if (!ticketCategory) {
      return res.status(400).json({ success: false, message: 'Invalid ticket category' });
    }

    if (ticketCategory.available <= ticketCategory.sold) {
      return res.status(400).json({ success: false, message: 'Tickets sold out for this category' });
    }

    const qrCode = await generateTicketQr({
      eventId,
      userId: req.user.id,
      seatNumber,
      category: ticketCategory.name,
      price: ticketCategory.price,
    });

    const ticket = new Ticket({
      event: eventId,
      user: req.user.id,
      category: ticketCategory.name,
      seatNumber,
      price: ticketCategory.price,
      qrCode,
      mealCombo: normalizedMealCombo,
      paymentMethod,
      paymentStatus,
      payment: normalizedPayment,
    });

    await ticket.save();

    ticketCategory.sold += 1;
    event.totalRevenue += ticketCategory.price;
    await event.save();

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get user's tickets
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event', 'title sport startDate endDate venue')
      .sort({ bookingDate: -1 });
    
    res.json({ success: true, tickets });
  } catch (error) {
    serverError(res, error);
  }
};

// Download ticket PDF
exports.getTicketPdf = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.user?._id?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this ticket' });
    }

    const doc = buildTicketPdf({
      ticket,
      event: ticket.event,
      user: ticket.user,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket._id}.pdf"`);

    doc.pipe(res);
  } catch (error) {
    serverError(res, error);
  }
};

// Get organizer's events
exports.getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .populate('venue')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, events });
  } catch (error) {
    serverError(res, error);
  }
};
