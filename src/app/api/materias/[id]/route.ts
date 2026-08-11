import { NextResponse } from 'next/server';
import { materiasService } from '@/modules/materias/materias.service';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const materias = await materiasService.getAllMaterias();
    const materia = materias.find(m => m.id === id);
    if (!materia) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(materia);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    const updatedMateria = await materiasService.updateMateria(id, updates);
    
    if (!updatedMateria) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedMateria);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
