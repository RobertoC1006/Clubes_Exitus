import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = '123456';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dni: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { dni },
    });

    if (!usuario) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    if (usuario.estado !== 'Activado') {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada. Contacta al administrador.');
    }

    if (!usuario.password) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    // 1. Intentar comparar con bcrypt
    let isMatch = false;
    const isHashed = usuario.password.startsWith('$2b$');

    if (isHashed) {
      isMatch = await bcrypt.compare(password, usuario.password);
    } else {
      // 2. Migración silenciosa: Si no está hasheada, comparamos texto plano
      isMatch = usuario.password === password;
      
      if (isMatch) {
        // Encriptamos la contraseña y actualizamos la DB para el futuro
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.usuario.update({
          where: { id: usuario.id },
          data: { password: hashedPassword },
        });
      }
    }

    if (!isMatch) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    // 3. Generar JWT
    const payload = { 
      sub: usuario.id, 
      dni: usuario.dni, 
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    };

    const { password: _, ...userWithoutPassword } = usuario;
    
    return {
      user: {
        ...userWithoutPassword,
        mustChangePassword: password === DEFAULT_PASSWORD && usuario.mustChangePassword,
      },
      access_token: await this.jwtService.signAsync(payload),
    };
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

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { 
        password: hashedPassword, 
        mustChangePassword: false 
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
