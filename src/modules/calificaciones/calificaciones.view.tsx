'use client';

import React, { useState, useEffect } from 'react';
import { MateriaDTO } from '../materias/materias.model';
import { Examen } from '../materias/examenes.model';
import { 
  Award, 
  GraduationCap, 
  Plus, 
  Search, 
  Trash2, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Sparkles,
  CalendarDays,
  Table
} from 'lucide-react';
import { useSemester } from '@/core/SemesterContext';

export default function CalificacionesView() {
  const { selectedSemester } = useSemester();
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para agregar nueva calificación
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExamenDetail, setSelectedExamenDetail] = useState<{ exam: Examen, materiaNombre: string } | null>(null);
  const [newCalificacion, setNewCalificacion] = useState({
    materiaId: '',
    nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    nota: 85
  });

  const fetchData = async () => {
    try {
      const fetchOpts = { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } };
      const [matRes, exRes] = await Promise.all([
        fetch(`/api/materias?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts),
        fetch(`/api/examenes?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts)
      ]);

      if (matRes.ok) {
        const matData: MateriaDTO[] = await matRes.json();
        setMaterias(matData);
        if (matData.length > 0 && !newCalificacion.materiaId) {
          setNewCalificacion(prev => ({ ...prev, materiaId: matData[0].id }));
        }
      }
      if (exRes.ok) {
        const exData: Examen[] = await exRes.json();
        setExamenes(exData);
      }
    } catch (err) {
      console.error('Error cargando calificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  // Crear nueva calificación / examen
  const handleCreateCalificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalificacion.materiaId || !newCalificacion.nombre.trim()) return;

    try {
      const res = await fetch(`/api/materias/${newCalificacion.materiaId}/examenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newCalificacion.nombre.trim(),
          fecha: newCalificacion.fecha,
          nota: Math.min(100, Math.max(0, Number(newCalificacion.nota) || 0))
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewCalificacion(prev => ({ ...prev, nombre: '', nota: 85 }));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Actualizar nota en tiempo real
  const handleUpdateNota = async (id: string, nuevaNota: number) => {
    const notaValida = Math.min(100, Math.max(0, Number(nuevaNota) || 0));
    try {
      const res = await fetch(`/api/examenes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: notaValida })
      });
      if (res.ok) {
        setExamenes(prev => prev.map(ex => (ex.id === id ? { ...ex, nota: notaValida } : ex)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar examen
  const handleDeleteExamen = async (id: string) => {
    try {
      const res = await fetch(`/api/examenes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExamenes(prev => prev.filter(ex => ex.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cálculos Globales
  const totalExamenesConNota = examenes.filter(e => e.nota !== undefined && e.nota !== null);
  const sumaNotasGlobal = totalExamenesConNota.reduce((acc, curr) => acc + Number(curr.nota || 0), 0);
  const promedioGeneral = totalExamenesConNota.length > 0 
    ? Number((sumaNotasGlobal / totalExamenesConNota.length).toFixed(1)) 
    : 0;

  // Filtrado de materias
  const filteredMaterias = materias.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.codigo && m.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusPill = (score: number) => {
    if (score >= 90) return { label: 'Sobresaliente', bg: '#dcfce7', color: '#15803d' };
    if (score >= 70) return { label: 'Aprobado', bg: '#dbeafe', color: '#1d4ed8' };
    if (score >= 50) return { label: 'Regular', bg: '#fef3c7', color: '#b45309' };
    return { label: 'En Riesgo', bg: '#fee2e2', color: '#b91c1c' };
  };

  const globalStatus = getStatusPill(promedioGeneral);

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '0',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              <GraduationCap size={20} /> Rendimiento Académico
            </div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
              Mis Calificaciones
            </h1>
            <p style={{ margin: '0.4rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Monitorea tus notas, promedios y estado de aprobación en cada materia.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--primary-blue)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={18} /> Registrar Calificación
          </button>
        </div>

        {/* Global Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.75rem' }}>
          {/* Card Promedio General */}
          <div style={{ background: '#f6f7f8', padding: '1.25rem', borderRadius: '0', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Promedio General</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--foreground)' }}>{promedioGeneral}</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ 100 pts</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: globalStatus.bg, color: globalStatus.color }}>
                {globalStatus.label}
              </span>
            </div>
          </div>

          {/* Card Evaluaciones Realizadas */}
          <div style={{ background: '#f6f7f8', padding: '1.25rem', borderRadius: '0', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Evaluaciones</span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '0.5rem' }}>
              {totalExamenesConNota.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Notas registradas
            </div>
          </div>

          {/* Card Materias Registradas */}
          <div style={{ background: '#f6f7f8', padding: '1.25rem', borderRadius: '0', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Materias</span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '0.5rem' }}>
              {materias.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Asignaturas activas
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Visualización Rápida */}
      <div style={{
        background: '#ffffff',
        borderRadius: '0',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        padding: '1.5rem',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Table size={20} color="var(--primary-blue)" /> Tabla de Visualización Rápida
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {filteredMaterias.length} materia(s)
          </span>
        </div>

        {filteredMaterias.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>No hay materias para mostrar.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f6f7f8', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--foreground)', borderRadius: '8px 0 0 8px' }}>Materia</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--foreground)' }}>Calificaciones / Evaluaciones Obtenidas</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--foreground)', textAlign: 'center' }}>Promedio</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--foreground)', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterias.map((materia, idx) => {
                const materiaExamenes = examenes.filter(e => e.materiaId === materia.id);
                const sumNotas = materiaExamenes.reduce((acc, curr) => acc + Number(curr.nota || 0), 0);
                const promedioMateria = materiaExamenes.length > 0 ? Number((sumNotas / materiaExamenes.length).toFixed(1)) : 0;
                const matColor = materia.textColorHex || materia.colorHex || '#1865f2';
                const st = getStatusPill(promedioMateria);

                return (
                  <tr key={materia.id} style={{ borderBottom: idx === filteredMaterias.length - 1 ? 'none' : '1px solid #e5e7eb' }}>
                    {/* Nombre de Materia */}
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--foreground)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: matColor, display: 'inline-block' }} />
                        <div>
                          <div>{materia.nombre}</div>
                          {materia.codigo && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{materia.codigo}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Calificaciones Obtenidas */}
                    <td style={{ padding: '1rem' }}>
                      {materiaExamenes.length === 0 ? (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>Sin notas registradas</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {materiaExamenes.map(ex => {
                            const exScore = Number(ex.nota || 0);
                            const exSt = getStatusPill(exScore);
                            return (
                              <button 
                                key={ex.id}
                                type="button"
                                onClick={() => setSelectedExamenDetail({ exam: ex, materiaNombre: materia.nombre })}
                                title={`Clic para ver detalle: ${ex.nombre}`}
                                style={{
                                  background: exSt.bg,
                                  color: exSt.color,
                                  border: `1px solid ${exSt.color}40`,
                                  borderRadius: '8px',
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.9rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                {exScore}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Promedio */}
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', color: matColor }}>
                      {materiaExamenes.length > 0 ? `${promedioMateria} pts` : '-'}
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {materiaExamenes.length > 0 ? (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: st.bg,
                          color: st.color
                        }}>
                          {st.label}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pendiente</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Registrar Nueva Calificación */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '0', width: '100%', maxWidth: '460px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)' }}>
                Registrar Calificación
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCalificacion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Materia</label>
                <select
                  value={newCalificacion.materiaId}
                  onChange={e => setNewCalificacion({ ...newCalificacion, materiaId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f6f7f8', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Nombre de Evaluación / Examen</label>
                <input 
                  required
                  type="text"
                  placeholder="Ej: Parcial 1, Quiz 2, Proyecto Final..."
                  value={newCalificacion.nombre}
                  onChange={e => setNewCalificacion({ ...newCalificacion, nombre: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f6f7f8', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Fecha</label>
                  <input 
                    type="date"
                    value={newCalificacion.fecha}
                    onChange={e => setNewCalificacion({ ...newCalificacion, fecha: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f6f7f8', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Nota (0 - 100)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={newCalificacion.nota}
                    onChange={e => setNewCalificacion({ ...newCalificacion, nota: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f6f7f8', boxSizing: 'border-box', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', background: '#ffffff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'var(--primary-blue)', color: '#ffffff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Detalle de Calificación al dar clic en la nota */}
      {selectedExamenDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '0', width: '100%', maxWidth: '380px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)' }}>
                Detalle de Calificación
              </h3>
              <button onClick={() => setSelectedExamenDetail(null)} style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#f6f7f8', padding: '1rem', borderRadius: '0', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Materia</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--foreground)' }}>{selectedExamenDetail.materiaNombre}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Evaluación / Examen</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>{selectedExamenDetail.exam.nombre}</div>
              </div>

              {selectedExamenDetail.exam.fecha && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Fecha de Evaluación</span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 600 }}>{selectedExamenDetail.exam.fecha}</div>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Puntuación Obtendida</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: getStatusPill(Number(selectedExamenDetail.exam.nota)).color }}>
                  {selectedExamenDetail.exam.nota} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 100 pts</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedExamenDetail(null)}
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem', background: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
