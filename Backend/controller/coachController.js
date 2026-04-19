const Program = require('../models/program');
const Enrollment = require('../models/enrollment');
const User = require('../models/user');
const serverError = require('../utils/serverError');

// Create program (Coach only)
exports.createProgram = async (req, res) => {
  try {
    const program = new Program({
      ...req.body,
      coach: req.user.id,
    });
    await program.save();
    res.status(201).json({ success: true, program });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all programs
exports.getAllPrograms = async (req, res) => {
  try {
    const { sport, level, coach, active } = req.query;
    const filter = {};
    
    if (sport) filter.sport = sport;
    if (level) filter.level = level;
    if (coach) filter.coach = coach;
    if (active === 'true') filter.isActive = true;

    const programs = await Program.find(filter)
      .populate('coach', 'name email coachProfile profileImage')
      .sort({ 'rating.average': -1 });

    const programsWithReviews = await Promise.all(
      programs.map(async (program) => {
        const reviews = await Enrollment.find({
          program: program._id,
          'coachRating.score': { $gte: 1 },
        })
          .populate('user', 'name')
          .select('coachRating user')
          .sort({ 'coachRating.ratedAt': -1, updatedAt: -1 })
          .limit(5)
          .lean();

        const publicReviews = reviews
          .map((item) => ({
            studentName: item.user?.name || 'Student',
            score: item.coachRating?.score,
            feedback: item.coachRating?.feedback,
            ratedAt: item.coachRating?.ratedAt,
          }))
          .filter((item) => Number(item.score) >= 1);

        return {
          ...program.toObject(),
          publicReviews,
        };
      })
    );
    
    res.json({ success: true, programs: programsWithReviews });
  } catch (error) {
    serverError(res, error);
  }
};

// Get single program
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('coach', 'name email coachProfile profileImage');
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    const reviews = await Enrollment.find({
      program: program._id,
      'coachRating.score': { $gte: 1 },
    })
      .populate('user', 'name')
      .select('coachRating user')
      .sort({ 'coachRating.ratedAt': -1, updatedAt: -1 })
      .limit(10)
      .lean();

    const publicReviews = reviews
      .map((item) => ({
        studentName: item.user?.name || 'Student',
        score: item.coachRating?.score,
        feedback: item.coachRating?.feedback,
        ratedAt: item.coachRating?.ratedAt,
      }))
      .filter((item) => Number(item.score) >= 1);

    res.json({ success: true, program: { ...program.toObject(), publicReviews } });
  } catch (error) {
    serverError(res, error);
  }
};

// Get coach's programs
exports.getCoachPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ coach: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, programs });
  } catch (error) {
    serverError(res, error);
  }
};

// Update program
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    if (program.coach.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const ALLOWED_FIELDS = ['title', 'description', 'sport', 'level', 'duration', 'price', 'maxStudents', 'schedule', 'venue', 'images', 'features', 'isActive'];
    ALLOWED_FIELDS.forEach((key) => { if (req.body[key] !== undefined) program[key] = req.body[key]; });
    await program.save();
    
    res.json({ success: true, program });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    if (program.coach.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await program.deleteOne();
    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    serverError(res, error);
  }
};

