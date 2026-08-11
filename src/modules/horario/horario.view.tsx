'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MateriaDTO, HorarioBloque } from '../materias/materias.model';
import { CalendarDays, Plus, X, Clock, GraduationCap } from 'lucide-react';

interface ScheduleClass {
  materiaId: string;
  materiaNombre: string;
  materiaCodigo?: string;
  profesor?: string;
  colorHex: string;
  dia: string;
  inicio: string;
  fin: string;
}

export default function HorarioView() {
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('todos'); // 'todos' or specific day

  // Modal states for adding a new class
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('');
  const [classDia, setClassDia] = useState<string>('Lunes');
  const [classInicio, setClassInicio] = useState<string>('07:00');
  const [classFin, setClassFin] = useState<string>('09:00');

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const fetchMaterias = async () => {
    try {
      const res = await fetch(`/api/materias?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data: MateriaDTO[] = await res.json();
        setMaterias(data);
        if (data.length > 0 && !selectedMateriaId) {
          setSelectedMateriaId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMateriaId) return;

    const targetMat = materias.find(m => m.id === selectedMateriaId);
    if (!targetMat) return;

    const currentBlocks: HorarioBloque[] = targetMat.horarios || [];
    const updatedBlocks = [
      ...currentBlocks,
      { dia: classDia, inicio: classInicio, fin: classFin }
    ];

    try {
      const res = await fetch(`/api/materias/${selectedMateriaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horarios: updatedBlocks })
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchMaterias();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClass = async (materiaId: string, blockToRemove: HorarioBloque) => {
    if (!confirm('¿Eliminar esta clase del horario?')) return;
    const targetMat = materias.find(m => m.id === materiaId);
    if (!targetMat) return;

    const currentBlocks: HorarioBloque[] = targetMat.horarios || [];
    const updatedBlocks = currentBlocks.filter(
      b => !(b.dia === blockToRemove.dia && b.inicio === blockToRemove.inicio && b.fin === blockToRemove.fin)
    );

    try {
      const res = await fetch(`/api/materias/${materiaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horarios: updatedBlocks })
      });
      if (res.ok) {
        fetchMaterias();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Flatten all class blocks across all materias
  const allClasses: ScheduleClass[] = [];

  materias.forEach(m => {
    const color = m.colorHex || '#3b82f6';
    if (m.horarios && m.horarios.length > 0) {
      m.horarios.forEach(h => {
        allClasses.push({
          materiaId: m.id,
          materiaNombre: m.nombre,
          materiaCodigo: m.codigo,
          profesor: m.profesor,
          colorHex: color,
          dia: h.dia,
          inicio: h.inicio,
          fin: h.fin
        });
      });
    } else if (m.horario) {
      allClasses.push({
        materiaId: m.id,
        materiaNombre: m.nombre,
        materiaCodigo: m.codigo,
        profesor: m.profesor,
        colorHex: color,
        dia: 'Lunes',
        inicio: '08:00',
        fin: '10:00'
      });
    }
  });

  // Group classes by day
  const classesByDay = new Map<string, ScheduleClass[]>();
  diasSemana.forEach(d => classesByDay.set(d, []));

  allClasses.forEach(c => {
    const existing = classesByDay.get(c.dia) || [];
    existing.push(c);
    existing.sort((a, b) => a.inicio.localeCompare(b.inicio));
    classesByDay.set(c.dia, existing);
  });

  const totalClassesCount = allClasses.length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={36} color="var(--primary-blue)" /> Horario Semanal
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Matriz de clases organizada por bloques de hora y días de la semana
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1.5rem', background: '#ffffff', padding: '0.6rem 1.25rem', borderRadius: '0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>CLASES SEMANALES</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{totalClassesCount}</span>
            </div>
            <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>MATERIAS</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)' }}>{materias.length}</span>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-blue)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={18} /> Agregar Clase al Horario
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('todos')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '0',
            border: 'none',
            background: activeTab === 'todos' ? 'var(--primary-blue)' : '#ffffff',
            color: activeTab === 'todos' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}
        >
          Vista Semanal Completa
        </button>
        {diasSemana.map(d => {
          const count = (classesByDay.get(d) || []).length;
          return (
            <button
              key={d}
              onClick={() => setActiveTab(d)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === d ? 'var(--primary-blue)' : '#ffffff',
                color: activeTab === d ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTab === d ? 700 : 500,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              {d} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando horario...</div>
      ) : totalClassesCount === 0 ? (
        <div style={{ padding: '4rem', background: '#f6f7f8', borderRadius: '0', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
            No tienes bloques de horario definidos aún.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem auto 0 auto' }}
          >
            <Plus size={18} /> Agregar Tu Primera Clase
          </button>
        </div>
      ) : (
        /* Weekly Grid Matrix */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'todos' ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
            gap: '1.25rem'
          }}
        >
          {diasSemana
            .filter(d => activeTab === 'todos' || activeTab === d)
            .map(dia => {
              const dayClasses = classesByDay.get(dia) || [];

              return (
                  <div
                    key={dia}
                    style={{
                      background: '#ffffff',
                      borderRadius: '0',
                      padding: '1.25rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Day Column Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '0.75rem',
                        marginBottom: '1rem',
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)' }}>
                        {dia}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: dayClasses.length > 0 ? 'rgba(24, 101, 242, 0.1)' : '#f6f7f8',
                          color: dayClasses.length > 0 ? 'var(--primary-blue)' : 'var(--text-secondary)',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}
                      >
                        {dayClasses.length} {dayClasses.length === 1 ? 'clase' : 'clases'}
                      </span>
                    </div>

                    {/* Classes List */}
                    {dayClasses.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                        Sin clases este día
                      </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {dayClasses.map((cls, i) => (
                          <div
                            key={i}
                            style={{
                              background: '#ffffff',
                              borderLeft: `6px solid ${cls.colorHex}`,
                              borderRadius: '0',
                              padding: '1rem',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                              borderTop: '1px solid #e5e7eb',
                              borderRight: '1px solid #e5e7eb',
                              borderBottom: '1px solid #e5e7eb',
                              position: 'relative'
                            }}
                          >
                            <button
                              onClick={() => handleDeleteClass(cls.materiaId, { dia: cls.dia, inicio: cls.inicio, fin: cls.fin })}
                              style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                              padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Eliminar clase del horario"
                            >
                              <X size={16} />
                            </button>

                            <Link
                              href={`/materias/${cls.materiaId}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {/* Time Badge */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', paddingRight: '1.5rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, background: `${cls.colorHex}18`, color: cls.colorHex, padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Clock size={12} /> {cls.inicio} - {cls.fin}
                                </span>
                                {cls.materiaCodigo && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    {cls.materiaCodigo}
                                  </span>
                                )}
                              </div>

                              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                                {cls.materiaNombre}
                              </div>

                              {cls.profesor && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <GraduationCap size={14} /> {cls.profesor}
                                </div>
                              )}
                            </Link>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Modal Agregar Clase */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0', width: '100%', maxWidth: '420px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.4rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={22} color="var(--primary-blue)" /> Agregar Clase al Horario</h2>

            {materias.length === 0 ? (
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>Debes tener al menos una Materia creada antes de programar su horario.</p>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '0.5rem 1rem', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Selecciona la Materia</label>
                  <select
                    value={selectedMateriaId}
                    onChange={e => setSelectedMateriaId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                    required
                  >
                    {materias.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} ({m.codigo || 'S/C'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Día de la Semana</label>
                  <select
                    value={classDia}
                    onChange={e => setClassDia(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                  >
                    {diasSemana.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Hora Inicio</label>
                    <input
                      type="time"
                      value={classInicio}
                      onChange={e => setClassInicio(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Hora Fin</label>
                    <input
                      type="time"
                      value={classFin}
                      onChange={e => setClassFin(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--foreground)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'var(--primary-blue)', color: 'white', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Guardar Clase
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
