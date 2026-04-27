import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificaciones: NotificacionesService
  ) {}

  // ============================================================
  // MÉTRICAS GLOBALES (Dashboard)
  // ============================================================
  async getMetricas() {
    const [totalAlumnos, totalClubes, totalProfesores, todasAsistencias, alertasBase] =
      await Promise.all([
        this.prisma.alumno.count(),
        this.prisma.club.count(),
        this.prisma.usuario.count({ where: { rol: 'PROFESOR' } }),
        this.prisma.asistencia.groupBy({
          by: ['estado'],
          _count: { estado: true },
        }),
        // Alumnos con al menos 1 falta (AUSENTE) en los últimos 30 días
        this.prisma.asistencia.groupBy({
          by: ['alumnoId'],
          where: {
            estado: 'AUSENTE',
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          _count: { alumnoId: true },
          having: { alumnoId: { _count: { gte: 1 } } },
          orderBy: { _count: { alumnoId: 'desc' } },
          take: 5,
        }),
      ]);

    const presentes = todasAsistencias.find((a) => a.estado === 'PRESENTE')?._count.estado ?? 0;
    const total = todasAsistencias.reduce((sum, a) => sum + a._count.estado, 0);
    const asistenciaGlobal = total > 0 ? Math.round((presentes / total) * 100) : 0;

    // Enriquecer alertas con datos del alumno
    const alertasConNombre = await Promise.all(
      alertasBase.map(async (a) => {
        const alumno = await this.prisma.alumno.findUnique({
          where: { id: a.alumnoId },
          include: { inscripciones: { include: { club: true }, take: 1 } },
        });
        return {
          alumno: `${alumno?.nombre} ${alumno?.apellido}`,
          club: alumno?.inscripciones[0]?.club?.nombre ?? 'Sin club',
          faltas: a._count.alumnoId,
        };
      }),
    );

    // Clubes con métricas de asistencia
    const clubesRaw = await this.prisma.club.findMany({
      include: {
        profesor: { select: { nombre: true, apellido: true } },
        _count: { select: { inscripciones: true } },
        sesiones: {
          include: {
            asistencias: { select: { estado: true } },
          },
        },
      },
    });

    const clubesConAsistencia = clubesRaw.map((club) => {
      const todasLasAsistencias = club.sesiones.flatMap((s) => s.asistencias);
      const pres = todasLasAsistencias.filter((a) => a.estado === 'PRESENTE').length;
      const tot = todasLasAsistencias.length;
      return {
        id: club.id,
        nombre: club.nombre,
        descripcion: club.descripcion,
        precio: club.precio,
        profesorId: club.profesorId,
        profesor: `${club.profesor.nombre} ${club.profesor.apellido}`,
        inscritos: club._count.inscripciones,
        asistencia: tot > 0 ? Math.round((pres / tot) * 100) : 0,
        horario: club.horario,
      };
    });

    // RANKINGS DE ASISTENCIA (Rankings de Alumnos por Estado)
    const [asistenciasRank, ausenciasRank, justificadosRank] = await Promise.all([
      this.prisma.asistencia.groupBy({
        by: ['alumnoId'],
        where: { estado: 'PRESENTE' },
        _count: { alumnoId: true },
        orderBy: { _count: { alumnoId: 'desc' } },
        take: 10,
      }),
      this.prisma.asistencia.groupBy({
        by: ['alumnoId'],
        where: { estado: 'AUSENTE' },
        _count: { alumnoId: true },
        orderBy: { _count: { alumnoId: 'desc' } },
        take: 10,
      }),
      this.prisma.asistencia.groupBy({
        by: ['alumnoId'],
        where: { estado: 'JUSTIFICADO' },
        _count: { alumnoId: true },
        orderBy: { _count: { alumnoId: 'desc' } },
        take: 10,
      }),
    ]);

    const getRankData = async (rank: any[]) => {
      return Promise.all(
        rank.map(async (r) => {
          const alumno = await this.prisma.alumno.findUnique({
            where: { id: r.alumnoId },
            include: { inscripciones: { include: { club: true }, take: 1 } },
          });
          return {
            alumno: `${alumno?.nombre} ${alumno?.apellido}`,
            club: alumno?.inscripciones[0]?.club?.nombre ?? 'Sin club',
            cuenta: r._count.alumnoId,
          };
        }),
      );
    };

    const rankingAsistencias = await getRankData(asistenciasRank);
    const rankingAusencias = await getRankData(ausenciasRank);
    const rankingJustificaciones = await getRankData(justificadosRank);

    return {
      totalAlumnos,
      totalClubes,
      totalProfesores,
      asistenciaGlobal,
      clubes: clubesConAsistencia,
      alertas: alertasConNombre,
      rankingAsistencias,
      rankingAusencias,
      rankingJustificaciones,
    };
  }

  // ============================================================
  // CRUD DE CLUBES
  // ============================================================
  async getClubes() {
    return this.prisma.club.findMany({
      include: {
        profesor: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { inscripciones: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async createClub(data: { nombre: string; descripcion?: string; precio?: number; profesorId: number; horario?: any }) {
    return this.prisma.club.create({
      data,
      include: { profesor: { select: { nombre: true, apellido: true } } },
    });
  }

  async updateClub(id: number, data: { nombre?: string; descripcion?: string; precio?: number; profesorId?: number; horario?: any }) {
    const exists = await this.prisma.club.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Club #${id} no encontrado`);
    return this.prisma.club.update({
      where: { id },
      data,
      include: { profesor: { select: { nombre: true, apellido: true } } },
    });
  }

  async deleteClub(id: number) {
    const exists = await this.prisma.club.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Club #${id} no encontrado`);
    // Eliminar registros dependientes primero
    await this.prisma.asistencia.deleteMany({
      where: { sesion: { clubId: id } },
    });
    await this.prisma.sesion.deleteMany({ where: { clubId: id } });
    await this.prisma.inscripcion.deleteMany({ where: { clubId: id } });
    await this.prisma.pago.deleteMany({ where: { clubId: id } });
    return this.prisma.club.delete({ where: { id } });
  }

  // ============================================================
  // PROFESORES / USUARIOS
  // ============================================================
  async getProfesores() {
    return this.prisma.usuario.findMany({
      where: { rol: 'PROFESOR' },
      include: {
        clubes: {
          select: {
            id: true,
            nombre: true,
            horario: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async getUsuarios() {
    return this.prisma.usuario.findMany({
      select: { id: true, nombre: true, apellido: true, email: true, rol: true, dni: true, celular: true, estado: true },
      orderBy: [{ rol: 'asc' }, { nombre: 'asc' }],
    });
  }

  async createUsuario(data: { nombre: string; apellido: string; email?: string; rol: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'; dni?: string; celular?: string }) {
    if (data.email) {
      const existe = await this.prisma.usuario.findUnique({ where: { email: data.email } });
      if (existe) throw new ConflictException(`El email ${data.email} ya está registrado`);
    }
    if (data.dni) {
      const existe = await this.prisma.usuario.findUnique({ where: { dni: data.dni } });
      if (existe) throw new ConflictException(`El DNI ${data.dni} ya está registrado`);
    }
    // La contraseña siempre es la default — el frontend no puede enviarla
    return this.prisma.usuario.create({
      data: { ...data, password: '123456', mustChangePassword: true, estado: 'Activado' },
      select: { id: true, nombre: true, apellido: true, email: true, rol: true, dni: true, celular: true, estado: true },
    });
  }

  async updateUsuario(id: number, data: { nombre?: string; apellido?: string; email?: string; rol?: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'; dni?: string; celular?: string }) {
    const existe = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, apellido: true, email: true, rol: true, dni: true, celular: true, estado: true },
    });
  }

  async resetPassword(id: number) {
    const existe = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Usuario #${id} no encontrado`);
    await this.prisma.usuario.update({
      where: { id },
      data: { password: '123456', mustChangePassword: true },
    });
    return { message: `Contraseña de ${existe.nombre} ${existe.apellido} reseteada correctamente` };
  }

  async toggleUsuarioStatus(id: number, estado: string) {
    const existe = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return this.prisma.usuario.update({
      where: { id },
      data: { estado },
      select: { id: true, nombre: true, apellido: true, email: true, rol: true, dni: true, celular: true, estado: true },
    });
  }

  async deleteUsuario(id: number) {
    const existe = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return this.prisma.usuario.delete({ where: { id } });
  }

  async asignarProfesor(clubId: number, profesorId: number) {
    return this.prisma.club.update({
      where: { id: clubId },
      data: { profesorId },
      include: { profesor: { select: { nombre: true, apellido: true } } },
    });
  }

  // ============================================================
  // ALUMNOS
  // ============================================================
  async getAlumnos() {
    return this.prisma.alumno.findMany({
      include: {
        padre: { select: { nombre: true, apellido: true } },
        inscripciones: { include: { club: { select: { nombre: true } } } },
        _count: { select: { asistencias: true } },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
  }

  async createAlumno(data: { nombre: string; apellido: string; grado: string; padreId?: number; clubIds?: number[] }) {
    const { clubIds, ...alumnoData } = data;
    const alumno = await this.prisma.alumno.create({
      data: alumnoData,
      include: { padre: { select: { nombre: true, apellido: true } } },
    });

    if (clubIds && clubIds.length > 0) {
      await Promise.all(
        clubIds.map(async (clubId) => {
          await this.prisma.inscripcion.create({
            data: { alumnoId: alumno.id, clubId },
          });
          await this.notificarInscripcion(alumno.id, clubId);
        }),
      );
    }

    return alumno;
  }

  async updateAlumno(id: number, data: { nombre?: string; apellido?: string; grado?: string; padreId?: number; clubIds?: number[] }) {
    const existe = await this.prisma.alumno.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Alumno #${id} no encontrado`);

    const { clubIds, ...alumnoData } = data;

    const alumno = await this.prisma.alumno.update({
      where: { id },
      data: alumnoData,
      include: { padre: { select: { nombre: true, apellido: true } } },
    });

    if (clubIds !== undefined) {
      // Sincronizar inscripciones: eliminar actuales y añadir las nuevas
      await this.prisma.inscripcion.deleteMany({ where: { alumnoId: id } });
      if (clubIds.length > 0) {
        await Promise.all(
          clubIds.map(async (clubId) => {
            await this.prisma.inscripcion.create({
              data: { alumnoId: id, clubId },
            });
            await this.notificarInscripcion(id, clubId);
          }),
        );
      }
    }

    return alumno;
  }

  async deleteAlumno(id: number) {
    const existe = await this.prisma.alumno.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException(`Alumno #${id} no encontrado`);
    await this.prisma.asistencia.deleteMany({ where: { alumnoId: id } });
    await this.prisma.inscripcion.deleteMany({ where: { alumnoId: id } });
    await this.prisma.pago.deleteMany({ where: { alumnoId: id } });
    return this.prisma.alumno.delete({ where: { id } });
  }

  async inscribirAlumno(alumnoId: number, clubId: number) {
    const res = await this.prisma.inscripcion.create({
      data: { alumnoId, clubId },
      include: { club: { select: { nombre: true } } },
    });
    await this.notificarInscripcion(alumnoId, clubId);
    return res;
  }

  private async notificarInscripcion(alumnoId: number, clubId: number) {
    try {
      console.log(`[ADMIN-SERVICE] Intentando notificar inscripción: Alumno ${alumnoId}, Club ${clubId}`);
      const data = await this.prisma.club.findUnique({
        where: { id: clubId },
        include: { profesor: true }
      });
      const alumno = await this.prisma.alumno.findUnique({ where: { id: alumnoId } });
      
      if (data && alumno) {
        await this.notificaciones.crear({
          titulo: 'Nuevo Alumno',
          mensaje: `${alumno.nombre} ${alumno.apellido} ha sido inscrito en tu club de ${data.nombre}.`,
          tipo: 'INFO',
          usuarioId: data.profesorId
        });
        console.log(`[ADMIN-SERVICE] Profesor ${data.profesorId} notificado con éxito.`);
      } else {
        console.warn(`[ADMIN-SERVICE] No se pudo notificar: Club o Alumno no encontrados.`);
      }
    } catch (err) {
      console.error("[ADMIN-SERVICE] Error al notificar al profesor:", err);
    }
  }

  // ============================================================
  // REPORTE DE ASISTENCIA (CSV export)
  // ============================================================
  async getReporteAsistencia(clubId?: number) {
    const sesiones = await this.prisma.sesion.findMany({
      where: clubId ? { clubId } : undefined,
      include: {
        club: { select: { nombre: true } },
        asistencias: {
          include: {
            alumno: { select: { nombre: true, apellido: true, grado: true } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Construir CSV
    const rows = ['Club,Fecha,Alumno,Grado,Estado'];
    for (const sesion of sesiones) {
      for (const a of sesion.asistencias) {
        const fecha = sesion.fecha.toISOString().split('T')[0];
        rows.push(
          `"${sesion.club.nombre}","${fecha}","${a.alumno.nombre} ${a.alumno.apellido}","${a.alumno.grado}","${a.estado}"`,
        );
      }
    }
    return rows.join('\n');
  }

  async getClubSesiones(clubId: number) {
    return this.prisma.sesion.findMany({
      where: { clubId },
      include: {
        asistencias: {
          include: {
            alumno: { select: { id: true, nombre: true, apellido: true, grado: true } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }
}
