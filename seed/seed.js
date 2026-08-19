require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Event = require('../models/Event');

const CATEGORY_DATA = [
  { name: 'Music', description: 'Concerts, festivals, and live performances' },
  { name: 'Tech', description: 'Conferences, hackathons, and meetups' },
  { name: 'Sports', description: 'Tournaments and athletic events' },
];

const seed = async () => {
  await connectDB();

  const admin = await User.findOneAndUpdate(
    { email: 'admin@eventpulse.com' },
    { name: 'EventPulse Admin', email: 'admin@eventpulse.com', password: 'Admin@1234', role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const categories = {};
  for (const cat of CATEGORY_DATA) {
    const doc = await Category.findOneAndUpdate({ name: cat.name }, cat, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    categories[cat.name] = doc;
  }

  const sampleEvents = [
    {
      name: 'Cairo Jazz Night',
      description: 'An evening of live jazz performances in downtown Cairo.',
      category: categories.Music._id,
      city: 'Cairo',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      capacity: 150,
      createdBy: admin._id,
    },
    {
      name: 'DevFest Alexandria',
      description: 'A community-run developer conference covering web and mobile tech.',
      category: categories.Tech._id,
      city: 'Alexandria',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      capacity: 300,
      createdBy: admin._id,
    },
    {
      name: 'Nile Run 10K',
      description: 'A scenic 10K run along the Nile corniche.',
      category: categories.Sports._id,
      city: 'Damietta',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      capacity: 500,
      createdBy: admin._id,
    },
  ];

  for (const ev of sampleEvents) {
    await Event.findOneAndUpdate({ name: ev.name }, ev, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  console.log('[Seed] Admin user: admin@eventpulse.com / Admin@1234');
  console.log(`[Seed] ${CATEGORY_DATA.length} categories and ${sampleEvents.length} events ready.`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
