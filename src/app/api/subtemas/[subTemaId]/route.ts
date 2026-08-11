import { NextResponse } from 'next/server';
import { subTemasService } from '@/modules/materias/subtemas.service';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ subTemaId: string }> }
) {
  try {
    const { subTemaId } = await context.params;
    const deleted = await subTemasService.deleteSubTema(subTemaId);
    
    if (deleted) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'SubTema no encontrado' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ subTemaId: string }> }
) {
  try {
    const { subTemaId } = await context.params;
    const body = await request.json();
    
    const { db } = await import('@/core/database.json');
    const updated = await db.update('sub_temas', subTemaId, body);
    
    if (updated) {
      return NextResponse.json(updated);
    }
    
    return NextResponse.json({ error: 'SubTema no encontrado' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
