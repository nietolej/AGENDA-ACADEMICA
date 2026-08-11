export interface DocenteResumen {
  id: string;
  nombre: string;
}

export interface HorarioBloque {
  dia: string;
  inicio: string;
  fin: string;
}

export interface MateriaResumenCalculado {
  promedioActual: number;
  tareasPendientes: number;
  proximoEvento?: {
    id: string;
    titulo: string;
    fecha: string;
  };
  progresoPorcentaje: number;
}

export interface Materia {
  id: string;
  nombre: string;
  codigo?: string;
  semestre?: string;
  creditos?: number;
  colorHex?: string;
  profesor?: string;
  horario?: string; // Legacy
  horarios?: HorarioBloque[];
  docentePrincipalId?: string;
  estado: 'activa' | 'finalizada' | 'archivada';
  metaPromedio?: number;
  fechaCreacion?: string;
  imagenUrl?: string;
  textColorHex?: string;
}

export interface MateriaDTO extends Omit<Materia, 'docentePrincipalId'> {
  docentePrincipal?: DocenteResumen;
  resumenCalculado?: MateriaResumenCalculado;
}
