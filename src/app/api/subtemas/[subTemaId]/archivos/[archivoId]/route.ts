import { NextResponse } from 'next/server';
import { subTemasService } from '@/modules/materias/subtemas.service';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/core/database.json';
import { SubTema } from '@/modules/materias/subtemas.model';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ subTemaId: string; archivoId: string }> }
) {
  try {
    const { subTemaId, archivoId } = await context.params;
    
    // Get file info to delete it from disk
    const allSubTemas = (await db.getTable('sub_temas')) as SubTema[];
    const subTema = allSubTemas.find(st => st.id === subTemaId);
    if (!subTema) return NextResponse.json({ error: 'SubTema no encontrado' }, { status: 404 });
    
    const archivo = subTema.archivos.find(a => a.id === archivoId);
    if (!archivo) return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });

    // Remove from disk
    try {
      const fileName = archivo.url.split('/').pop();
      if (fileName) {
        const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
        await fs.unlink(filePath);
      }
    } catch (e) {
      console.warn('Could not delete file from disk, but continuing db removal', e);
    }

    // Remove from db
    await subTemasService.removeArchivo(subTemaId, archivoId);

    return NextResponse.json({ message: 'Archivo eliminado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
