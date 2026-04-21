import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PadreService } from './padre.service';

@Controller('padre')
export class PadreController {
  constructor(private readonly padreService: PadreService) {}

  @Get('hijos/:padreId')
  async getHijos(@Param('padreId', ParseIntPipe) padreId: number) {
    return this.padreService.getHijos(padreId);
  }

  @Get('resumen-hijo/:alumnoId')
  async getResumenHijo(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.padreService.getResumenHijo(alumnoId);
  }

  @Get('pagos/:padreId')
  async getPagos(@Param('padreId', ParseIntPipe) padreId: number) {
    return this.padreService.getPagosHijos(padreId);
  }
}
