require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Application = require('./models/Application');

const day = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Task.deleteMany(), Application.deleteMany()]);

  const ngo1 = await User.create({
    name: 'Anita Rao', email: 'ngo@demo.com', password: 'password123', role: 'ngo',
    orgName: 'Asha Kiran Trust', city: 'Adoni', description: 'Education support for children',
  });
  const ngo2 = await User.create({
    name: 'Ravi Kumar', email: 'ngo2@demo.com', password: 'password123', role: 'ngo',
    orgName: 'Green Earth Foundation', city: 'Kurnool', description: 'Community and environment projects',
  });
  await User.create({
    name: 'Shifali', email: 'volunteer@demo.com', password: 'password123',
    role: 'volunteer', skills: ['teaching', 'design', 'tech'],
  });

  const t = (ngo, title, description, category, durationMins, mode, location, d, slots) =>
    ({ ngo: ngo._id, title, description, category, durationMins, mode, location, date: day(d), slotsAvailable: slots });

  await Task.insertMany([
    t(ngo1, 'Teach basic English to Class 5 kids', 'Run a fun 45 minute spoken English session.', 'teaching', 45, 'onsite', 'Adoni', 3, 3),
    t(ngo1, 'Translate a health form to Telugu', 'Translate a one-page government health form.', 'translation', 30, 'online', '', 2, 2),
    t(ngo1, 'Design a poster for a book drive', 'Create an A4 poster using Canva or similar.', 'design', 60, 'online', '', 5, 2),
    t(ngo1, 'Math doubt-solving session', 'Help students with class 8 math doubts over a call.', 'teaching', 40, 'online', '', 4, 4),
    t(ngo2, 'Build a one-page website', 'Simple HTML page for our tree plantation drive.', 'tech', 60, 'online', '', 6, 1),
    t(ngo2, 'Social media banner design', 'Design 3 banners for our cleanliness campaign.', 'design', 45, 'online', '', 3, 2),
    t(ngo2, 'Translate pamphlet to Hindi', 'Translate an awareness pamphlet from English.', 'translation', 30, 'online', '', 7, 2),
    t(ngo2, 'Help organise donation drive', 'Sort and pack clothes at our Kurnool centre.', 'other', 90, 'onsite', 'Kurnool', 8, 5),
  ]);

  console.log('Seeded! Logins (password: password123):');
  console.log('  volunteer@demo.com | ngo@demo.com | ngo2@demo.com');
  process.exit(0);
})();
