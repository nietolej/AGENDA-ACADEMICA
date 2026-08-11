import { NextResponse } from 'next/server';
import { db } from '@/core/database.json';
import { Tarea } from '@/modules/materias/tareas.model';
import { Materia } from '@/modules/materias/materias.model';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semestre = searchParams.get('semestre');

    let tareas = (await db.getTable('tareas')) as Tarea[];

    if (semestre) {
      const materias = (await db.getTable('materias')) as Materia[];
      const validMateriaIds = new Set(materias.filter(m => m.semestre === semestre).map(m => m.id));
      tareas = tareas.filter(t => validMateriaIds.has(t.materiaId));
    }

    return NextResponse.json(tareas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
