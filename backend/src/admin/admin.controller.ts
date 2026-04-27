import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, ParseIntPipe, Query, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/metricas
  @Get('metricas')
  getMetricas() {
    return this.adminService.getMetricas();
  }

  // ── CLUBES ──────────────────────────────────────
  @Get('clubes')
  getClubes() {
    return this.adminService.getClubes();
  }

  @Post('clubes')
  createClub(@Body() body: { nombre: string; descripcion?: string; precio?: number; profesorId: number; horario?: any }) {
    return this.adminService.createClub(body);
  }

  @Put('clubes/:id')
  updateClub(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nombre?: string; descripcion?: string; precio?: number; profesorId?: number; horario?: any },
  ) {
    return this.adminService.updateClub(id, body);
  }

  @Delete('clubes/:id')
  deleteClub(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteClub(id);
  }

  @Put('clubes/:clubId/profesor')
  asignarProfesor(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Body() body: { profesorId: number },
  ) {
    return this.adminService.asignarProfesor(clubId, body.profesorId);
  }

  // ── USUARIOS ─────────────────────────────────────
  @Get('profesores')
  getProfesores() {
    return this.adminService.getProfesores();
  }

  @Get('usuarios')
  getUsuarios() {
    return this.adminService.getUsuarios();
  }

  @Post('usuarios')
  createUsuario(
    @Body() body: { nombre: string; apellido: string; email?: string; rol: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'; dni?: string; celular?: string },
  ) {
    return this.adminService.createUsuario(body);
  }

  @Put('usuarios/:id')
  updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nombre?: string; apellido?: string; email?: string; rol?: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE'; dni?: string; celular?: string },
  ) {
    return this.adminService.updateUsuario(id, body);
  }

  @Patch('usuarios/:id/reset-password')
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.resetPassword(id);
  }

  @Patch('usuarios/:id/status')
  toggleUsuarioStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string },
  ) {
    return this.adminService.toggleUsuarioStatus(id, body.estado);
  }

  @Delete('usuarios/:id')
  deleteUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUsuario(id);
  }

  // ── ALUMNOS ──────────────────────────────────────
  @Get('alumnos')
  getAlumnos() {
    return this.adminService.getAlumnos();
  }

  @Post('alumnos')
  createAlumno(
    @Body() body: { nombre: string; apellido: string; grado: string; padreId?: number },
  ) {
    return this.adminService.createAlumno(body);
  }

  @Put('alumnos/:id')
  updateAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nombre?: string; apellido?: string; grado?: string; padreId?: number },
  ) {
    return this.adminService.updateAlumno(id, body);
  }

  @Delete('alumnos/:id')
  deleteAlumno(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAlumno(id);
  }

  @Post('alumnos/:alumnoId/inscribir/:clubId')
  inscribirAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('clubId', ParseIntPipe) clubId: number,
  ) {
    return this.adminService.inscribirAlumno(alumnoId, clubId);
  }

  // ── REPORTE ──────────────────────────────────────
  @Get('reporte/asistencia')
  async exportarReporte(
    @Query('clubId') clubId: string,
    @Res() res: Response,
  ) {
    const csv = await this.adminService.getReporteAsistencia(
      clubId ? parseInt(clubId) : undefined,
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_asistencia.csv"');
    res.send('\uFEFF' + csv);
  }

  @Get('clubes/:id/sesiones')
  getClubSesiones(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getClubSesiones(id);
  }
}
