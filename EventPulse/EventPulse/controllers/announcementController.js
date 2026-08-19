const Event = require('../models/Event');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Broadcast a live announcement to an event's room and persist it
// @route   POST /api/events/:eventId/announcements
// @access  Private/Admin
const broadcastAnnouncement = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { text } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError('Event not found.', 404));

  const message = await Message.create({ event: eventId, sender: req.user._id, text });
  const populated = await message.populate('sender', 'name');

  const io = req.app.get('io');
  if (io) {
    io.to(`event:${eventId}`).emit('announcement', {
      id: populated._id,
      event: eventId,
      text: populated.text,
      sender: { id: populated.sender._id, name: populated.sender.name },
      createdAt: populated.createdAt,
    });
  }

  res.status(201).json({ status: 'success', data: { message: populated } });
});

// @desc    Get the announcement history of an event
// @route   GET /api/events/:eventId/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError('Event not found.', 404));

  const messages = await Message.find({ event: eventId })
    .populate('sender', 'name')
    .sort('createdAt');

  res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
});

module.exports = { broadcastAnnouncement, getAnnouncements };
