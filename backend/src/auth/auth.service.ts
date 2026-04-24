import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_PASSWORD = '123456';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(dni: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { dni },
    });

    if (!usuario) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    if (usuario.password !== password) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    // Retornamos todos los datos del usuario (sin el password)
    const { password: _, ...result } = usuario;
    return result;
  }

  async changePassword(userId: number, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }
    if (newPassword === DEFAULT_PASSWORD) {
      throw new BadRequestException('La nueva contraseña no puede ser la contraseña temporal');
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) {
      throw new NotFoundException(`Usuario #${userId} no encontrado`);
    }

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { password: newPassword, mustChangePassword: false },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
