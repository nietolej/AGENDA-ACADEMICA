import { NextResponse } from 'next/server';
import { examenesService } from '@/modules/materias/examenes.service';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    const updated = await examenesService.updateExamen(id, updates);
    if (!updated) return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const success = await examenesService.deleteExamen(id);
    if (!success) return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
