import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { UserSchema } from '../src/auth/user.schema';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'admin';

async function run() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const User = mongoose.model('User', UserSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', ADMIN_EMAIL);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const u = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: 'admin' });
  await u.save();
  console.log('Admin user created:', ADMIN_EMAIL);
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
