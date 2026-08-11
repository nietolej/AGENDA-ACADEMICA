import { v4 as uuidv4 } from 'uuid';
import { db } from '@/core/database.json';
import { eventBus, EVENTS } from '@/core/event-bus';
import { Materia, MateriaDTO } from './materias.model';

export class MateriasService {
  async getAllMaterias(): Promise<MateriaDTO[]> {
    const materias = (await db.getTable('materias')) as Materia[];
    const tareas = (await db.getTable('tareas')) as any[];
    const examenes = (await db.getTable('examenes')) as any[];
    
    // Convert to DTO with calculated fields
    return materias.map((m) => {
      const materiaTareas = tareas.filter(t => t.materiaId === m.id);
      const materiaExamenes = examenes.filter(e => e.materiaId === m.id);
      const pendingCount = materiaTareas.filter(t => t.estado !== 'listo').length;
      const listosCount = materiaTareas.length - pendingCount;
      const progresoPorcentaje = materiaTareas.length > 0 
        ? Math.round((listosCount / materiaTareas.length) * 100) 
        : 0;
      
      const sumNotas = materiaExamenes.reduce((acc, curr) => acc + Number(curr.nota || 0), 0);
      const promedioActual = materiaExamenes.length > 0 ? Number((sumNotas / materiaExamenes.length).toFixed(1)) : 0;
      
      return {
        ...m,
        resumenCalculado: {
          promedioActual: promedioActual,
          tareasPendientes: pendingCount,
          progresoPorcentaje: progresoPorcentaje
        }
      };
    });
  }

  async createMateria(data: Omit<Materia, 'id' | 'estado' | 'fechaCreacion'>): Promise<Materia> {
    const newMateria: Materia = {
      ...data,
      id: `mat_${uuidv4()}`,
      estado: 'activa',
      fechaCreacion: new Date().toISOString()
    };

    const created = await db.insert('materias', newMateria);
    
    // Emit event
    eventBus.emit(EVENTS.MATERIA_CREADA, created);
    
    return created;
  }

  async updateMateria(id: string, updates: Partial<Omit<Materia, 'id'>>): Promise<Materia | null> {
    const updated = await db.update('materias', id, updates);
    return updated as Materia | null;
  }
}

export const materiasService = new MateriasService();
