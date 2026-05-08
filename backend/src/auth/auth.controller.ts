import { Controller, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { dni: string; password: string }) {
    return this.authService.login(body.dni, body.password);
  }

  // PATCH /auth/change-password
  // Llamado desde CambiarContrasena.tsx cuando el usuario establece su nueva clave
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Body() body: { userId: number; newPassword: string }) {
    return this.authService.changePassword(body.userId, body.newPassword);
  }
}
