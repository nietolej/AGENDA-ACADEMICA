import { NextResponse } from 'next/server';
import { tareasService } from '@/modules/materias/tareas.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const tareas = await tareasService.getTareasByMateria(id);
    return NextResponse.json(tareas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const newTarea = await tareasService.createTarea(id, data.titulo, data.importante, data.fechaVencimiento);
    return NextResponse.json(newTarea, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
