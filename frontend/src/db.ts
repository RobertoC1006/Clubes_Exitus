import Dexie, { type Table } from 'dexie';

export interface AsistenciaOffline {
  id?: number;
  clubId: number;
  sesionId?: number; // Si ya se creó la sesión pero falló el registro de alumnos
  fecha: string;
  asistencias: {
    alumnoId: number;
    estado: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
    observacion?: string;
  }[];
  syncStatus: 'pending' | 'synced';
}

export class ExitusDatabase extends Dexie {
  asistenciasPendientes!: Table<AsistenciaOffline>;

  constructor() {
    super('ExitusOfflineDB');
    this.version(1).stores({
      asistenciasPendientes: '++id, clubId, syncStatus'
    });
  }
}

export const db = new ExitusDatabase();
