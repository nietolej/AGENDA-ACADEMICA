import { NextResponse } from 'next/server';
import { db } from '@/core/database.json';
import { Examen } from '@/modules/materias/examenes.model';
import { Materia } from '@/modules/materias/materias.model';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semestre = searchParams.get('semestre');

    let examenes = (await db.getTable('examenes')) as Examen[];

    if (semestre) {
      const materias = (await db.getTable('materias')) as Materia[];
      const validMateriaIds = new Set(materias.filter(m => m.semestre === semestre).map(m => m.id));
      examenes = examenes.filter(e => validMateriaIds.has(e.materiaId));
    }

    return NextResponse.json(examenes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
