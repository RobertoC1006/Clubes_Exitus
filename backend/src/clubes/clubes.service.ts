import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubesService {
  constructor(private prisma: PrismaService) {}

  async getAlumnosByClub(clubId: number) {
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { clubId },
      include: {
        alumno: true, // Trae todos los datos del alumno matriculado
      },
    });
    
    // Retorna una lista limpia de alumnos directamente
    return inscripciones.map((ins) => ins.alumno);
  }
}
