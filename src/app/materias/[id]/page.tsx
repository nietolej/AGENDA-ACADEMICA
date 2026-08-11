import MateriaDetalleView from '@/modules/materias/materia-detalle.view';
import React from 'react';

export default async function MateriaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  // We just unwrap params.id for the client component. 
  const { id } = await params;
  
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <MateriaDetalleView materiaId={id} />
    </main>
  );
}