// Enroll in program
exports.enrollProgram = async (req, res) => {
  try {
    const { programId, startDate, payment } = req.body;
    
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    if (!program.isActive) {
      return res.status(400).json({ success: false, message: 'Program is not active' });
    }
    
    if (program.enrolled >= program.maxStudents) {
      return res.status(400).json({ success: false, message: 'Program is full' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      program: programId,
      status: { $in: ['active', 'paused'] }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this program' });
    }
    
    const enrollment = new Enrollment({
      user: req.user.id,
      program: programId,
      coach: program.coach,
      startDate,
      totalSessions: program.duration.weeks * program.duration.sessionsPerWeek,
      paymentMethod: (payment?.method || 'RAZORPAY').toString().toUpperCase(),
      paymentStatus: (payment?.status || 'PENDING').toString().toUpperCase(),
      payment: payment
        ? {
            ...payment,
            paidAt: payment?.status?.toString().toUpperCase() === 'PAID' ? new Date() : undefined,
          }
        : {
            provider: 'system',
            method: 'RAZORPAY',
            status: 'PENDING',
            amount: Number(program.price || 0),
          },
    });
    
    await enrollment.save();
    
    // Update enrolled count
    program.enrolled += 1;
    await program.save();
    
    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get user's enrollments
exports.getUserEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('program', 'title sport level duration price rating schedule venue')
      .populate('coach', 'name coachProfile profileImage')
      .sort({ enrollmentDate: -1 });
    
    res.json({ success: true, enrollments });
  } catch (error) {
    serverError(res, error);
  }
};

// Get coach profile (current logged-in coach)
exports.getCoachProfile = async (req, res) => {
  try {
    const User = require('../models/user');
    const coach = await User.findById(req.user.id).select('name email phone profileImage coachProfile');

    if (!coach) {
      return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    return res.json({ success: true, coach });
  } catch (error) {
    return serverError(res, error);
  }
};

// Update coach profile (current logged-in coach)
exports.updateCoachProfile = async (req, res) => {
  try {
    const User = require('../models/user');
    const coach = await User.findById(req.user.id);

    if (!coach) {
      return res.status(404).json({ success: false, message: 'Coach not found' });
    }

    const {
      name,
      phone,
      bio,
      experience,
      specialization,
      certifications,
      hourlyRate,
    } = req.body;

    if (name !== undefined) coach.name = name;
    if (phone !== undefined) coach.phone = phone;

    coach.coachProfile = coach.coachProfile || {};
    if (bio !== undefined) coach.coachProfile.bio = bio;
    if (experience !== undefined && experience !== '') coach.coachProfile.experience = Number(experience);
    if (hourlyRate !== undefined && hourlyRate !== '') coach.coachProfile.hourlyRate = Number(hourlyRate);

    const toArray = (val) => {
      if (Array.isArray(val)) return val.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
      if (typeof val === 'string') {
        return val.split(',').map((v) => v.trim()).filter(Boolean);
      }
      return [];
    };

    if (specialization !== undefined) coach.coachProfile.specialization = toArray(specialization);
    if (certifications !== undefined) coach.coachProfile.certifications = toArray(certifications);

    if (req.file?.filename) {
      coach.profileImage = `/uploads/${req.file.filename}`;
    }

    await coach.save();

    return res.json({
      success: true,
      message: 'Coach profile updated successfully',
      coach,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// Get coach's enrollments
exports.getCoachEnrollments = async (req, res) => {
  try {
    const { status, programId } = req.query;
    const filter = { coach: req.user.id };
    
    if (status) filter.status = status;
    if (programId) filter.program = programId;
    
    const enrollments = await Enrollment.find(filter)
      .populate('user', 'name email phone')
      .populate('program', 'title sport level duration')
      .sort({ enrollmentDate: -1 });
    
    res.json({ success: true, enrollments });
  } catch (error) {
    serverError(res, error);
  }
};

// Update enrollment progress (Coach only)
exports.updateEnrollmentProgress = async (req, res) => {
  try {
    const { attendedSessions, progress, performance } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    if (enrollment.coach.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (attendedSessions !== undefined) enrollment.attendedSessions = attendedSessions;
    if (progress) enrollment.progress = { ...enrollment.progress, ...progress };
    if (performance) enrollment.performance.push(performance);
    
    await enrollment.save();
    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Student rates coach through an enrollment
exports.rateCoach = async (req, res) => {
  try {
    const { score, feedback } = req.body || {};
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore) || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({ success: false, message: 'Rating score must be between 1 and 5' });
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this enrollment' });
    }

    enrollment.coachRating = {
      score: numericScore,
      feedback: (feedback || '').toString().trim(),
      ratedAt: new Date(),
    };
    await enrollment.save();

    // Update program rating aggregate
    const programRatings = await Enrollment.find({
      program: enrollment.program,
      'coachRating.score': { $gte: 1 },
    }).select('coachRating.score');

    const programCount = programRatings.length;
    const programAvg = programCount
      ? programRatings.reduce((sum, item) => sum + Number(item.coachRating.score || 0), 0) / programCount
      : 0;

    await Program.findByIdAndUpdate(enrollment.program, {
      $set: {
        'rating.average': Number(programAvg.toFixed(2)),
        'rating.count': programCount,
      },
    });

    // Update coach rating aggregate
    const coachRatings = await Enrollment.find({
      coach: enrollment.coach,
      'coachRating.score': { $gte: 1 },
    }).select('coachRating.score');

    const coachCount = coachRatings.length;
    const coachAvg = coachCount
      ? coachRatings.reduce((sum, item) => sum + Number(item.coachRating.score || 0), 0) / coachCount
      : 0;

    await User.findByIdAndUpdate(enrollment.coach, {
      $set: {
        'coachProfile.rating': Number(coachAvg.toFixed(2)),
      },
    });

    return res.json({
      success: true,
      message: 'Coach rating submitted successfully',
      rating: enrollment.coachRating,
      aggregates: {
        program: { average: Number(programAvg.toFixed(2)), count: programCount },
        coach: { average: Number(coachAvg.toFixed(2)), count: coachCount },
      },
    });
  } catch (error) {
    return serverError(res, error);
  }
};
