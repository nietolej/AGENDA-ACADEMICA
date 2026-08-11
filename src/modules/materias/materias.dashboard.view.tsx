'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MateriaDTO } from './materias.model';
import { Plus, GraduationCap, Clock, X, Info, Upload, Image as ImageIcon, Pencil } from 'lucide-react';
import { useSemester } from '@/core/SemesterContext';

export default function MateriasDashboard() {
  const { selectedSemester } = useSemester();
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    semestre: '',
    creditos: 0,
    profesor: '',
    horario: '',
    horarios: [] as { dia: string, inicio: string, fin: string }[],
    colorHex: '#768E78',
    metaPromedio: 0,
    imagenUrl: '',
    textColorHex: '#ffffff'
  });
  const [editingMateriaId, setEditingMateriaId] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const addHorarioBloque = () => {
    setFormData({
      ...formData,
      horarios: [...formData.horarios, { dia: 'Lunes', inicio: '07:00', fin: '09:00' }]
    });
  };

  const updateHorarioBloque = (index: number, field: string, value: string) => {
    const newHorarios = [...formData.horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setFormData({ ...formData, horarios: newHorarios });
  };

  const removeHorarioBloque = (index: number) => {
    setFormData({
      ...formData,
      horarios: formData.horarios.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, imagenUrl: data.url });
      } else {
        alert('Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const toggleCard = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchMaterias = async () => {
    try {
      const res = await fetch(`/api/materias?semestre=${selectedSemester}&t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
      if (res.ok) {
        const data = await res.json();
        setMaterias(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, [selectedSemester]);

  const openNewModal = () => {
    setEditingMateriaId(null);
    setFormData({
      nombre: '', codigo: '', semestre: selectedSemester, creditos: 0, profesor: '',
      horario: '', horarios: [], colorHex: '#768E78', metaPromedio: 0,
      imagenUrl: '', textColorHex: '#ffffff'
    });
    setShowModal(true);
  };

  const openEditModal = (e: React.MouseEvent, materia: MateriaDTO) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingMateriaId(materia.id);
    setFormData({
      nombre: materia.nombre || '',
      codigo: materia.codigo || '',
      semestre: materia.semestre || '',
      creditos: materia.creditos || 0,
      profesor: materia.profesor || '',
      horario: materia.horario || '',
      horarios: materia.horarios || [],
      colorHex: materia.colorHex || '#768E78',
      metaPromedio: materia.metaPromedio || 0,
      imagenUrl: materia.imagenUrl || '',
      textColorHex: materia.textColorHex || '#ffffff'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMateriaId ? `/api/materias/${editingMateriaId}` : '/api/materias';
      const method = editingMateriaId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingMateriaId(null);
        setFormData({ nombre: '', codigo: '', semestre: '', creditos: 0, profesor: '', horario: '', horarios: [], colorHex: '#768E78', metaPromedio: 0, imagenUrl: '', textColorHex: '#ffffff' });
        fetchMaterias();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* SVG ClipPath Definition for Folder Shape */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <clipPath id="folder-card-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.10 C 0,0.04 0.02,0 0.05,0 L 0.36,0 C 0.39,0 0.41,0.04 0.43,0.10 L 0.95,0.10 C 0.98,0.10 1,0.15 1,0.20 L 1,0.94 C 1,0.98 0.98,1 0.95,1 L 0.05,1 C 0.02,1 0,0.98 0,0.94 Z" />
          </clipPath>
        </defs>
      </svg>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)' }}>Mis Materias</h1>
        <button
          onClick={openNewModal}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, var(--fern) 0%, #5d7160 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.2s ease, transform 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 10px rgba(118,142,120,0.4)'
          }}
          onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus size={18} /> Nueva Materia
        </button>
      </header>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando materias...</p>
      ) : materias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface-alt)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: 0 }}>No tienes materias registradas. ¡Agrega una para empezar!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {materias.map((materia) => {
            const hasImage = !!materia.imagenUrl;
            const isFlipped = flippedCards[materia.id];
            const showImage = hasImage && !isFlipped;

            return (
            <Link key={materia.id} href={`/materias/${materia.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: showImage ? 'transparent' : '#FDFAF5',
                borderRadius: showImage ? '0' : '14px',
                padding: showImage ? '0' : '1.5rem',
                boxShadow: showImage ? 'none' : '0 4px 16px rgba(118,142,120,0.10), 0 1px 4px rgba(46,53,48,0.06)',
                border: showImage ? 'none' : '1px solid var(--border)',
                borderTop: showImage ? 'none' : `5px solid ${materia.textColorHex || materia.colorHex}`,
                display: 'flex',
                flexDirection: 'column',
                gap: showImage ? '0' : '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                height: '100%',
                position: 'relative',
                minHeight: '220px',
                overflow: 'visible'
              }}
                onMouseOver={e => { if (!showImage) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(118,142,120,0.18)'; } }}
                onMouseOut={e => { if (!showImage) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(118,142,120,0.10), 0 1px 4px rgba(46,53,48,0.06)'; } }}
              >
                {showImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '240px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      clipPath: 'url(#folder-card-clip)',
                      WebkitClipPath: 'url(#folder-card-clip)',
                      background: materia.colorHex || '#768E78'
                    }}>
                      <img
                        src={materia.imagenUrl}
                        alt={materia.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                      />
                      <h3 style={{
                        position: 'absolute',
                        top: '18%',
                        left: '1.25rem',
                        margin: 0,
                        fontSize: '1.65rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: materia.textColorHex || '#ffffff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        wordBreak: 'break-word',
                        zIndex: 2,
                        maxWidth: 'calc(100% - 2.5rem)',
                        lineHeight: 1.2
                      }}>
                        {materia.nombre}
                      </h3>
                      <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
                        <button
                          onClick={(e) => openEditModal(e, materia)}
                          style={{ background: 'rgba(253,250,245,0.92)', border: '1px solid var(--border)', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--foreground)', boxShadow: '0 2px 5px rgba(0,0,0,0.12)' }}
                          title="Editar / Cambiar Imagen"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => toggleCard(e, materia.id)}
                          style={{ background: 'rgba(253,250,245,0.92)', border: '1px solid var(--border)', padding: '0.45rem 0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.8rem', boxShadow: '0 2px 5px rgba(0,0,0,0.12)' }}
                        >
                          <Info size={15} /> Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--foreground)' }}>{materia.nombre}</h3>
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      <button
                        onClick={(e) => openEditModal(e, materia)}
                        style={{ background: 'var(--fennel)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        title="Editar / Adjuntar Imagen"
                      >
                        <Pencil size={16} />
                      </button>
                      {hasImage && (
                        <button
                          onClick={(e) => toggleCard(e, materia.id)}
                          style={{ background: 'var(--fennel)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          title="Ver Imagen"
                        >
                          <ImageIcon size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <span style={{
                    background: 'var(--fennel)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                    border: '1px solid var(--border)',
                    fontWeight: 600
                  }}>
                    {materia.codigo || 'S/C'} • {materia.semestre || 'S/S'} • {materia.creditos || 0} UC
                  </span>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {materia.profesor && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><GraduationCap size={14} /> {materia.profesor}</div>}
                    {materia.horarios && materia.horarios.length > 0 ? (
                      materia.horarios.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {h.dia} {h.inicio} - {h.fin}</div>
                      ))
                    ) : materia.horario ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {materia.horario}</div>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Promedio Actual</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: (materia.resumenCalculado?.promedioActual || 0) < 60 ? 'var(--peony)' : 'var(--fern)' }}>
                      {materia.resumenCalculado?.promedioActual.toFixed(1)} / 100 pts
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', width: '100%', maxWidth: '140px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>To-Do List</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: materia.resumenCalculado?.progresoPorcentaje === 100 ? 'var(--fern)' : 'var(--foreground)' }}>
                        {materia.resumenCalculado?.progresoPorcentaje || 0}%
                      </p>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--fennel)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${materia.resumenCalculado?.progresoPorcentaje || 0}%`,
                        background: materia.resumenCalculado?.progresoPorcentaje === 100 ? 'var(--fern)' : (materia.textColorHex || materia.colorHex),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {materia.resumenCalculado?.tareasPendientes} pendientes
                    </p>
                  </div>
                </div>
                </>
                )}
              </div>
            </Link>
          );
        })}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(46,53,48,0.45)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 100,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            background: '#FDFAF5', padding: '2rem', borderRadius: '18px',
            width: '100%', maxWidth: '440px',
            boxShadow: '0 20px 60px rgba(46,53,48,0.18), 0 4px 16px rgba(46,53,48,0.1)',
            border: '1px solid var(--border)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
              {editingMateriaId ? 'Editar Materia' : 'Agregar Materia'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Nombre</label>
                <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Código</label>
                  <input type="text" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Semestre</label>
                  <select value={formData.semestre} onChange={e => setFormData({...formData, semestre: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', boxSizing: 'border-box' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <option key={sem} value={sem.toString()}>Semestre {sem}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Créditos</label>
                  <input type="number" min="0" value={formData.creditos} onChange={e => setFormData({...formData, creditos: parseInt(e.target.value) || 0})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Profesor</label>
                  <input type="text" value={formData.profesor} onChange={e => setFormData({...formData, profesor: e.target.value})}
                    placeholder="Ej. Dra. Rivera"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Bloques de Horario</label>
                  <button type="button" onClick={addHorarioBloque} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', background: '#FDFAF5', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Plus size={14} /> Añadir
                  </button>
                </div>

                {formData.horarios.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>Sin horario definido.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.horarios.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          value={h.dia}
                          onChange={(e) => updateHorarioBloque(i, 'dia', e.target.value)}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: '#FDFAF5' }}
                        >
                          {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input
                          type="time"
                          value={h.inicio}
                          onChange={(e) => updateHorarioBloque(i, 'inicio', e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: '#FDFAF5' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        <input
                          type="time"
                          value={h.fin}
                          onChange={(e) => updateHorarioBloque(i, 'fin', e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: '#FDFAF5' }}
                        />
                        <button type="button" onClick={() => removeHorarioBloque(i)} style={{ background: 'none', border: 'none', color: 'var(--peony)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Color Identificador / Borde</label>
                <input type="color" value={formData.textColorHex || formData.colorHex} onChange={e => setFormData({...formData, colorHex: e.target.value, textColorHex: e.target.value})}
                  style={{ width: '100%', height: '40px', padding: '0', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }} />
              </div>

              <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Imagen de Portada (Opcional)</label>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label
                    htmlFor="cover-upload-input"
                    style={{
                      padding: '0.6rem 1rem',
                      background: '#FDFAF5',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      color: 'var(--foreground)',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    <Upload size={16} /> {uploading ? 'Subiendo...' : 'Subir Archivo'}
                  </label>
                  <input
                    id="cover-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />

                  <input
                    type="text"
                    placeholder="o pega una URL de imagen..."
                    value={formData.imagenUrl}
                    onChange={e => setFormData({...formData, imagenUrl: e.target.value})}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#FDFAF5', fontSize: '0.875rem', color: 'var(--foreground)', boxSizing: 'border-box' }}
                  />
                </div>

                {formData.imagenUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFAF5', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={formData.imagenUrl} alt="Vista previa" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--fern)', fontWeight: 600 }}>✓ Imagen lista</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 600 }}>Color del Texto y Borde:</label>
                      <input type="color" value={formData.textColorHex || formData.colorHex} onChange={e => setFormData({...formData, textColorHex: e.target.value, colorHex: e.target.value})} style={{ width: '40px', height: '28px', padding: '0', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer' }} />
                      <button type="button" onClick={() => setFormData({...formData, imagenUrl: ''})} style={{ background: 'none', border: 'none', color: 'var(--peony)', cursor: 'pointer', fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 600 }}>Quitar</button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--fennel)', color: 'var(--text-secondary)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'linear-gradient(135deg, var(--fern) 0%, #5d7160 100%)', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px rgba(118,142,120,0.3)' }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
