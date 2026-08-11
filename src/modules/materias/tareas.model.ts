export type TareaEstado = 'pendiente' | 'en_proceso' | 'listo';

export interface Tarea {
  id: string;
  materiaId: string;
  titulo: string;
  estado: TareaEstado;
  importante: boolean;
  fechaVencimiento?: string;
  fechaCreacion: string;
}
