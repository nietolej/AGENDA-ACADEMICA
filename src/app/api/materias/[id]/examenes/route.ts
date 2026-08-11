import { NextResponse } from 'next/server';
import { examenesService } from '@/modules/materias/examenes.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const examenes = await examenesService.getExamenesByMateria(id);
    return NextResponse.json(examenes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const newExamen = await examenesService.createExamen(id, data.nombre, data.fecha, data.nota);
    return NextResponse.json(newExamen, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
