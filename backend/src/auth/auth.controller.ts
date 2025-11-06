import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Patch, Param, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    console.log('REGISTER REQUEST:', body);
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('logout')
  async logout() {
    // ⚠️ Logout usually doesn’t need a body
    return this.authService.logout();
  }

  @Get('status')
  async checkStatus() {
    return { loggedIn: false, message: 'User not logged in' };
  }

  @Patch('users/:id/role')
  @Roles('admin')
  async setRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.authService.setRole(id, body.role);
  }

  @Get('users')
  @Roles('admin')
  async listUsers() {
    return this.authService.listUsers();
  }
}
