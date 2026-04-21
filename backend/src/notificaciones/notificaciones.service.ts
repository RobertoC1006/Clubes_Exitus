import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async getNotificaciones(usuarioId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.notificacion.findMany({
        where: { usuarioId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notificacion.count({ where: { usuarioId } }),
    ]);

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: number) {
    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
  }

  async crear(data: { titulo: string; mensaje: string; tipo: string; usuarioId: number }) {
    try {
      console.log(`[NOTIF-DB] Insertando para usuario ${data.usuarioId}: "${data.titulo}"`);
      const result = await this.prisma.notificacion.create({
        data,
      });
      console.log(`[NOTIF-DB] ✅ Éxito. Record ID: ${result.id}`);
      return result;
    } catch (err) {
      console.error(`[NOTIF-DB] ❌ Error fatal en Prisma.create:`, err);
      throw err; // Relanzar para que el servicio superior lo capture
    }
  }
}
