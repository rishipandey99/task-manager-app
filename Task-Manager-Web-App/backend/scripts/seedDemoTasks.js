/**
 * Seeds demo tasks (from UI reference). Idempotent: skips titles that already exist for the user.
 * Usage: npm run seed:tasks   (or: node backend/scripts/seedDemoTasks.js)
 * Optional env: SEED_USER_EMAIL (default mike@timetoprogram.com), MONGO_URI
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const TASKS = [
  {
    title: 'Develop Product Review System',
    description: '',
    status: 'pending',
    priority: 'low',
    progressDone: 0,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:00:00.000Z'),
  },
  {
    title: 'Build Feedback Form Module',
    description: '',
    status: 'pending',
    priority: 'high',
    progressDone: 0,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:05:00.000Z'),
  },
  {
    title: 'Implement Notification System',
    description: '',
    status: 'pending',
    priority: 'low',
    progressDone: 0,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:10:00.000Z'),
  },
  {
    title: 'Migrate Database to MongoDB Atlas',
    description: '',
    status: 'completed',
    priority: 'medium',
    progressDone: 5,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:15:00.000Z'),
  },
  {
    title: 'Develop Expense Tracker Module',
    description: '',
    status: 'pending',
    priority: 'low',
    progressDone: 0,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:20:00.000Z'),
  },
  {
    title: 'Design Homepage Banner',
    description: '',
    status: 'pending',
    priority: 'medium',
    progressDone: 0,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:25:00.000Z'),
  },
  {
    title: 'Write Technical Documentation',
    description: '',
    status: 'pending',
    priority: 'medium',
    progressDone: 0,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:30:00.000Z'),
  },
  {
    title: 'Develop User Authentication System',
    description: '',
    status: 'in_progress',
    priority: 'high',
    progressDone: 2,
    progressTotal: 5,
    createdAt: new Date('2025-03-17T10:35:00.000Z'),
  },
  {
    title: 'Design Homepage',
    description:
      'Create a clean and modern homepage layout using Tailwind CSS. Ensure the design is responsive and accessible.',
    status: 'in_progress',
    priority: 'high',
    progressDone: 2,
    progressTotal: 5,
    startDate: new Date('2025-03-16T00:00:00.000Z'),
    dueDate: new Date('2025-03-31T00:00:00.000Z'),
    createdAt: new Date('2025-03-16T09:00:00.000Z'),
  },
  {
    title: 'Write Blog Post',
    description:
      'Write an informative blog post about React performance optimization. Cover techniques like memoization and lazy loading.',
    status: 'in_progress',
    priority: 'medium',
    progressDone: 2,
    progressTotal: 5,
    startDate: new Date('2025-03-16T00:00:00.000Z'),
    dueDate: new Date('2025-03-27T00:00:00.000Z'),
    createdAt: new Date('2025-03-16T09:30:00.000Z'),
  },
  {
    title: 'API Integration for Dashboard',
    description:
      'Implement API integration for the user dashboard. Ensure data fetching is efficient and includes proper error handling.',
    status: 'pending',
    priority: 'high',
    progressDone: 0,
    progressTotal: 5,
    startDate: new Date('2025-03-16T00:00:00.000Z'),
    dueDate: new Date('2025-04-05T00:00:00.000Z'),
    createdAt: new Date('2025-03-16T10:00:00.000Z'),
  },
  {
    title: 'Product Catalog Update',
    description:
      'Update the product catalog with new categories and revised listings. Ensure descriptions are concise yet complete.',
    status: 'pending',
    priority: 'low',
    progressDone: 0,
    progressTotal: 5,
    startDate: new Date('2025-03-16T00:00:00.000Z'),
    dueDate: new Date('2025-04-08T00:00:00.000Z'),
    createdAt: new Date('2025-03-16T10:30:00.000Z'),
  },
  {
    title: 'Social Media Campaign',
    description:
      'Develop a content plan for the upcoming product launch. Create visually appealing designs with engaging copy.',
    status: 'pending',
    priority: 'medium',
    progressDone: 0,
    progressTotal: 3,
    startDate: new Date('2025-03-16T00:00:00.000Z'),
    dueDate: new Date('2025-04-12T00:00:00.000Z'),
    createdAt: new Date('2025-03-16T11:00:00.000Z'),
  },
  {
    title: 'Develop Authentication System',
    description:
      'Implement secure authentication for the platform. Include features like user registration, login, and session management.',
    status: 'pending',
    priority: 'high',
    progressDone: 0,
    progressTotal: 5,
    startDate: new Date('2025-03-16T00:00:00.000Z'),
    dueDate: new Date('2025-04-30T00:00:00.000Z'),
    createdAt: new Date('2025-03-16T11:30:00.000Z'),
  },
];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const emailTarget = (process.env.SEED_USER_EMAIL || 'mike@timetoprogram.com').toLowerCase().trim();
  let user = await User.findOne({ email: emailTarget });

  if (!user) {
    user = await User.findOne();
  }

  if (!user) {
    user = await User.create({
      name: 'Mike',
      email: 'mike@timetoprogram.com',
      password: 'password123',
    });
    console.log('Created demo user mike@timetoprogram.com (password: password123)');
  } else if (user.email !== emailTarget && process.env.SEED_USER_EMAIL) {
    console.warn(`User ${emailTarget} not found; seeding tasks for ${user.email} instead.`);
  }

  let added = 0;
  let skipped = 0;

  for (const row of TASKS) {
    const exists = await Task.findOne({ user: user._id, title: row.title });
    if (exists) {
      skipped += 1;
      continue;
    }

    const { createdAt, ...rest } = row;
    await Task.create({
      ...rest,
      user: user._id,
      createdAt,
    });
    added += 1;
  }

  console.log(`Done. User: ${user.email}. Added ${added} tasks, skipped ${skipped} (already present).`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
