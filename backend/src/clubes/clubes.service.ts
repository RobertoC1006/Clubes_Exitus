import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubesService {
  constructor(private prisma: PrismaService) {}

  async getAlumnosByClub(clubId: number) {
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { clubId },
      include: {
        alumno: {
          include: {
            pagos: {
              where: { clubId },
              orderBy: { creadoEn: 'desc' },
              take: 1
            }
          }
        },
      },
    });
    
    // Retorna una lista con la info del último pago inyectada
    return inscripciones.map((ins) => ({
      ...ins.alumno,
      estadoPago: ins.alumno.pagos[0]?.estado || 'PENDIENTE'
    }));
  }

  // 🔹 Obtener TODOS los clubes con inscritos y profesor (para el Dashboard)
  async getAllClubes() {
    return this.prisma.club.findMany({
      include: {
        profesor: { select: { nombre: true, apellido: true } },
        _count: { select: { inscripciones: true } }
      },
      orderBy: { id: 'asc' }
    });
  }

  // 🔹 Obtener clubes de un profesor específico
  async getClubesDeProfesor(profesorId: number) {
    return this.prisma.club.findMany({
      where: { profesorId },
      include: {
        profesor: { select: { nombre: true, apellido: true } },
        _count: {
          select: { inscripciones: true }
        }
      }
    });
  }

  // 🔹 NUEVO: Agregar un nuevo alumno y matricularlo al instante en el club
  async addAlumnoToClub(clubId: number, data: { nombre: string, apellido: string, grado: string }) {
    const nuevoAlumno = await this.prisma.alumno.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        grado: data.grado,
      }
    });

    await this.prisma.inscripcion.create({
      data: {
        alumnoId: nuevoAlumno.id,
        clubId: clubId
      }
    });

    return nuevoAlumno;
  }

  // 🔹 Obtener métricas dinámicas para el dashboard del profesor
  async getProfesorDashboard(profesorId: number) {
    const ahora = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(ahora.getDate() - 30);

    // 1. Clubes del profesor
    const clubes = await this.prisma.club.findMany({
      where: { profesorId },
      include: {
        _count: { select: { inscripciones: true } },
        sesiones: {
          where: { fecha: { gte: hace30Dias } },
          include: { asistencias: true }
        }
      }
    });

    // 2. Alumnos únicos (Total Atletas)
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { club: { profesorId } }
    });
    const totalAtletas = new Set(inscripciones.map(i => i.alumnoId)).size;

    // 3. Nuevos Ingresos (Últimos 30 días)
    const nuevosIngresos = await this.prisma.inscripcion.count({
      where: { 
        club: { profesorId },
        fechaInscripcion: { gte: hace30Dias }
      }
    });

    // 4. Asistencia Media Mensual
    let totalPresentes = 0;
    let totalEsperados = 0;
    
    clubes.forEach(club => {
      club.sesiones.forEach(sesion => {
        totalPresentes += sesion.asistencias.filter(a => a.estado === 'PRESENTE').length;
        totalEsperados += sesion.asistencias.length;
      });
    });

    const asistenciaPct = totalEsperados > 0 
      ? Math.round((totalPresentes / totalEsperados) * 100) 
      : 0;

    // 5. Cálculo de Racha (Basado en últimas sesiones > 70% asistencia)
    const ultimasSesiones = await this.prisma.sesion.findMany({
      where: { club: { profesorId } },
      orderBy: { fecha: 'desc' },
      take: 10,
      include: { asistencias: true }
    });

    let racha = 0;
    for (const s of ultimasSesiones) {
      const presentes = s.asistencias.filter(a => a.estado === 'PRESENTE').length;
      const total = s.asistencias.length;
      if (total > 0 && (presentes / total) >= 0.7) {
        racha++;
      } else if (total > 0) {
        break; // Se rompe la racha
      }
    }

    // 6. Faltas Críticas (Alumnos con 2 ausencias seguidas en el mismo club)
    const alertas: any[] = [];
    for (const club of clubes) {
      const ultimas3Sesiones = await this.prisma.sesion.findMany({
        where: { clubId: club.id },
        orderBy: { fecha: 'desc' },
        take: 3,
        include: { asistencias: { include: { alumno: true } } }
      });

      if (ultimas3Sesiones.length >= 2) {
        const idsAlumnosInscritos = (await this.prisma.inscripcion.findMany({
          where: { clubId: club.id },
          select: { alumnoId: true }
        })).map(i => i.alumnoId);

        for (const alumnoId of idsAlumnosInscritos) {
          const inasistencias = ultimas3Sesiones.filter(s => 
            s.asistencias.find(a => a.alumnoId === alumnoId && a.estado === 'AUSENTE')
          ).length;

          if (inasistencias >= 1) {
            const alumno = await this.prisma.alumno.findUnique({ where: { id: alumnoId } });
            if (alumno && !alertas.find(a => a.alumnoId === alumnoId)) {
                alertas.push({
                    id: `falta-${alumnoId}`,
                    alumnoId,
                    titulo: 'Falta Registrada',
                    desc: `${alumno.nombre} ${alumno.apellido} tuvo una falta en su última sesión de ${club.nombre}.`,
                    tipo: 'danger'
                });
            }
          }
        }
      }
    }

    return {
      metricas: {
        totalAtletas,
        asistenciaPct,
        nuevosIngresos,
        racha
      },
      alertas
    };
  }
}
