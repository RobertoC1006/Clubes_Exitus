import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class SesionesService {
  constructor(
    private prisma: PrismaService,
    private notificaciones: NotificacionesService
  ) {}

  async getSesionesByClub(clubId: number) {
      return this.prisma.sesion.findMany({
          where: { clubId },
          orderBy: { fecha: 'desc' }
      });
  }

  async getSesionHoy(clubId: number) {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    return this.prisma.sesion.findFirst({
      where: {
        clubId,
        fecha: {
          gte: inicioHoy,
          lte: finHoy
        }
      },
      include: {
        asistencias: true
      }
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
     console.log(`[SESIONES-SERVICE] Iniciando guardado para sesión ${sesionId}`);
     
     // 1. Actualizar el tema de la sesión si viene
     if (tema !== undefined) {
       await this.prisma.sesion.update({
         where: { id: sesionId },
         data: { tema }
       });
     }

     // Traer info del club para la notificación
     const sesionInfo = await this.prisma.sesion.findUnique({
       where: { id: sesionId },
       include: { club: true }
     });

     const promises = asistencias.map(async (a) => {
       // A. Guardar asistencia (Upsert)
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

       // B. 🔔 Lógica de Notificación Automática
       try {
         // Comprobación defensiva del estado (para cubrir cualquier desajuste de tipos/valores)
         const estadoStr = String(a.estado).toUpperCase();
         
         if (estadoStr === 'AUSENTE') {
           console.log(`[ALERTA-AUSENCIA] Detectada falta para alumno ID: ${a.alumnoId}`);
           
           // Obtener datos del alumno y su padre de forma inmediata para asegurar persistencia
           const alumnoData = await this.prisma.alumno.findUnique({
             where: { id: a.alumnoId },
             include: { padre: true }
           });

           if (alumnoData && alumnoData.padreId) {
             console.log(`[ALERTA-AUSENCIA] Creando registro para padre ID: ${alumnoData.padreId}`);
             await this.notificaciones.crear({
               titulo: 'Alerta de Falta',
               mensaje: `Tu hijo ${alumnoData.nombre} ha faltado hoy al club de ${sesionInfo?.club?.nombre || 'su club'}.`,
               tipo: 'ASISTENCIA',
               usuarioId: alumnoData.padreId
             });
             console.log(`[ALERTA-AUSENCIA] ✅ Notificación registrada en DB`);
           } else {
             console.log(`[ALERTA-AUSENCIA] ⚠️ Alumno sin padre vinculado. No se puede notificar.`);
           }
         }
       } catch (notifErr) {
         console.error(`[ALERTA-AUSENCIA] ❌ Error crítico al procesar notificación:`, notifErr);
       }

       return res;
     });

     await Promise.all(promises);
     console.log(`[SESIONES-SERVICE] Fin de guardado masivo exitoso.`);
     return { success: true, guardados: asistencias.length };
  }
}
