import { Controller, Get, Post, Put, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { EstadoPago } from '@prisma/client';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // GET /pagos?estado=PENDIENTE&alumnoId=1&clubId=2
  @Get()
  getPagos(
    @Query('estado') estado?: EstadoPago,
    @Query('alumnoId') alumnoId?: string,
    @Query('clubId') clubId?: string,
  ) {
    return this.pagosService.getPagos(
      estado,
      alumnoId ? Number(alumnoId) : undefined,
      clubId ? Number(clubId) : undefined,
    );
  }

  // GET /pagos/alumno/:alumnoId
  @Get('alumno/:alumnoId')
  getPagosByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.pagosService.getPagosByAlumno(alumnoId);
  }

  // POST /pagos  (padre sube comprobante)
  @Post()
  crearPago(
    @Body()
    body: {
      alumnoId: number;
      clubId: number;
      mes: string;
      monto?: number;
      urlComprobante?: string;
    },
  ) {
    return this.pagosService.crearPago(body);
  }

  // PUT /pagos/:id/validar  (admin aprueba o rechaza)
  @Put(':id/validar')
  validarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: EstadoPago; observacion?: string },
  ) {
    return this.pagosService.validarPago(id, body.estado, body.observacion);
  }

  // GET /pagos/monitor/:profesorId (Para vista profesor)
  @Get('monitor/:profesorId')
  getPagosPorProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.pagosService.getPagosPorProfesor(profesorId);
  }
}
