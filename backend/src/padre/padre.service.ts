import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PadreService {
  constructor(private prisma: PrismaService) {}

  async getHijos(padreId: number) {
    return this.prisma.alumno.findMany({
      where: { padreId },
      include: {
        inscripciones: {
          include: { club: true }
        }
      }
    });
  }

  async getResumenHijo(alumnoId: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        inscripciones: {
          include: { 
            club: {
                include: {
                    profesor: { select: { nombre: true, apellido: true } }
                }
            }
          }
        }
      }
    });

    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    // 1. Calcular Asistencia por Club
    const clubesResumen = await Promise.all(
      alumno.inscripciones.map(async (ins) => {
        const asistencias = await this.prisma.asistencia.findMany({
          where: { 
            alumnoId, 
            sesion: { clubId: ins.clubId } 
          },
          include: { sesion: true }
        });

        const total = asistencias.length;
        const presentes = asistencias.filter(a => a.estado === 'PRESENTE').length;
        const asistenciaPct = total > 0 ? Math.round((presentes / total) * 100) : 0;

        // Ultimas 5 asistencias para el "mini heatmap" por club
        const ultimas5 = asistencias
          .sort((a, b) => b.sesion.fecha.getTime() - a.sesion.fecha.getTime())
          .slice(0, 5)
          .map(a => a.estado === 'PRESENTE');

        return {
          id: ins.club.id,
          nombre: ins.club.nombre,
          profesor: `${ins.club.profesor.nombre} ${ins.club.profesor.apellido}`,
          asistenciaPct,
          asistencias: ultimas5.reverse() // De más antigua a más nueva
        };
      })
    );

    // 2. Estado de Pagos (Mes actual)
    const mesActual = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());
    const ultimoPago = await this.prisma.pago.findFirst({
      where: { alumnoId },
      orderBy: { id: 'desc' }
    });

    const pagoSummary = {
      estado: ultimoPago?.estado || 'PENDIENTE',
      monto: ultimoPago?.monto ? `S/ ${ultimoPago.monto.toFixed(2)}` : 'S/ 0.00',
      mes: mesActual,
      vencimiento: '30 de ' + mesActual.charAt(0).toUpperCase() + mesActual.slice(1)
    };

    // 3. Logros (Calculados Dinámicamente)
    const totalAsistencias = await this.prisma.asistencia.count({ where: { alumnoId, estado: 'PRESENTE' } });
    const logros: any[] = [];

    if (totalAsistencias >= 1) logros.push({ titulo: 'Primer Paso', desc: 'Asistió a su primera clase', icon: '🎯' });
    if (totalAsistencias >= 5) logros.push({ titulo: 'Constancia', desc: '5 sesiones completadas', icon: '🔥' });
    if (totalAsistencias >= 15) logros.push({ titulo: 'Élite Exitus', desc: '15+ sesiones completadas', icon: '🏆' });
    
    // Logro de "Al Día"
    const todasInscripciones = alumno.inscripciones.map(i => i.clubId);
    const pagosPendientesCount = await this.prisma.pago.count({
      where: { 
        alumnoId, 
        clubId: { in: todasInscripciones },
        estado: { in: ['PENDIENTE', 'RECHAZADO'] }
      }
    });

    if (pagosPendientesCount === 0 && todasInscripciones.length > 0) {
        logros.push({ titulo: 'Socio Responsable', desc: 'Pagos al día', icon: '💎' });
    }

    // 4. Calendario (Sesiones de este mes: Reales + Proyectadas)
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const sesionesReales = await this.prisma.sesion.findMany({
      where: {
        clubId: { in: alumno.inscripciones.map(i => i.clubId) },
        fecha: { gte: inicioMes, lte: finMes }
      },
      include: { club: { select: { nombre: true, horario: true } }, asistencias: { where: { alumnoId } } },
      orderBy: { fecha: 'asc' }
    });

    const calendarioReales = sesionesReales.map(s => ({
      id: s.id,
      fecha: s.fecha,
      club: s.club.nombre,
      tema: s.tema || 'Sesión Realizada',
      asistio: s.asistencias[0]?.estado === 'PRESENTE',
      estado: s.asistencias[0]?.estado || 'PENDIENTE'
    }));

    // Proyectar sesiones futuras basadas en Horario
    const calendarioProyectado: any[] = [];
    const mappingDias: Record<string, number> = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };

    alumno.inscripciones.forEach(ins => {
      const horario = ins.club.horario as any;
      if (!horario) return;

      Object.keys(horario).forEach(diaNombre => {
        const diaIndex = mappingDias[diaNombre];
        if (diaIndex === undefined) return;

        let curr = new Date(hoy);
        curr.setHours(0,0,0,0);
        
        while (curr <= finMes) {
          if (curr.getDay() === diaIndex) {
            const existeReal = sesionesReales.find(s => 
              s.clubId === ins.clubId && 
              s.fecha.toDateString() === curr.toDateString()
            );

            if (!existeReal) {
               calendarioProyectado.push({
                 id: `proj-${ins.clubId}-${curr.getTime()}`,
                 fecha: new Date(curr),
                 club: ins.club.nombre,
                 tema: 'Clase Programada',
                 asistio: false,
                 estado: 'PROGRAMADO'
               });
            }
          }
          curr.setDate(curr.getDate() + 1);
        }
      });
    });

    const calendario = [...calendarioReales, ...calendarioProyectado].sort((a,b) => a.fecha.getTime() - b.fecha.getTime());

    // 5. Avisos Dinámicos
    const avisos: any[] = [];

    // Alertas de faltas recientes (últimas sesiones del mes)
    const faltasRecientes = sesionesReales
      .filter(s => s.asistencias.some(a => a.estado === 'AUSENTE'))
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    faltasRecientes.forEach(f => {
      avisos.push({
        id: `falta-${f.id}`,
        titulo: 'Falta Registrada',
        desc: `No se registró asistencia en ${f.club.nombre} el día ${f.fecha.toLocaleDateString('es-ES')}.`,
        icono: '⚠️',
        tipo: 'alert'
      });
    });

    // Confirmaciones de asistencia recientes
    const presenciasRecientes = sesionesReales
      .filter(s => s.asistencias.some(a => a.estado === 'PRESENTE'))
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 3); // Solo mostrar las últimas 3 presencias

    presenciasRecientes.forEach(p => {
      avisos.push({
        id: `presencia-${p.id}`,
        titulo: 'Asistencia Confirmada',
        desc: `${alumno.nombre} asistió correctamente a ${p.club.nombre} el día ${p.fecha.toLocaleDateString('es-ES')}.`,
        icono: '✅',
        tipo: 'success'
      });
    });

    // Notificaciones de pagos
    if (ultimoPago?.estado === 'PENDIENTE') {
      avisos.push({
        id: 'pago-pend',
        titulo: 'Pago Pendiente',
        desc: `Recuerda regularizar el pago de ${mesActual} para estar al día.`,
        icono: '💳',
        tipo: 'error'
      });
    } else if (ultimoPago?.estado === 'RECHAZADO') {
      avisos.push({
        id: 'pago-rech',
        titulo: 'Pago Rechazado',
        desc: `Tu comprobante de ${ultimoPago.mes} fue rechazado. Revisa las observaciones.`,
        icono: '❌',
        tipo: 'error'
      });
    }

    // Mensaje de motivación si no hay alertas negativas
    if (avisos.length === 0 && totalAsistencias > 0) {
      avisos.push({ 
        id: 1, 
        titulo: '¡Buen trabajo!', 
        desc: `${alumno.nombre} mantiene una asistencia perfecta. ¡Sigue así!`, 
        icono: '✨', 
        tipo: 'info' 
      });
    } else if (avisos.length === 0) {
      avisos.push({ id: 2, titulo: 'Bienvenido', desc: 'Explora tus clubes y mantente al día con tus clases.', icono: '📣', tipo: 'info' });
    }

    // 6. Calcular Racha (Asistencias consecutivas)
    const todasAsistencias = await this.prisma.asistencia.findMany({
      where: { alumnoId },
      include: { sesion: true },
      orderBy: { sesion: { fecha: 'desc' } }
    });

    let racha = 0;
    for (const asis of todasAsistencias) {
      if (asis.estado === 'PRESENTE') {
        racha++;
      } else {
        // Si faltó (AUSENTE) o fue JUSTIFICADO, se rompe la racha de asistencias consecutivas
        break;
      }
    }

    return {
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        grado: alumno.grado,
      },
      clubes: clubesResumen,
      pago: pagoSummary,
      logros: logros.slice(0, 3),
      calendario,
      avisos,
      performance: {
         totalAsistencias,
         racha,
         puntuacion: Math.min(100, (totalAsistencias * 10) + (ultimoPago?.estado === 'PAGADO' ? 20 : 0)),
         nivel: totalAsistencias > 8 ? 'Excelente' : 'Promedio'
      }
    };
  }

  async getPagosHijos(padreId: number) {
    const alumnos = await this.prisma.alumno.findMany({
      where: { padreId },
      include: {
        inscripciones: { include: { club: true } },
        pagos: {
           include: { club: { select: { nombre: true } } },
           orderBy: { creadoEn: 'desc' }
        }
      }
    });

    const mesActual = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date());
    const deudas: any[] = [];
    const historial: any[] = [];

    alumnos.forEach(alumno => {
      // Historial directo
      alumno.pagos.forEach(p => {
        historial.push({
          id: p.id,
          alumno: `${alumno.nombre} ${alumno.apellido}`,
          club: p.club.nombre,
          mes: p.mes,
          monto: p.monto,
          estado: p.estado,
          fecha: p.creadoEn,
          observacion: p.observacion
        });
      });

      // Calcular deudas (Clubes donde no ha pagado el mes actual)
      alumno.inscripciones.forEach(ins => {
        const pagoMes = alumno.pagos.find(p => p.clubId === ins.clubId && p.mes.toLowerCase().includes(mesActual.split(' ')[0].toLowerCase()));
        if (!pagoMes || pagoMes.estado === 'RECHAZADO') {
          deudas.push({
            alumnoId: alumno.id,
            alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
            clubId: ins.club.id,
            clubNombre: ins.club.nombre,
            monto: ins.club.precio,
            mes: mesActual
          });
        }
      });
    });

    return { deudas, historial };
  }
}
