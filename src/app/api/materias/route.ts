import { NextResponse } from 'next/server';
import { materiasService } from '@/modules/materias/materias.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semestre = searchParams.get('semestre');
    
    let materias = await materiasService.getAllMaterias();
    
    if (semestre) {
      materias = materias.filter(m => m.semestre === semestre);
    }
    
    return NextResponse.json(materias);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newMateria = await materiasService.createMateria(data);
    return NextResponse.json(newMateria, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
