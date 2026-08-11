import { v4 as uuidv4 } from 'uuid';
import { db } from '@/core/database.json';
import { Tarea, TareaEstado } from './tareas.model';

export class TareasService {
  async getTareasByMateria(materiaId: string): Promise<Tarea[]> {
    const allTareas = (await db.getTable('tareas')) as Tarea[];
    return allTareas.filter(t => t.materiaId === materiaId);
  }

  async createTarea(materiaId: string, titulo: string, importante: boolean = false, fechaVencimiento?: string): Promise<Tarea> {
    const newTarea: Tarea = {
      id: `task_${uuidv4()}`,
      materiaId,
      titulo,
      estado: 'pendiente',
      importante,
      fechaVencimiento,
      fechaCreacion: new Date().toISOString()
    };

    return await db.insert('tareas', newTarea);
  }

  async updateTarea(id: string, updates: Partial<Pick<Tarea, 'titulo' | 'estado' | 'importante' | 'fechaVencimiento'>>): Promise<Tarea | null> {
    const updated = await db.update('tareas', id, updates);
    return updated as Tarea | null;
  }

  async deleteTarea(id: string): Promise<boolean> {
    const success = await db.delete('tareas', id);
    return success;
  }
}

export const tareasService = new TareasService();
