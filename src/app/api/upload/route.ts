import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subTemaId = formData.get('subTemaId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Usamos el disco duro de la nube (Vercel Blob)
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Guardar los metadatos
    const archivo = {
      id: `file_${Date.now()}`,
      nombre: file.name,
      url: blob.url, // Esta es la URL pública que nos da Vercel Blob
      tipo: file.type,
      tamanoBytes: file.size,
    };

    // Si pasaron un subTemaId, guardarlo de una vez en ese subtema
    if (subTemaId) {
      const { subTemasService } = await import('@/modules/materias/subtemas.service');
      await subTemasService.addArchivo(subTemaId, archivo);
    }

    return NextResponse.json(archivo, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
