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
          orderBy: { fecha: 'desc' },
          include: {
            asistencias: true
          }
      });
  }

  async getSesionesByProfesor(profesorId: number) {
    return this.prisma.sesion.findMany({
      where: {
        club: { profesorId }
      },
      orderBy: { fecha: 'desc' },
      include: {
        club: { select: { nombre: true } },
        asistencias: true
      },
      take: 20
    });
  }

  async getSesionHoy(clubId: number) {
    const hoyDateStr = new Date().toISOString().split('T')[0];
    const inicioHoy = new Date(`${hoyDateStr}T00:00:00.000Z`);
    const finHoy = new Date(`${hoyDateStr}T23:59:59.999Z`);

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

  async createSesion(clubId: number, fecha: string, asistencias: { alumnoId: number, estado: EstadoAsistencia, observacion?: string }[]) {
     const sesion = await this.prisma.sesion.create({
       data: {
         clubId,
         fecha: new Date(fecha),
       },
     });

     // Guardar asistencias usando la lógica existente de upsert
     await this.updateAsistencias(sesion.id, asistencias);
     
     return sesion;
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

  async validarAsistenciaDocente(data: { clubId: number, aulaId?: number, latitud: number, longitud: number, codigoContingencia?: string }) {
    const { clubId, aulaId, latitud, longitud, codigoContingencia } = data;
    console.log('[SESIONES-SERVICE] Validando docente:', { clubId, aulaId, latitud, longitud, codigoContingencia });
    
    let aula;
    if (aulaId) {
      aula = await this.prisma.aula.findUnique({ where: { id: Number(aulaId) } });
    } else if (codigoContingencia) {
      aula = await this.prisma.aula.findFirst({ where: { codigoContingencia } });
    }
    console.log('[SESIONES-SERVICE] Aula encontrada:', aula ? aula.id : 'NINGUNA');

    if (!aula) throw new Error('Aula no encontrada o código de contingencia inválido');
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new Error('Club no encontrado');
    const distancia = this.getDistance(latitud, longitud, aula.latitud, aula.longitud);
    const estaCerca = distancia <= aula.radioPermitido;
    if (!estaCerca && (!codigoContingencia || codigoContingencia.toUpperCase() !== aula.codigoContingencia.toUpperCase())) {
      throw new Error(`Fuera de rango: Estás a ${Math.round(distancia)}m del aula. El radio permitido es ${aula.radioPermitido}m.`);
    }
    let sesion = await this.getSesionHoy(clubId);
    if (!sesion) {
      sesion = await this.prisma.sesion.create({ 
        data: { clubId, fecha: new Date() },
        include: { asistencias: true }
      });
    }
    if ((sesion as any).asistenciaDocente) {
      return { success: true, message: 'Asistencia ya registrada anteriormente', sesion };
    }
    const now = new Date();
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaActual = dias[now.getDay()];
    let horario: any = club.horario;
    if (typeof horario === 'string') { try { horario = JSON.parse(horario); } catch { horario = {}; } }
    const normalizeDay = (d: string) => {
      const dd = d.toLowerCase();
      if (dd.includes('lun')) return 'Lunes';
      if (dd.includes('mar')) return 'Martes';
      if (dd.includes('mi')) return 'Miércoles';
      if (dd.includes('jue')) return 'Jueves';
      if (dd.includes('vie')) return 'Viernes';
      if (dd.includes('s')) return 'Sábado';
      if (dd.includes('d')) return 'Domingo';
      return d;
    };
    const diaKey = Object.keys(horario).find(k => normalizeDay(k) === diaActual);
    let estado: 'PUNTUAL' | 'TARDE' = 'PUNTUAL';
    if (diaKey) {
      const sessionData = Array.isArray(horario[diaKey]) ? horario[diaKey][0] : horario[diaKey];
      if (sessionData && sessionData.start) {
        const [startH, startM] = sessionData.start.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const currentMins = now.getHours() * 60 + now.getMinutes();
        if (currentMins > startMins) { estado = 'TARDE'; }
      }
    }
    const sesionActualizada = await this.prisma.sesion.update({
      where: { id: sesion.id },
      data: { 
        asistenciaDocente: estado, 
        horaMarcajeDocente: now, 
        latitudDocente: latitud, 
        longitudDocente: longitud, 
        aulaId: aula.id 
      } as any
    });
    return { success: true, estado, distancia: Math.round(distancia), sesion: sesionActualizada };
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI/180;
    const phi2 = lat2 * Math.PI/180;
    const dPhi = (lat2-lat1) * Math.PI/180;
    const dLambda = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dPhi/2) * Math.sin(dPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda/2) * Math.sin(dLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
