import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ClubesService } from './clubes.service';

@Controller('clubes')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  // Peticion: GET /clubes/1/alumnos
  @Get(':id/alumnos')
  getAlumnos(@Param('id', ParseIntPipe) id: number) {
    return this.clubesService.getAlumnosByClub(id);
  }
}
