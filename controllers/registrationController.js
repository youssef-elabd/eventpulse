const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const registerForEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError('Event not found.', 404));

  const existing = await Registration.findOne({ user: req.user._id, event: eventId, status: 'active' });
  if (existing) return next(new AppError('You are already registered for this event.', 409));

  if (event.registrationsCount >= event.capacity) {
    return next(new AppError('This event has reached its capacity.', 409));
  }

  const registration = await Registration.create({ user: req.user._id, event: eventId });
  event.registrationsCount += 1;
  await event.save();

  res.status(201).json({ status: 'success', data: { registration } });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id, status: 'active' })
    .populate({ path: 'event', populate: { path: 'category', select: 'name' } })
    .sort('-createdAt');

  res.status(200).json({ status: 'success', results: registrations.length, data: { registrations } });
});

const cancelRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) return next(new AppError('Registration not found.', 404));

  if (!registration.user.equals(req.user._id)) {
    return next(new AppError('You can only cancel your own registration.', 403));
  }

  if (registration.status === 'cancelled') {
    return next(new AppError('This registration is already cancelled.', 400));
  }

  registration.status = 'cancelled';
  await registration.save();

  await Event.findByIdAndUpdate(registration.event, { $inc: { registrationsCount: -1 } });

  res.status(200).json({ status: 'success', message: 'Registration cancelled.' });
});

module.exports = { registerForEvent, getMyRegistrations, cancelRegistration };
