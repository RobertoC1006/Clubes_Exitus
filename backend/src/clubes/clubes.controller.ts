import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ClubesService } from './clubes.service';

@Controller('clubes')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  // GET /clubes — Todos los clubes (para Dashboard global)
  @Get()
  getAllClubes() {
    return this.clubesService.getAllClubes();
  }

  // GET /clubes/:id — Detalle de un club
  @Get(':id')
  getClubById(@Param('id', ParseIntPipe) id: number) {
    return this.clubesService.getClubById(id);
  }

  // GET /clubes/:id/alumnos
  @Get(':id/alumnos')
  getAlumnos(@Param('id', ParseIntPipe) id: number) {
    return this.clubesService.getAlumnosByClub(id);
  }

  // Peticion: GET /clubes/mis-clubes/1
  @Get('mis-clubes/:id')
  getMisClubes(@Param('id', ParseIntPipe) id: number) {
    return this.clubesService.getClubesDeProfesor(id);
  }

  // GET /clubes/profesor-dashboard/:id
  @Get('profesor-dashboard/:id')
  getDashboardMetrics(@Param('id', ParseIntPipe) id: number) {
    return this.clubesService.getProfesorDashboard(id);
  }

  // Peticion: POST /clubes/1/alumnos
  @Post(':id/alumnos')
  addAlumno(
    @Param('id', ParseIntPipe) id: number, 
    @Body() data: { nombre: string, apellido: string, grado: string }
  ) {
    return this.clubesService.addAlumnoToClub(id, data);
  }
}
