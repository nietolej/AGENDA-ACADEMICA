import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subTemaId = formData.get('subTemaId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Upstash (KV) tiene un límite de 1MB por valor en su plan gratuito.
    if (file.size > 900 * 1024) {
      return NextResponse.json({ 
        error: 'La imagen es muy pesada. Por favor sube una imagen que pese menos de 1MB.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convertimos la imagen a un texto Base64 para guardarla directamente en la base de datos
    // Esto evita tener que configurar Vercel Blob manualmente.
    const base64Str = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64Str}`;

    const archivo = {
      id: `file_${Date.now()}`,
      nombre: file.name,
      url: dataUri,
      tipo: file.type,
      tamanoBytes: file.size,
    };

    if (subTemaId) {
      const { subTemasService } = await import('@/modules/materias/subtemas.service');
      await subTemasService.addArchivo(subTemaId, archivo);
    }

    return NextResponse.json(archivo, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
