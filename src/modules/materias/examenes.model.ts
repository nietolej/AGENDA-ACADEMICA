export interface Examen {
  id: string;
  materiaId: string;
  nombre: string;
  fecha: string;
  nota: number; // 0 a 100
  fechaCreacion?: string;
}
