const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    List events — supports filtering, pagination, sorting, text search
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { category, city, dateFrom, dateTo, search, sort, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(`^${city}$`, 'i');
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }
  if (search) filter.$text = { $search: search };

  let sortBy = '-date'; // default: soonest-created / newest date first is ambiguous, default upcoming first
  if (sort === 'date') sortBy = 'date';
  if (sort === '-date') sortBy = '-date';
  if (sort === 'popularity') sortBy = '-registrationsCount';

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [events, total] = await Promise.all([
    Event.find(filter).populate('category', 'name description').sort(sortBy).skip(skip).limit(limitNum),
    Event.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: events.length,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
    data: { events },
  });
});

const getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('category', 'name description');
  if (!event) return next(new AppError('Event not found.', 404));
  res.status(200).json({ status: 'success', data: { event } });
});

// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ status: 'success', data: { event } });
});

// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name description');
  if (!event) return next(new AppError('Event not found.', 404));
  res.status(200).json({ status: 'success', data: { event } });
});

// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return next(new AppError('Event not found.', 404));
  res.status(204).json({ status: 'success', data: null });
});

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
