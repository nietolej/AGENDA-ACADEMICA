import { v4 as uuidv4 } from 'uuid';
import { db } from '@/core/database.json';
import { SubTema } from './subtemas.model';

export class SubTemasService {
  async getSubTemasByMateria(materiaId: string): Promise<SubTema[]> {
    const allSubTemas = (await db.getTable('sub_temas')) as SubTema[];
    return allSubTemas.filter(st => st.materiaId === materiaId);
  }

  async createSubTema(materiaId: string, data: Partial<Omit<SubTema, 'id' | 'materiaId' | 'archivos' | 'fechaCreacion'>>): Promise<SubTema> {
    const newSubTema: SubTema = {
      titulo: data.titulo || 'Nuevo Subtema',
      descripcion: data.descripcion,
      colorHex: data.colorHex,
      imagenUrl: data.imagenUrl,
      textColorHex: data.textColorHex,
      id: `sub_${uuidv4()}`,
      materiaId,
      archivos: [],
      fechaCreacion: new Date().toISOString()
    };

    return await db.insert('sub_temas', newSubTema);
  }

  async addArchivo(subTemaId: string, archivo: any): Promise<SubTema | null> {
    const allSubTemas = (await db.getTable('sub_temas')) as SubTema[];
    const subTema = allSubTemas.find(st => st.id === subTemaId);
    
    if (!subTema) return null;
    
    const updatedArchivos = [...subTema.archivos, archivo];
    return await db.update('sub_temas', subTemaId, { archivos: updatedArchivos });
  }

  async removeArchivo(subTemaId: string, archivoId: string): Promise<SubTema | null> {
    const allSubTemas = (await db.getTable('sub_temas')) as SubTema[];
    const subTema = allSubTemas.find(st => st.id === subTemaId);
    
    if (!subTema) return null;
    
    const updatedArchivos = subTema.archivos.filter(a => a.id !== archivoId);
    return await db.update('sub_temas', subTemaId, { archivos: updatedArchivos });
  }

  async deleteSubTema(subTemaId: string): Promise<boolean> {
    return await db.delete('sub_temas', subTemaId);
  }
}

export const subTemasService = new SubTemasService();
