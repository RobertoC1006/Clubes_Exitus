import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    // Por ahora validación en texto plano según el esquema actual
    if (usuario.password !== password) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    // Retornamos los datos del usuario (sin el password)
    const { password: _, ...result } = usuario;
    return result;
  }
}
