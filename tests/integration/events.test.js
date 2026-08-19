process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../app');
const User = require('../../models/User');
const Category = require('../../models/Category');
const generateToken = require('../../utils/generateToken');

let mongoServer;
let adminToken;
let attendeeToken;
let category;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });
  const attendee = await User.create({
    name: 'Attendee',
    email: 'attendee@test.com',
    password: 'password123',
    role: 'attendee',
  });

  adminToken = generateToken(admin);
  attendeeToken = generateToken(attendee);

  category = await Category.create({ name: 'Tech', description: 'Tech events' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Events API', () => {
  let eventId;

  it('creates an event as admin (success case)', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'DevFest',
        description: 'A community developer conference',
        category: category._id.toString(),
        city: 'Cairo',
        date: new Date(Date.now() + 86400000).toISOString(),
        capacity: 100,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.event.name).toBe('DevFest');
    eventId = res.body.data.event._id;
  });

  it('rejects event creation from a non-admin (failure case)', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({
        name: 'Should Fail',
        description: 'x',
        category: category._id.toString(),
        city: 'Cairo',
        date: new Date().toISOString(),
        capacity: 10,
      });

    expect(res.statusCode).toBe(403);
  });

  it('lists events and populates the category', async () => {
    const res = await request(app).get('/api/events');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.events.length).toBeGreaterThan(0);
    expect(res.body.data.events[0].category).toHaveProperty('name');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('filters events by city', async () => {
    const res = await request(app).get('/api/events').query({ city: 'Cairo' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.events.every((e) => e.city === 'Cairo')).toBe(true);
  });

  it('returns 404 for a non-existent event', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/events/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('fail');
  });

  it('returns a 422 validation error for an invalid create payload', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '' });

    expect(res.statusCode).toBe(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
