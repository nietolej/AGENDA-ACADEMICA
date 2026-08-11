export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  url: string;      // Ruta local, ej: /uploads/1234-file.pdf
  tipo: string;     // ej: application/pdf, image/png
  tamanoBytes: number;
}

export interface SubTema {
  id: string;
  materiaId: string;
  titulo: string;
  descripcion?: string;
  archivos: ArchivoAdjunto[];
  fechaCreacion: string;
  colorHex?: string;
  imagenUrl?: string;
  textColorHex?: string;
}
