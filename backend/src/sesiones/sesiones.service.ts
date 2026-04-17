import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAsistencia } from '@prisma/client';

@Injectable()
export class SesionesService {
  constructor(private prisma: PrismaService) {}

  async getSesionesByClub(clubId: number) {
      return this.prisma.sesion.findMany({
          where: { clubId },
          orderBy: { fecha: 'desc' }
      });
  }

  async createSesion(clubId: number, fecha: string) {
    return this.prisma.sesion.create({
      data: {
        clubId,
        fecha: new Date(fecha),
      },
    });
  }

  // Permite insertar o actualizar en bloque la asistencia (vital para el offline mode)
  async updateAsistencias(sesionId: number, asistencias: { alumnoId: number, estado: EstadoAsistencia }[]) {
     const promises = asistencias.map((a) => 
       this.prisma.asistencia.upsert({
         where: {
           sesionId_alumnoId: { sesionId, alumnoId: a.alumnoId }
         },
         create: {
           sesionId,
           alumnoId: a.alumnoId,
           estado: a.estado,
         },
         update: {
           estado: a.estado // Si ya existía, lo actualiza a lo nuevo
         }
       })
     );

     await Promise.all(promises);
     return { success: true, guardados: asistencias.length };
  }
}
