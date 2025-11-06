import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { UserSchema } from './auth/user.schema';

dotenv.config();

async function seedAdminIfNeeded() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_NAME = process.env.ADMIN_NAME || 'admin';
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo';

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    const User = mongoose.model('User', UserSchema);
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin already exists:', ADMIN_EMAIL);
      return;
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const u = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: 'admin' });
    await u.save();
    console.log('Admin user created from .env:', ADMIN_EMAIL);
  } catch (err) {
    console.error('Failed to seed admin:', err);
  } finally {
    try { await mongoose.disconnect(); } catch (e) {}
  }
}

async function bootstrap() {
  // run seed early so admin exists before app starts
  await seedAdminIfNeeded();

  const app = await NestFactory.create(AppModule);

  // Enable CORS so frontend can call backend
  app.enableCors({
    origin: 'http://localhost:3000', // frontend URL  
    credentials: true,
  });

  await app.listen(8000); // <- Set port to 8000
  console.log('Backend running on http://localhost:8000');
}

bootstrap();

