import { Controller, Get, Put, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  getNotificaciones(
    @Query('usuarioId', ParseIntPipe) usuarioId: number,
    @Query('page') page?: number,
  ) {
    return this.notificacionesService.getNotificaciones(usuarioId, page ? Number(page) : 1);
  }

  @Put(':id/leer')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.markAsRead(id);
  }
}
