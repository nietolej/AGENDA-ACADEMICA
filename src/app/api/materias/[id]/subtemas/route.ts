import { NextResponse } from 'next/server';
import { subTemasService } from '@/modules/materias/subtemas.service';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const subTemas = await subTemasService.getSubTemasByMateria(id);
    return NextResponse.json(subTemas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const newSubTema = await subTemasService.createSubTema(id, data);
    return NextResponse.json(newSubTema, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
