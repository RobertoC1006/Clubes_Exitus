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
        const asistenciaPct = total > 0 ? Math.round((presentes / total) * 100) : 100;

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

    // 3. Logros (Calculados)
    const totalAsistencias = await this.prisma.asistencia.count({ where: { alumnoId, estado: 'PRESENTE' } });
    const logros: any[] = [];

    if (totalAsistencias >= 1) logros.push({ titulo: 'Primer Paso', desc: 'Asistió a su primera clase', icon: '🎯' });
    if (totalAsistencias >= 5) logros.push({ titulo: 'Constancia', desc: '5 sesiones completadas', icon: '🔥' });
    if (totalAsistencias >= 10) logros.push({ titulo: 'Atleta Pro', desc: 'Más de 10 asistencias', icon: '⚡' });
    
    // Logro de "Al Día"
    if (ultimoPago?.estado === 'PAGADO') {
        logros.push({ titulo: 'Socio de Oro', desc: 'Pagos al día', icon: '💎' });
    }

    // 4. Calendario (Sesiones de este mes para todos sus clubes)
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0,0,0,0);

    const todasSesiones = await this.prisma.sesion.findMany({
      where: {
        clubId: { in: alumno.inscripciones.map(i => i.clubId) },
        fecha: { gte: inicioMes }
      },
      include: { club: { select: { nombre: true } }, asistencias: { where: { alumnoId } } },
      orderBy: { fecha: 'asc' }
    });

    const calendario = todasSesiones.map(s => ({
      id: s.id,
      fecha: s.fecha,
      club: s.club.nombre,
      tema: s.tema || 'Sesión Programada',
      asistio: s.asistencias[0]?.estado === 'PRESENTE',
      estado: s.asistencias[0]?.estado || 'PENDIENTE'
    }));

    // 5. Avisos Dinámicos
    const avisos = [
      { id: 1, titulo: 'Inscripciones Abiertas', desc: 'Nuevos clubes de Robótica y Ajedrez disponibles.', icono: '📣', tipo: 'info' },
      { id: 2, titulo: 'Cierre de Mes', desc: 'Recuerda subir tus comprobantes antes del 30.', icono: '⏰', tipo: 'alert' }
    ];

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
            monto: 50.00, // Precio sugerido por el usuario
            mes: mesActual
          });
        }
      });
    });

    return { deudas, historial };
  }
}
