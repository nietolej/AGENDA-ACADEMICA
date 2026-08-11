import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subTemaId = formData.get('subTemaId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Use a unique name to avoid conflicts
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Return the URL and metadata to attach to the subtema
    const archivo = {
      id: `file_${Date.now()}`,
      nombre: file.name,
      url: `/uploads/${fileName}`,
      tipo: file.type,
      tamanoBytes: file.size,
    };

    // If subTemaId is passed, we should ideally link it here or let the client do it in a separate call.
    // For simplicity, we will let the client make a second call to attach it, or we could do it here if we import subTemasService.
    // Let's do it here since it's an atomic action for the user.
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
