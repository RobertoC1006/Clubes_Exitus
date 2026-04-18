import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoPago } from '@prisma/client';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los pagos (con filtro opcional por estado)
  async getPagos(estado?: EstadoPago) {
    return this.prisma.pago.findMany({
      where: estado ? { estado } : undefined,
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
}
