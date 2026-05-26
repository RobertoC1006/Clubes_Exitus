import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class SesionesService {
  constructor(
    private prisma: PrismaService,
    private notificaciones: NotificacionesService
  ) { }

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
    const now = new Date();
    // Forzar fecha de Perú para determinar qué día es "hoy"
    const peruTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const hoy = new Date(peruTime.getFullYear(), peruTime.getMonth(), peruTime.getDate());

    return this.prisma.sesion.findFirst({
      where: {
        clubId,
        fecha: hoy
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

        if (estadoStr === 'AUSENTE' || estadoStr === 'PRESENTE') {
          const isFalta = estadoStr === 'AUSENTE';
          console.log(`[NOTIF-ASISTENCIA] Detectado ${estadoStr} para alumno ID: ${a.alumnoId}`);

          // Obtener datos del alumno y su padre
          const alumnoData = await this.prisma.alumno.findUnique({
            where: { id: a.alumnoId },
            include: { padre: true }
          });

          if (alumnoData && alumnoData.padreId) {
            await this.notificaciones.crear({
              titulo: isFalta ? 'Alerta de Falta' : 'Confirmación de Asistencia',
              mensaje: isFalta 
                ? `Tu hijo ${alumnoData.nombre} ha faltado hoy al club de ${sesionInfo?.club?.nombre || 'su club'}.`
                : `Tu hijo ${alumnoData.nombre} ha llegado correctamente a su club de ${sesionInfo?.club?.nombre || 'su club'}.`,
              tipo: 'ASISTENCIA',
              usuarioId: alumnoData.padreId
            });
            console.log(`[NOTIF-ASISTENCIA] ✅ Notificación registrada para el padre ID: ${alumnoData.padreId}`);
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

  async validarAsistenciaDocente(data: { clubId: number, aulaId?: number, latitud: number, longitud: number, accuracy?: number, codigoContingencia?: string }) {
    const { clubId, aulaId, latitud, longitud, accuracy, codigoContingencia } = data;
    console.log('[SESIONES-SERVICE] Validando docente:', { clubId, aulaId, latitud, longitud, accuracy, codigoContingencia });

    // PASO 1: Buscar club y determinar el horario de hoy
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new Error('Club no encontrado');

    const now = new Date();
    // Forzar hora de Perú (America/Lima) para determinar el día de la semana
    const peruDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaActual = dias[peruDate.getDay()];

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
    if (!diaKey) throw new BadRequestException(`Hoy (${diaActual}) no hay clases programadas para este club.`);

    const sessionData = Array.isArray(horario[diaKey]) ? horario[diaKey][0] : horario[diaKey];
    if (!sessionData || !sessionData.start) throw new BadRequestException(`No hay horario definido para hoy (${diaActual}).`);

    // PASO 2: Verificar aula asignada para hoy
    const expectedAulaId = sessionData.aulaId;
    if (!expectedAulaId) {
      throw new BadRequestException('No hay un aula asignada para la sesión de hoy. Contacta al administrador.');
    }

    // PASO 3: Buscar el aula del QR escaneado
    let scannedAula;
    if (aulaId) {
      scannedAula = await this.prisma.aula.findUnique({ where: { id: Number(aulaId) } });
    } else if (codigoContingencia) {
      scannedAula = await this.prisma.aula.findFirst({ where: { codigoContingencia } });
    }
    console.log('[SESIONES-SERVICE] Aula escaneada:', scannedAula ? scannedAula.id : 'NINGUNA');

    if (!scannedAula) throw new BadRequestException('Aula no encontrada o código de contingencia inválido');

    // PASO 4: Comparar QR vs aula esperada
    if (scannedAula.id !== Number(expectedAulaId)) {
      throw new BadRequestException('QR Inválido. Este salón no corresponde a la clase programada para hoy.');
    }

    // PASO 5: Validar distancia GPS (dinámico o 10 metros)
    const distancia = this.getDistance(latitud, longitud, scannedAula.latitud, scannedAula.longitud);
    const radioPermitido = scannedAula.radioPermitido || 10; // Radio de la base de datos o 10m por defecto
    console.log(`[GPS-DEBUG] Distancia: ${distancia.toFixed(2)}m | Radio: ${radioPermitido}m | Accuracy del dispositivo: ${accuracy ?? 'N/A'}m`);
    console.log(`[GPS-DEBUG] Coords docente: ${latitud}, ${longitud} | Coords aula: ${scannedAula.latitud}, ${scannedAula.longitud}`);

    const estaCerca = distancia <= radioPermitido;
    if (!estaCerca && (!codigoContingencia || codigoContingencia.toUpperCase() !== scannedAula.codigoContingencia.toUpperCase())) {
      const accuracyMsg = accuracy && accuracy > radioPermitido 
        ? ` (Tu GPS tiene precisión de ±${Math.round(accuracy)}m, intenta en un área abierta o espera unos segundos)` 
        : '';
      throw new BadRequestException(`Fuera de rango: Estás a ${Math.round(distancia)}m del aula. Debes estar a menos de ${radioPermitido}m.${accuracyMsg}`);
    }

    // PASO 6: Crear o buscar sesión de hoy
    let sesion = await this.getSesionHoy(clubId);
    if (!sesion) {
      const fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0, 0);

      sesion = await this.prisma.sesion.create({
        data: { clubId, fecha: fechaHoy },
        include: { asistencias: true }
      });
    }

    if ((sesion as any).asistenciaDocente) {
      return { success: true, message: 'Asistencia ya registrada anteriormente', sesion };
    }

    // PASO 7: Registrar asistencia docente
    let estado: 'PUNTUAL' | 'TARDE' = 'PUNTUAL';
    const [startH, startM] = sessionData.start.split(':').map(Number);
    const startMins = startH * 60 + startM;

    // Obtener hora actual en Perú (UTC-5) para comparar correctamente con el horario
    const peruTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const currentMins = peruTime.getHours() * 60 + peruTime.getMinutes();

    console.log(`[ASISTENCIA-DEBUG] Hora Inicio: ${sessionData.start} (${startMins}m) | Hora Marcaje (PE): ${peruTime.getHours()}:${peruTime.getMinutes()} (${currentMins}m)`);

    // Tolerancia de 5 minutos: si marca a las 11:55 siendo la entrada 11:50, es PUNTUAL.
    if (currentMins > startMins + 5) { 
      estado = 'TARDE'; 
    }

    const sesionActualizada = await this.prisma.sesion.update({
      where: { id: sesion.id },
      data: {
        asistenciaDocente: estado,
        horaMarcajeDocente: now,
        latitudDocente: latitud,
        longitudDocente: longitud,
        aulaId: scannedAula.id
      } as any
    });

    return { success: true, estado, distancia: Math.round(distancia), sesion: sesionActualizada };
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const dPhi = (lat2 - lat1) * Math.PI / 180;
    const dLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
