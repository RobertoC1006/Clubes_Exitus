import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoPago } from '@prisma/client';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los pagos (con filtro opcional por estado, alumno o club)
  async getPagos(estado?: EstadoPago, alumnoId?: number, clubId?: number) {
    const where: any = {};
    if (estado) where.estado = estado;
    if (alumnoId) where.alumnoId = alumnoId;
    if (clubId) where.clubId = clubId;

    return this.prisma.pago.findMany({
      where,
      include: {
        alumno: { select: { nombre: true, apellido: true, grado: true } },
        club: { select: { nombre: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // Obtener pagos de un alumno específico  
  async getPagosByAlumno(alumnoId: number) {
    return this.prisma.pago.findMany({
      where: { alumnoId },
      include: { club: { select: { nombre: true } } },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // Padre sube un comprobante (crea un pago PENDIENTE)
  async crearPago(data: {
    alumnoId: number;
    clubId: number;
    mes: string;
    monto?: number;
    urlComprobante?: string;
  }) {
    return this.prisma.pago.create({
      data: {
        ...data,
        estado: 'PENDIENTE',
      },
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        club: { select: { nombre: true } },
      },
    });
  }

  // Admin valida o rechaza un pago
  async validarPago(id: number, estado: EstadoPago, observacion?: string) {
    const pago = await this.prisma.pago.findUnique({ where: { id } });
    if (!pago) throw new NotFoundException(`Pago #${id} no encontrado`);
    return this.prisma.pago.update({
      where: { id },
      data: { estado, observacion },
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        club: { select: { nombre: true } },
      },
    });
  }

  // Monitor de pagos para un profesor específico
  async getPagosPorProfesor(profesorId: number) {
    // 1. Obtener clubes del profesor
    const clubes = await this.prisma.club.findMany({
      where: { profesorId },
      include: {
        inscripciones: {
          include: {
            alumno: {
              include: {
                pagos: {
                  where: {
                    // Podemos filtrar por el mes actual si quisiéramos, 
                    // por ahora traemos todos para que el profesor vea el historial de ese alumno
                    // o podemos limitarlo a los últimos meses.
                  },
                  orderBy: { creadoEn: 'desc' },
                  take: 1 // Solo el estado más reciente del pago
                }
              }
            }
          }
        }
      }
    });

    // 2. Aplanar la estructura para el frontend
    const monitor = clubes.flatMap(club => 
      club.inscripciones.map(ins => {
        const ultimoPago = ins.alumno.pagos[0];
        return {
          alumnoId: ins.alumno.id,
          nombre: ins.alumno.nombre,
          apellido: ins.alumno.apellido,
          grado: ins.alumno.grado,
          clubId: club.id,
          clubNombre: club.nombre,
          estadoPago: ultimoPago ? ultimoPago.estado : 'PENDIENTE',
          mes: ultimoPago ? ultimoPago.mes : 'Sin registro',
          monto: ultimoPago ? ultimoPago.monto : 0
        };
      })
    );

    return monitor;
  }
}
