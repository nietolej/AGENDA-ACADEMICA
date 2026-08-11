'use client';

import React, { useState, useEffect } from 'react';
import { Tarea } from '../materias/tareas.model';
import { MateriaDTO } from '../materias/materias.model';
import { ListTodo, ClipboardList, Star, Trash2 } from 'lucide-react';
import { useSemester } from '@/core/SemesterContext';

export default function TareasView() {
  const { selectedSemester } = useSemester();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const fetchOpts = { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } };
      const [matRes, tarRes] = await Promise.all([
        fetch(`/api/materias?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts),
        fetch(`/api/tareas?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts)
      ]);
      if (matRes.ok) setMaterias(await matRes.json());
      if (tarRes.ok) setTareas(await tarRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  const materiasMap = new Map<string, MateriaDTO>();
  materias.forEach(m => materiasMap.set(m.id, m));

  const completedTasks = tareas.filter(t => t.estado === 'listo');
  const progressPct = tareas.length === 0 ? 0 : Math.round((completedTasks.length / tareas.length) * 100);

  const handleToggleEstado = async (tarea: Tarea) => {
    const nuevoEstado = tarea.estado === 'listo' ? 'pendiente' : 'listo';
    try {
      const res = await fetch(`/api/tareas/${tarea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        setTareas(prev => {
          const newTareas = prev.map(t => (t.id === tarea.id ? { ...t, estado: nuevoEstado } : t));
          if (nuevoEstado === 'listo') {
            const allCompleted = newTareas.every(t => t.estado === 'listo');
            if (newTareas.length > 0 && allCompleted) {
              import('canvas-confetti').then(confetti => confetti.default());
            }
          }
          return newTareas;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTarea = async (id: string) => {
    try {
      const res = await fetch(`/api/tareas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTareas(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <header
        style={{
          background: '#ffffff',
          color: 'var(--foreground)',
          padding: '2rem',
          borderRadius: '0',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListTodo size={32} color="var(--primary-blue)" /> Todas las Tareas
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Vista general de todas tus tareas de todas las materias.
          </p>
        </div>

        {/* Resumen y Progreso Global */}
        <div style={{ background: '#f6f7f8', padding: '1.25rem', borderRadius: '0', border: '1px solid #e5e7eb', minWidth: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
            <span>Progreso Global</span>
            <span style={{ color: 'var(--primary-blue)' }}>{progressPct}%</span>
          </div>
          {/* Progress Bar */}
          <div style={{ background: '#e5e7eb', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'var(--primary-blue)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
            {completedTasks.length} de {tareas.length} tareas completadas en total
          </div>
        </div>
      </header>

      {/* Lista de Tareas */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando tareas...</div>
      ) : tareas.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f6f7f8', borderRadius: '0', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <ClipboardList size={48} color="#cbd5e1" />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)', fontSize: '1.25rem' }}>No tienes tareas creadas</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
            Puedes crear tareas dentro de cada materia para verlas aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tareas.map(t => {
            const mat = materiasMap.get(t.materiaId);
            const color = mat?.colorHex || '#3b82f6';
            const isListo = t.estado === 'listo';

            return (
              <div
                key={t.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '0',
                  background: isListo ? '#f6f7f8' : '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderLeft: `6px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  opacity: isListo ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={isListo}
                    onChange={() => handleToggleEstado(t)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: color }}
                  />
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: t.importante ? 800 : 500,
                        fontSize: '1.15rem',
                        color: isListo ? 'var(--text-secondary)' : 'var(--foreground)',
                        textDecoration: isListo ? 'line-through' : 'none'
                      }}
                    >
                        {t.importante && <Star size={18} color="#eab308" fill="#eab308" />} {t.titulo}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: `${color}18`,
                          color: color
                        }}
                      >
                        {mat?.nombre || 'Materia'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: isListo ? '#059669' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {t.fechaVencimiento ? `Vence: ${t.fechaVencimiento}` : 'Sin fecha'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTarea(t.id)}
                  title="Eliminar tarea"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
