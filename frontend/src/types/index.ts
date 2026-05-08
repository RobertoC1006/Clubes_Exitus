export interface Metricas {
  totalAlumnos: number;
  totalClubes: number;
  totalProfesores: number;
  asistenciaGlobal: number;
  rankingAsistencias: { alumno: string; club: string; cuenta: number }[];
  rankingAusencias: { alumno: string; club: string; cuenta: number }[];
  rankingJustificaciones: { alumno: string; club: string; cuenta: number }[];
  clubes: ClubMetrica[];
  alertas: { alumno: string; club: string; faltas: number }[];
}

export interface ClubMetrica {
  id: number;
  nombre: string;
  descripcion: string | null;
  profesorId: number;
  profesor: string;
  inscritos: number;
  asistencia: number;
  horario: any | null;
  precio: number;
}

export interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  celular?: string;
  clubes?: { id: number; nombre: string; horario: any }[];
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'PROFESOR' | 'PADRE';
  dni: string;
  celular?: string;
  password?: string;
  estado?: string;
  initials?: string;
}

export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  grado: string;
  padreId?: number | null;
  padre?: { nombre: string; apellido: string } | null;
  inscripciones: { clubId: number; club: { nombre: string } }[];
  _count: { asistencias: number };
}

export interface Pago {
  id: number;
  mes: string;
  monto: number | null;
  estado: 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';
  urlComprobante: string | null;
  observacion: string | null;
  alumnoId: number;
  alumno: { nombre: string; apellido: string; grado: string };
  club: { nombre: string };
  creadoEn: string;
}

export interface Aula {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  radioPermitido: number;
  codigoContingencia: string;
}

export interface AsistenciaDocente {
  id: number;
  fecha: string;
  asistenciaDocente: 'PUNTUAL' | 'TARDE' | 'AUSENTE';
  horaMarcajeDocente: string;
  latitudDocente: number;
  longitudDocente: number;
  aula: { nombre: string };
  club: { nombre: string; profesor: { nombre: string; apellido: string } };
}
