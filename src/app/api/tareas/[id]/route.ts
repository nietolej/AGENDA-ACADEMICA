import { NextResponse } from 'next/server';
import { tareasService } from '@/modules/materias/tareas.service';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    const updated = await tareasService.updateTarea(id, updates);
    if (!updated) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const success = await tareasService.deleteTarea(id);
    if (!success) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
