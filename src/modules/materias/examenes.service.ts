import { v4 as uuidv4 } from 'uuid';
import { db } from '@/core/database.json';
import { Examen } from './examenes.model';

export class ExamenesService {
  async getExamenesByMateria(materiaId: string): Promise<Examen[]> {
    const all = (await db.getTable('examenes')) as Examen[];
    return all.filter(e => e.materiaId === materiaId);
  }

  async getAllExamenes(): Promise<Examen[]> {
    return (await db.getTable('examenes')) as Examen[];
  }

  async createExamen(materiaId: string, nombre: string, fecha: string, nota: number): Promise<Examen> {
    const newExamen: Examen = {
      id: `exam_${uuidv4()}`,
      materiaId,
      nombre,
      fecha,
      nota: Math.min(100, Math.max(0, Number(nota) || 0)),
      fechaCreacion: new Date().toISOString()
    };
    return await db.insert('examenes', newExamen);
  }

  async updateExamen(id: string, updates: Partial<Pick<Examen, 'nombre' | 'fecha' | 'nota'>>): Promise<Examen | null> {
    if (updates.nota !== undefined) {
      updates.nota = Math.min(100, Math.max(0, Number(updates.nota) || 0));
    }
    return (await db.update('examenes', id, updates)) as Examen | null;
  }

  async deleteExamen(id: string): Promise<boolean> {
    return await db.delete('examenes', id);
  }
}

export const examenesService = new ExamenesService();
