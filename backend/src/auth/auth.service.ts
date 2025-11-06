import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: any) {
    const { name, email, password } = body;

    // Check for existing user
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      return { message: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to MongoDB
    // Always set role to 'user' on registration. Admins must promote via admin endpoint.
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    await newUser.save();

    // Optionally sign a token on register
    const payload = { sub: (newUser._id as any).toString(), email: newUser.email, role: newUser.role };
    const token = this.jwtService.sign(payload);

  return { message: 'User registered successfully', user: newUser, token, role: newUser.role };
  }

  async login(body: any) {
    const { email, password } = body;

    const user = await this.userModel.findOne({ email });
    if (!user) return { message: 'User not found' };

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return { message: 'Invalid credentials' };

    // Sign JWT and return
  const payload = { sub: (user._id as any).toString(), email: user.email, role: (user as any).role };
    const token = this.jwtService.sign(payload);

  return { message: 'Login successful', user, token, role: (user as any).role };
  }

  async logout() {
    return { message: 'Logged out successfully!' };
  }

  async setRole(userId: string, role: string) {
    // validate role value
    if (!['user', 'admin'].includes(role)) {
      return { message: 'Invalid role' };
    }
    const user = await this.userModel.findById(userId);
    if (!user) return { message: 'User not found' };
    user.role = role;
    await user.save();
    return { message: 'Role updated', user };
  }

  async listUsers() {
    const users = await this.userModel.find({}, { name: 1, email: 1, role: 1 });
    return users.map((u) => ({ id: (u._id as any).toString(), name: u.name, email: u.email, role: (u as any).role }));
  }
}
