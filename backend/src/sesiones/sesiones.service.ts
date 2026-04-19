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

  async getSesionById(id: number) {
    return this.prisma.sesion.findUnique({
      where: { id },
      include: {
        asistencias: {
          include: {
            alumno: true
          }
        },
        club: true
      }
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

  // Permite insertar o actualizar en bloque la asistencia y el tema de la sesión
  async updateAsistencias(sesionId: number, asistencias: { alumnoId: number, estado: EstadoAsistencia, observacion?: string }[], tema?: string) {
     // 1. Actualizar el tema de la sesión si viene
     if (tema !== undefined) {
       await this.prisma.sesion.update({
         where: { id: sesionId },
         data: { tema }
       });
     }

     const promises = asistencias.map(async (a) => {
       const res = await this.prisma.asistencia.upsert({
         where: {
           sesionId_alumnoId: { sesionId, alumnoId: a.alumnoId }
         },
         create: {
           sesionId,
           alumnoId: a.alumnoId,
           estado: a.estado,
           observacion: a.observacion
         },
         update: {
           estado: a.estado,
           observacion: a.observacion
         }
       });

       // 🔔 Opción A: Si es AUSENTE, se dispara la lógica de notificación
       if (a.estado === 'AUSENTE') {
         await this.notificarAusencia(a.alumnoId, sesionId);
       }

       return res;
     });

     await Promise.all(promises);
     return { success: true, guardados: asistencias.length };
  }

  // 📧 Simulador de Notificaciones Automáticas
  private async notificarAusencia(alumnoId: number, sesionId: number) {
    const data = await this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: { 
        padre: true,
        inscripciones: { include: { club: true }, take: 1 } 
      }
    });

    if (data && data.padre?.email) {
      const clubNombre = data.inscripciones[0]?.club?.nombre || 'su club';
      console.log(`[LOG-NOTIFICACION] Enviando alerta a ${data.padre.email}: 
        "Hola ${data.padre.nombre}, te informamos que ${data.nombre} marcó AUSENTE hoy en el club de ${clubNombre}."`);
      // Aquí se integraría SendGrid / WhatsApp API en el futuro.
    }
  }
}
