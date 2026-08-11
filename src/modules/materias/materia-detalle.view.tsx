'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MateriaDTO } from './materias.model';
import { SubTema } from './subtemas.model';
import { Tarea, TareaEstado } from './tareas.model';
import { Examen } from './examenes.model';
import { Pencil, Clock, ChevronDown, ChevronRight, Star, X, Trash2, FileText, CalendarDays, File, Plus, Paperclip, Upload, Folder, FolderOpen } from 'lucide-react';

export default function MateriaDetalleView({ materiaId }: { materiaId: string }) {
  const [materia, setMateria] = useState<MateriaDTO | null>(null);
  const [subTemas, setSubTemas] = useState<SubTema[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showSubTemaModal, setShowSubTemaModal] = useState(false);
  const [newSubTema, setNewSubTema] = useState({ titulo: '', descripcion: '', colorHex: '#4A90D9', imagenUrl: '', textColorHex: '#ffffff' });
  const [openSubtemas, setOpenSubtemas] = useState<Record<string, boolean>>({});
  const [uploadingSubtemaCover, setUploadingSubtemaCover] = useState(false);

  const toggleSubtemaOpen = (id: string) => {
    setOpenSubtemas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubtemaCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSubtemaCover(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        if (isEditing && editingSubTema) {
          setEditingSubTema({ ...editingSubTema, imagenUrl: data.url });
        } else {
          setNewSubTema({ ...newSubTema, imagenUrl: data.url });
        }
      } else {
        alert('Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingSubtemaCover(false);
    }
  };

  // Modal states for Editing Subtemas
  const [editingSubTema, setEditingSubTema] = useState<SubTema | null>(null);

  // Modal states for Editing Materia
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    codigo: '',
    semestre: '',
    creditos: 0,
    profesor: '',
    horario: '',
    horarios: [] as { dia: string, inicio: string, fin: string }[],
    colorHex: '',
    imagenUrl: '',
    textColorHex: '#ffffff'
  });

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const addHorarioBloque = () => {
    setEditFormData({
      ...editFormData,
      horarios: [...editFormData.horarios, { dia: 'Lunes', inicio: '07:00', fin: '09:00' }]
    });
  };

  const updateHorarioBloque = (index: number, field: string, value: string) => {
    const newHorarios = [...editFormData.horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setEditFormData({ ...editFormData, horarios: newHorarios });
  };

  const removeHorarioBloque = (index: number) => {
    setEditFormData({
      ...editFormData,
      horarios: editFormData.horarios.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        setEditFormData({ ...editFormData, imagenUrl: data.url });
      } else {
        alert('Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTo, setUploadingTo] = useState<string | null>(null);

  // States for Tareas
  const [newTareaTitulo, setNewTareaTitulo] = useState('');
  const [newTareaImportante, setNewTareaImportante] = useState(false);
  const [newTareaFecha, setNewTareaFecha] = useState('');

  // States for Notas
  const [showNotas, setShowNotas] = useState(false);
  const [activeNoteTab, setActiveNoteTab] = useState<'profesor' | 'generales'>('profesor');
  const [notasProfesor, setNotasProfesor] = useState('');
  const [notasGenerales, setNotasGenerales] = useState('');

  // States for Exámenes
  const [newExamenNombre, setNewExamenNombre] = useState('');
  const [newExamenFecha, setNewExamenFecha] = useState('');
  const [newExamenNota, setNewExamenNota] = useState<string>('');

  const fetchData = async () => {
    try {
      const fetchOpts = { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } };
      const [matRes, subRes, tareasRes, examRes] = await Promise.all([
        fetch(`/api/materias/${materiaId}?t=${Date.now()}`, fetchOpts),
        fetch(`/api/materias/${materiaId}/subtemas?t=${Date.now()}`, fetchOpts),
        fetch(`/api/materias/${materiaId}/tareas?t=${Date.now()}`, fetchOpts),
        fetch(`/api/materias/${materiaId}/examenes?t=${Date.now()}`, fetchOpts)
      ]);
      if (matRes.ok) {
        const matData = await matRes.json();
        setMateria(matData);
        setEditFormData({
          nombre: matData.nombre || '',
          codigo: matData.codigo || '',
          semestre: matData.semestre || '',
          creditos: matData.creditos || 0,
          profesor: matData.profesor || '',
          horario: matData.horario || '',
          horarios: matData.horarios || [],
          colorHex: matData.colorHex || '#4A90D9',
          imagenUrl: matData.imagenUrl || '',
          textColorHex: matData.textColorHex || '#ffffff'
        });
        setNotasProfesor(matData.notasProfesor || '');
        setNotasGenerales(matData.notasGenerales || '');
      }
      if (subRes.ok) setSubTemas(await subRes.json());
      if (tareasRes.ok) setTareas(await tareasRes.json());
      if (examRes.ok) setExamenes(await examRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [materiaId]);

  const handleCreateSubTema = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/materias/${materiaId}/subtemas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubTema)
      });
      if (res.ok) {
        setShowSubTemaModal(false);
        setNewSubTema({ titulo: '', descripcion: '', colorHex: '#4A90D9', imagenUrl: '', textColorHex: '#ffffff' });
        fetchData(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubTema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubTema) return;
    try {
      const res = await fetch(`/api/subtemas/${editingSubTema.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titulo: editingSubTema.titulo, 
          descripcion: editingSubTema.descripcion,
          colorHex: editingSubTema.colorHex,
          imagenUrl: editingSubTema.imagenUrl,
          textColorHex: editingSubTema.textColorHex
        })
      });
      if (res.ok) {
        setEditingSubTema(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, subTemaId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTo(subTemaId);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subTemaId', subTemaId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchData(); // Refresh to see the new file
      } else {
        const errData = await res.json();
        alert('Error al subir el archivo: ' + JSON.stringify(errData));
      }
    } catch (err) {
      console.error('Error uploading file', err);
      alert('Error de red al intentar subir el archivo.');
    } finally {
      setUploadingTo(null);
      e.target.value = '';
    }
  };

  const handleDeleteArchivo = async (subTemaId: string, archivoId: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
    try {
      const res = await fetch(`/api/subtemas/${subTemaId}/archivos/${archivoId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData(); // Refresh list
        // Update editingSubTema if it's the one being edited
        if (editingSubTema && editingSubTema.id === subTemaId) {
          setEditingSubTema({
            ...editingSubTema,
            archivos: editingSubTema.archivos.filter(a => a.id !== archivoId)
          });
        }
      } else {
        const error = await res.json();
        alert('Error al eliminar archivo: ' + JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al eliminar archivo');
    }
  };

  const handleDeleteSubTema = async (subTemaId: string) => {
    if (!confirm('¿Estás seguro de eliminar todo este Subtema y sus archivos?')) return;
    try {
      const res = await fetch(`/api/subtemas/${subTemaId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEditingSubTema(null);
        fetchData(); // Refresh list
      } else {
        const error = await res.json();
        alert('Error al eliminar subtema: ' + JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al eliminar subtema');
    }
  };

  const handleEditMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/materias/${materiaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotas = async () => {
    try {
      const res = await fetch(`/api/materias/${materiaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notasProfesor, notasGenerales })
      });
      if (res.ok) {
        // Optional: show a small toast or just let the user know it's saved.
        // Alert can be annoying so maybe we just rely on visual feedback if we wanted, but alert is fine for now
        alert('Notas guardadas exitosamente');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTareaTitulo.trim()) return;
    const tempId = `temp_${Date.now()}`;
    const tempTarea: Tarea = {
      id: tempId,
      materiaId,
      titulo: newTareaTitulo,
      estado: 'pendiente',
      importante: newTareaImportante,
      fechaVencimiento: newTareaFecha || undefined,
      fechaCreacion: new Date().toISOString()
    };
    setTareas(prev => [...prev, tempTarea]);
    setNewTareaTitulo('');
    setNewTareaImportante(false);
    setNewTareaFecha('');

    try {
      const res = await fetch(`/api/materias/${materiaId}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: tempTarea.titulo, importante: tempTarea.importante, fechaVencimiento: tempTarea.fechaVencimiento })
      });
      if (res.ok) {
        const created: Tarea = await res.json();
        setTareas(prev => prev.map(t => t.id === tempId ? created : t));
        fetchData();
      } else {
        setTareas(prev => prev.filter(t => t.id !== tempId));
      }
    } catch (err) {
      console.error(err);
      setTareas(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const handleUpdateTarea = async (id: string, updates: Partial<Tarea>) => {
    setTareas(prev => {
      const newTareas = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      
      if (updates.estado === 'listo') {
        const allDone = newTareas.length > 0 && newTareas.every(t => t.estado === 'listo');
        if (allDone) {
          import('canvas-confetti').then(confetti => confetti.default());
        }
      }
      
      return newTareas;
    });
    try {
      const res = await fetch(`/api/tareas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) fetchData();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleDeleteTarea = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    setTareas(prev => prev.filter(t => t.id !== id));
    try {
      const res = await fetch(`/api/tareas/${id}`, { method: 'DELETE' });
      if (!res.ok) fetchData();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleCreateExamen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamenNombre.trim()) return;
    const notaNum = Math.min(100, Math.max(0, Number(newExamenNota) || 0));
    try {
      const res = await fetch(`/api/materias/${materiaId}/examenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newExamenNombre, fecha: newExamenFecha, nota: notaNum })
      });
      if (res.ok) {
        const created = await res.json();
        setExamenes(prev => [...prev, created]);
        setNewExamenNombre('');
        setNewExamenFecha('');
        setNewExamenNota('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateExamen = async (id: string, updates: Partial<Examen>) => {
    setExamenes(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
    try {
      const res = await fetch(`/api/examenes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) fetchData();
      else fetchData();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleDeleteExamen = async (id: string) => {
    if (!confirm('¿Eliminar este examen?')) return;
    setExamenes(prev => prev.filter(ex => ex.id !== id));
    try {
      const res = await fetch(`/api/examenes/${id}`, { method: 'DELETE' });
      if (!res.ok) fetchData();
      else fetchData();
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando detalles...</div>;
  if (!materia) return <div style={{ padding: '2rem' }}>Materia no encontrada.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* SVG ClipPath Definition for Folder Shape */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <clipPath id="folder-card-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.10 C 0,0.04 0.02,0 0.05,0 L 0.36,0 C 0.39,0 0.41,0.04 0.43,0.10 L 0.95,0.10 C 0.98,0.10 1,0.15 1,0.20 L 1,0.94 C 1,0.98 0.98,1 0.95,1 L 0.05,1 C 0.02,1 0,0.98 0,0.94 Z" />
          </clipPath>
        </defs>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600 }}>
          ← Volver al Dashboard
        </Link>
        <button 
          onClick={() => setShowEditModal(true)}
          style={{
            padding: '0.5rem 1rem', background: '#f6f7f8', color: 'var(--text-secondary)', 
            border: '1px solid #e5e7eb', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
          <Pencil size={16} /> Editar Materia
        </button>
      </div>
      
      <header style={{ 
        background: '#ffffff', padding: '2rem', borderRadius: '0', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', borderTop: `8px solid ${materia.colorHex}`,
        border: '1px solid #e5e7eb', borderTopWidth: '8px',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)' }}>{materia.nombre}</h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span>{materia.codigo || 'S/C'}</span> • 
          <span>{materia.semestre || 'S/S'}</span> • 
          <span>{materia.creditos || 0} UC</span>
        </div>
        {(materia.profesor || materia.horario || (materia.horarios && materia.horarios.length > 0)) && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            {materia.profesor && <div><strong style={{ color: 'var(--foreground)' }}>Profesor:</strong> {materia.profesor}</div>}
            
            {(materia.horarios && materia.horarios.length > 0) ? (
              <div>
                <strong style={{ color: 'var(--foreground)' }}>Horario:</strong>
                <ul style={{ listStyle: 'none', margin: '0.25rem 0 0 0', padding: 0 }}>
                  {materia.horarios.map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {h.dia} {h.inicio} - {h.fin}</li>
                  ))}
                </ul>
              </div>
            ) : materia.horario ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><strong style={{ color: 'var(--foreground)' }}>Horario:</strong> <Clock size={14} /> {materia.horario}</div>
            ) : null}
          </div>
        )}
      </header>

      {/* Notas Section */}
      <section style={{ marginBottom: '3rem' }}>
        <button 
          onClick={() => setShowNotas(!showNotas)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', 
            padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', color: 'var(--text-secondary)'
          }}>
          {showNotas ? (
            <><ChevronDown size={18} /> Ocultar Notas</>
          ) : (
            <><ChevronRight size={18} /> Mostrar Notas y Recordatorios</>
          )}
        </button>

        {showNotas && (
          <div style={{ marginTop: '1rem', background: '#ffffff', borderRadius: '0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e5e7eb', borderTop: `4px solid ${materia.colorHex}` }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem', gap: '1rem' }}>
              <button 
                onClick={() => setActiveNoteTab('profesor')}
                style={{ 
                  padding: '0.5rem 1rem', background: 'none', border: 'none', 
                  borderBottom: activeNoteTab === 'profesor' ? `2px solid ${materia.colorHex}` : '2px solid transparent',
                  fontWeight: activeNoteTab === 'profesor' ? 700 : 500,
                  color: activeNoteTab === 'profesor' ? 'var(--foreground)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
                }}>
                Recordar al Profesor
              </button>
              <button 
                onClick={() => setActiveNoteTab('generales')}
                style={{ 
                  padding: '0.5rem 1rem', background: 'none', border: 'none', 
                  borderBottom: activeNoteTab === 'generales' ? `2px solid ${materia.colorHex}` : '2px solid transparent',
                  fontWeight: activeNoteTab === 'generales' ? 700 : 500,
                  color: activeNoteTab === 'generales' ? 'var(--foreground)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
                }}>
                Notas Generales
              </button>
            </div>

            {activeNoteTab === 'profesor' ? (
              <textarea 
                value={notasProfesor}
                onChange={(e) => setNotasProfesor(e.target.value)}
                onBlur={handleSaveNotas}
                placeholder="Escribe aquí las preguntas o recordatorios..."
                style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', resize: 'vertical', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            ) : (
              <textarea 
                value={notasGenerales}
                onChange={(e) => setNotasGenerales(e.target.value)}
                onBlur={handleSaveNotas}
                placeholder="Escribe aquí cualquier apunte general..."
                style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', resize: 'vertical', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Se guarda automáticamente al hacer clic fuera del texto.</span>
            </div>
          </div>
        )}
      </section>

      {/* To-Do List Section */}
      <section style={{ marginBottom: '3rem' }}>
        {(() => {
          const totalTareasCount = tareas.length;
          const listosTareasCount = tareas.filter(t => t.estado === 'listo').length;
          const progresoPorcentaje = totalTareasCount > 0 ? Math.round((listosTareasCount / totalTareasCount) * 100) : 0;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--foreground)' }}>To-Do List (Tareas)</h2>
              
              <div style={{ width: '100%', maxWidth: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Progreso de Tareas</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: progresoPorcentaje === 100 ? '#10b981' : materia.colorHex }}>
                    {progresoPorcentaje}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${progresoPorcentaje}%`, 
                    background: progresoPorcentaje === 100 ? '#10b981' : materia.colorHex,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          );
        })()}
        
        <div style={{ background: '#ffffff', borderRadius: '0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e5e7eb', borderTop: `4px solid ${materia.colorHex}` }}>
          
          <form onSubmit={handleCreateTarea} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Nueva tarea..." 
              value={newTareaTitulo} 
              onChange={e => setNewTareaTitulo(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8' }}
            />
            <input
              type="date"
              value={newTareaFecha}
              onChange={e => setNewTareaFecha(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', color: 'var(--text-secondary)' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0 0.5rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={newTareaImportante} onChange={e => setNewTareaImportante(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              {newTareaImportante ? <Star size={18} color="#eab308" fill="#eab308" /> : <Star size={18} color="var(--text-secondary)" />} Importante
            </label>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Agregar
            </button>
          </form>

          {tareas.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>No hay tareas pendientes. ¡Todo al día!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[...tareas].sort((a, b) => {
                if (a.importante !== b.importante) {
                  return Number(b.importante) - Number(a.importante);
                }
                if (a.fechaVencimiento && b.fechaVencimiento) {
                  return a.fechaVencimiento.localeCompare(b.fechaVencimiento);
                }
                if (a.fechaVencimiento && !b.fechaVencimiento) return -1;
                if (!a.fechaVencimiento && b.fechaVencimiento) return 1;
                return 0;
              }).map(tarea => (
                <li key={tarea.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                  background: tarea.estado === 'listo' ? '#f6f7f8' : '#ffffff', 
                  border: '1px solid #e5e7eb', borderRadius: '0',
                  opacity: tarea.estado === 'listo' ? 0.7 : 1,
                  flexWrap: 'wrap'
                }}>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                    <input 
                      type="checkbox" 
                      checked={tarea.estado === 'listo'}
                      onChange={(e) => handleUpdateTarea(tarea.id, { estado: e.target.checked ? 'listo' : 'pendiente' })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <button 
                      onClick={() => handleUpdateTarea(tarea.id, { importante: !tarea.importante })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                      title={tarea.importante ? "Marcar como no importante" : "Marcar como importante"}
                    >
                      {tarea.importante ? <Star size={18} color="#eab308" fill="#eab308" /> : <Star size={18} color="#cbd5e1" />}
                    </button>
                    <span style={{ 
                      textDecoration: tarea.estado === 'listo' ? 'line-through' : 'none',
                      fontWeight: tarea.importante ? 700 : 500,
                      color: tarea.estado === 'listo' ? 'var(--text-secondary)' : 'var(--foreground)'
                    }}>
                      {tarea.titulo}
                    </span>
                  </div>

                  <input
                    type="date"
                    value={tarea.fechaVencimiento || ''}
                    onChange={(e) => handleUpdateTarea(tarea.id, { fechaVencimiento: e.target.value })}
                    style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb',
                      color: tarea.estado === 'listo' ? 'var(--text-secondary)' : 'var(--text-secondary)',
                      background: 'transparent'
                    }}
                    title="Fecha de Vencimiento"
                  />

                  <select 
                    value={tarea.estado} 
                    onChange={e => handleUpdateTarea(tarea.id, { estado: e.target.value as TareaEstado })}
                    style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb',
                      background: tarea.estado === 'listo' ? '#d1fae5' : tarea.estado === 'en_proceso' ? '#fef3c7' : '#f6f7f8',
                      color: tarea.estado === 'listo' ? '#065f46' : tarea.estado === 'en_proceso' ? '#92400e' : 'var(--text-secondary)'
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="listo">Listo</option>
                  </select>

                  <button 
                    onClick={() => handleDeleteTarea(tarea.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Eliminar tarea"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Exámenes Section */}
      <section style={{ marginBottom: '3rem' }}>
        {(() => {
          const totalExamenes = examenes.length;
          const sumaNotas = examenes.reduce((acc, curr) => acc + Number(curr.nota || 0), 0);
          const promedioExamenes = totalExamenes > 0 ? (sumaNotas / totalExamenes).toFixed(1) : '0.0';

          return (
            <div style={{ background: '#ffffff', borderRadius: '0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e5e7eb', borderTop: `4px solid ${materia.colorHex}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={28} color="var(--primary-blue)" /> Exámenes y Evaluaciones
                  </h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Escala de calificación: 0 a 100 puntos</span>
                </div>

                <div style={{ background: '#f6f7f8', padding: '0.5rem 1.25rem', borderRadius: '0', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>PROMEDIO EXÁMENES</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: Number(promedioExamenes) >= 60 ? '#10b981' : '#ef4444' }}>
                    {promedioExamenes} / 100 pts
                  </span>
                </div>
              </div>

              {/* Form Agregar Examen */}
              <form onSubmit={handleCreateExamen} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nombre del examen (ej. Parcial 1)..."
                  value={newExamenNombre}
                  onChange={e => setNewExamenNombre(e.target.value)}
                  style={{ flex: 2, minWidth: '180px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8' }}
                  required
                />
                <input
                  type="date"
                  value={newExamenFecha}
                  onChange={e => setNewExamenFecha(e.target.value)}
                  style={{ flex: 1, minWidth: '130px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', color: 'var(--text-secondary)' }}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Nota (0-100)..."
                  value={newExamenNota}
                  onChange={e => setNewExamenNota(e.target.value)}
                  style={{ width: '130px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8' }}
                />
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  + Agregar Examen
                </button>
              </form>

              {/* Lista de Exámenes */}
              {examenes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0', fontStyle: 'italic' }}>No hay exámenes o evaluaciones registradas aún.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[...examenes].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')).map(ex => {
                    const nota = Number(ex.nota || 0);
                    let badgeBg = '#d1fae5';
                    let badgeColor = '#065f46';
                    if (nota < 50) { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; }
                    else if (nota < 70) { badgeBg = '#fef3c7'; badgeColor = '#92400e'; }
                    else if (nota < 90) { badgeBg = '#dbeafe'; badgeColor = '#1e40af'; }

                    return (
                      <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '200px' }}>
                          <span style={{ color: 'var(--primary-blue)' }}><FileText size={24} /></span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#111827' }}>{ex.nombre}</div>
                            {ex.fecha && <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CalendarDays size={14} /> Fecha: {ex.fecha}</div>}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Nota:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={ex.nota}
                              onChange={(e) => handleUpdateExamen(ex.id, { nota: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                              style={{ width: '70px', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontWeight: 700, textAlign: 'center' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>/ 100</span>
                          </div>

                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', background: badgeBg, color: badgeColor, fontWeight: 700, fontSize: '0.8rem' }}>
                            {nota >= 70 ? 'Aprobado' : nota >= 50 ? 'Regular' : 'Reprobado'}
                          </span>

                          <button
                            onClick={() => handleDeleteExamen(ex.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Eliminar examen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* Subtemas Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Folder size={28} color={materia.textColorHex || materia.colorHex} /> Subtemas y Materiales
          </h2>
          <button 
            onClick={() => setShowSubTemaModal(true)}
            style={{
              padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary-blue)', color: '#fff',
              border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
            <Plus size={16} /> Nuevo Subtema
          </button>
        </div>

        {subTemas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#f6f7f8', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No hay subtemas o carpetas creadas aún.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {subTemas.map(sub => {
              const isOpen = !!openSubtemas[sub.id];
              const colorAccent = materia.textColorHex || materia.colorHex || '#4A90D9';

              return !isOpen ? (
                /* Closed Folder View (Exact Same Folder Silhouette Aesthetic) */
                <div key={sub.id} style={{ position: 'relative', width: '100%', height: '220px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))', cursor: 'pointer' }} onClick={() => toggleSubtemaOpen(sub.id)}>
                  <div style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '100%', 
                    clipPath: 'url(#folder-card-clip)', 
                    WebkitClipPath: 'url(#folder-card-clip)',
                    background: sub.colorHex || colorAccent
                  }}>
                    {sub.imagenUrl ? (
                      <img 
                        src={sub.imagenUrl} 
                        alt={sub.titulo} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          objectPosition: 'center', 
                          display: 'block' 
                        }} 
                      />
                    ) : null}
                    <h3 style={{
                      position: 'absolute',
                      top: '18%',
                      left: '1.25rem',
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: sub.textColorHex || '#ffffff',
                      textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      wordBreak: 'break-word',
                      zIndex: 2,
                      maxWidth: 'calc(100% - 2.5rem)',
                      lineHeight: 1.2
                    }}>
                      {sub.titulo}
                    </h3>

                    <div style={{ position: 'absolute', bottom: '0.85rem', left: '1.25rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.85rem', zIndex: 2 }}>
                      📂 {sub.archivos.length} {sub.archivos.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}
                    </div>

                    <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingSubTema(sub); }}
                        style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.1)', padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--foreground)', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                        title="Editar Subtema"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleSubtemaOpen(sub.id); }}
                        style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.1)', padding: '0.45rem 0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.8rem', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                      >
                        <FolderOpen size={15} /> Abrir Archivos
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Opened Folder Details & Files View */
                <div key={sub.id} style={{ 
                  background: '#ffffff', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
                  border: '1px solid #e5e7eb', 
                  borderTop: `6px solid ${colorAccent}`,
                  position: 'relative',
                  gridColumn: '1 / -1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => toggleSubtemaOpen(sub.id)}>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FolderOpen size={22} color={colorAccent} />
                        {sub.titulo}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        📂 {sub.archivos.length} {sub.archivos.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setEditingSubTema(sub)}
                        style={{ background: '#f6f7f8', border: '1px solid #e5e7eb', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Editar Subtema"
                      >
                        <Pencil size={15} /> Editar
                      </button>
                      <button 
                        onClick={() => toggleSubtemaOpen(sub.id)}
                        style={{ background: 'var(--primary-blue)', color: '#ffffff', border: 'none', cursor: 'pointer', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        Cerrar Carpeta
                      </button>
                    </div>
                  </div>

                  {sub.descripcion && (
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{sub.descripcion}</p>
                  )}

                  <div style={{ background: '#f6f7f8', padding: '1.25rem', borderRadius: '10px', marginTop: '1rem', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={18} color={colorAccent} /> Archivos y Materiales Adjuntos
                    </h4>
                    
                    {sub.archivos.length === 0 ? (
                      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin archivos adjuntos en esta carpeta.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sub.archivos.map(arch => (
                          <li key={arch.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <File size={18} color="var(--primary-blue)" />
                            <a href={arch.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', flex: 1, wordBreak: 'break-all' }}>
                              {arch.nombre}
                            </a>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>{(arch.tamanoBytes / 1024).toFixed(1)} KB</span>
                            <button 
                              onClick={() => handleDeleteArchivo(sub.id, arch.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                              title="Eliminar archivo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, sub.id)}
                        disabled={uploadingTo === sub.id}
                        style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                      <button style={{
                        padding: '0.6rem 1.1rem', background: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.4rem'
                      }}>
                        <Paperclip size={16} /> {uploadingTo === sub.id ? 'Subiendo...' : '+ Adjuntar Nuevo Archivo'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Subtema */}
      {showSubTemaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--foreground)' }}>Nuevo Subtema</h2>
            <form onSubmit={handleCreateSubTema} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Título del Subtema</label>
                <input required type="text" value={newSubTema.titulo} onChange={e => setNewSubTema({...newSubTema, titulo: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Descripción (opcional)</label>
                <textarea rows={3} value={newSubTema.descripcion} onChange={e => setNewSubTema({...newSubTema, descripcion: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Color de la Carpeta</label>
                <input type="color" value={newSubTema.colorHex || '#4A90D9'} onChange={e => setNewSubTema({...newSubTema, colorHex: e.target.value, textColorHex: e.target.value})} 
                  style={{ width: '100%', height: '40px', padding: '0', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer' }} />
              </div>
              <div style={{ background: '#f6f7f8', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Imagen de Portada de la Carpeta (Opcional)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label 
                    htmlFor="subtema-new-cover-upload"
                    style={{
                      padding: '0.6rem 1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.875rem'
                    }}
                  >
                    <Upload size={16} /> {uploadingSubtemaCover ? 'Subiendo...' : 'Subir Imagen'}
                  </label>
                  <input 
                    id="subtema-new-cover-upload"
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleSubtemaCoverUpload(e, false)}
                    disabled={uploadingSubtemaCover}
                    style={{ display: 'none' }}
                  />
                  <input 
                    type="text" 
                    placeholder="o pega una URL..." 
                    value={newSubTema.imagenUrl || ''} 
                    onChange={e => setNewSubTema({...newSubTema, imagenUrl: e.target.value})}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', fontSize: '0.875rem', color: 'var(--foreground)', boxSizing: 'border-box' }}
                  />
                </div>
                {newSubTema.imagenUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={newSubTema.imagenUrl} alt="Vista previa" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>✓ Portada lista</span>
                    </div>
                    <button type="button" onClick={() => setNewSubTema({...newSubTema, imagenUrl: ''})} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Quitar</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowSubTemaModal(false)} 
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', background: 'white', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit" 
                  style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'var(--primary-blue)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Subtema */}
      {editingSubTema && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--foreground)' }}>Editar Subtema</h2>
              <button 
                type="button" 
                onClick={() => handleDeleteSubTema(editingSubTema.id)}
                style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Trash2 size={16} /> Eliminar Todo el Subtema
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubTema} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Título del Subtema</label>
                <input required type="text" value={editingSubTema.titulo} onChange={e => setEditingSubTema({...editingSubTema, titulo: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Descripción (opcional)</label>
                <textarea rows={3} value={editingSubTema.descripcion} onChange={e => setEditingSubTema({...editingSubTema, descripcion: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Color de la Carpeta</label>
                <input type="color" value={editingSubTema.colorHex || '#4A90D9'} onChange={e => setEditingSubTema({...editingSubTema, colorHex: e.target.value, textColorHex: e.target.value})} 
                  style={{ width: '100%', height: '40px', padding: '0', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer' }} />
              </div>
              <div style={{ background: '#f6f7f8', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Imagen de Portada de la Carpeta (Opcional)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label 
                    htmlFor="subtema-edit-cover-upload"
                    style={{
                      padding: '0.6rem 1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.875rem'
                    }}
                  >
                    <Upload size={16} /> {uploadingSubtemaCover ? 'Subiendo...' : 'Subir Imagen'}
                  </label>
                  <input 
                    id="subtema-edit-cover-upload"
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleSubtemaCoverUpload(e, true)}
                    disabled={uploadingSubtemaCover}
                    style={{ display: 'none' }}
                  />
                  <input 
                    type="text" 
                    placeholder="o pega una URL..." 
                    value={editingSubTema.imagenUrl || ''} 
                    onChange={e => setEditingSubTema({...editingSubTema, imagenUrl: e.target.value})}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', fontSize: '0.875rem', color: 'var(--foreground)', boxSizing: 'border-box' }}
                  />
                </div>
                {editingSubTema.imagenUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={editingSubTema.imagenUrl} alt="Vista previa" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>✓ Portada lista</span>
                    </div>
                    <button type="button" onClick={() => setEditingSubTema({...editingSubTema, imagenUrl: ''})} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Quitar</button>
                  </div>
                )}
              </div>

              <div style={{ background: '#f6f7f8', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Archivos Adjuntos</h4>
                {editingSubTema.archivos.length === 0 ? (
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sin archivos adjuntos.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {editingSubTema.archivos.map(arch => (
                      <li key={arch.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <File size={16} color="var(--primary-blue)" /> <a href={arch.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 500, flex: 1 }}>{arch.nombre}</a>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{(arch.tamanoBytes / 1024).toFixed(1)} KB</span>
                        <button 
                          type="button"
                          onClick={() => handleDeleteArchivo(editingSubTema.id, arch.id)}
                          style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Eliminar solo este archivo"
                        >
                          <X size={14} /> Borrar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingSubTema(null)} 
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', background: 'white', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit" 
                  style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'var(--primary-blue)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Materia */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--foreground)' }}>Editar Materia</h2>
            <form onSubmit={handleEditMateria} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Nombre</label>
                <input required type="text" value={editFormData.nombre} onChange={e => setEditFormData({...editFormData, nombre: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Código</label>
                  <input type="text" value={editFormData.codigo} onChange={e => setEditFormData({...editFormData, codigo: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Semestre</label>
                  <input type="text" value={editFormData.semestre} onChange={e => setEditFormData({...editFormData, semestre: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Créditos</label>
                  <input type="number" min="0" value={editFormData.creditos} onChange={e => setEditFormData({...editFormData, creditos: parseInt(e.target.value) || 0})} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Profesor</label>
                  <input type="text" value={editFormData.profesor} onChange={e => setEditFormData({...editFormData, profesor: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f6f7f8', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ background: '#f6f7f8', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Bloques de Horario</label>
                  <button type="button" onClick={addHorarioBloque} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Plus size={14} /> Añadir Bloque
                  </button>
                </div>
                
                {editFormData.horarios.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>Sin horario definido.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {editFormData.horarios.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                          value={h.dia} 
                          onChange={(e) => updateHorarioBloque(i, 'dia', e.target.value)}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff' }}
                        >
                          {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input 
                          type="time" 
                          value={h.inicio} 
                          onChange={(e) => updateHorarioBloque(i, 'inicio', e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        <input 
                          type="time" 
                          value={h.fin} 
                          onChange={(e) => updateHorarioBloque(i, 'fin', e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff' }}
                        />
                        <button type="button" onClick={() => removeHorarioBloque(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--foreground)', fontWeight: 600 }}>Color Identificador</label>
                <input type="color" value={editFormData.colorHex} onChange={e => setEditFormData({...editFormData, colorHex: e.target.value})} 
                  style={{ width: '100%', height: '40px', padding: '0', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer' }} />
              </div>
              
              <div style={{ background: '#f6f7f8', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--foreground)' }}>Imagen de Portada (Opcional)</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                    <button type="button" style={{ padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, pointerEvents: 'none' }}>
                      <Upload size={16} /> {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                    </button>
                  </div>
                  {editFormData.imagenUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>✓ Imagen subida</span>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--foreground)', fontWeight: 600 }}>Color del Texto</label>
                        <input type="color" value={editFormData.textColorHex} onChange={e => setEditFormData({...editFormData, textColorHex: e.target.value})} style={{ width: '60px', height: '30px', padding: '0', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} 
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', background: 'white', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit" 
                  style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'var(--primary-blue)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
