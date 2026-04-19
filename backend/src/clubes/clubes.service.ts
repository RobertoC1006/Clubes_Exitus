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
}
