import { Controller, Post, Get, Put, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { EstadoAsistencia } from '@prisma/client';

@Controller('sesiones')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  // GET /sesiones?clubId=1
  @Get()
  getSesiones(@Query('clubId', ParseIntPipe) clubId: number) {
     return this.sesionesService.getSesionesByClub(clubId);
  }

  // POST /sesiones
  @Post()
  createSesion(
    @Body('clubId', ParseIntPipe) clubId: number, 
    @Body('fecha') fecha: string
  ) {
    return this.sesionesService.createSesion(clubId, fecha);
  }

  // PUT /sesiones/1/asistencia
  @Put(':id/asistencia')
  updateAsistencias(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body('asistencias') asistencias: { alumnoId: number, estado: EstadoAsistencia }[]
  ) {
     return this.sesionesService.updateAsistencias(sessionId, asistencias);
  }
}
