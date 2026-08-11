'use client';

import React, { useState, useEffect } from 'react';
import { Tarea } from '../materias/tareas.model';
import { MateriaDTO } from '../materias/materias.model';
import PomodoroTimer from '../../components/PomodoroTimer';
import { Calendar, Sparkles, Plus, Trash2, Edit3, Search, ClipboardList, CheckSquare, X, Check, Clock, Star, CheckCircle } from 'lucide-react';
import { useSemester } from '@/core/SemesterContext';

export default function InicioView() {
  const { selectedSemester } = useSemester();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado del Modal de Tareas Pendientes
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estado para Formulario de Tarea Rápida de Hoy
  const [newQuickTaskTitle, setNewQuickTaskTitle] = useState('');
  const [newQuickTaskMateriaId, setNewQuickTaskMateriaId] = useState('');
  const [newQuickTaskImportante, setNewQuickTaskImportante] = useState(false);

  // Formato de Fecha de Hoy YYYY-MM-DD
  const today = new Date();
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateKey(today);

  // Cargar datos de materias y tareas
  const fetchData = async () => {
    try {
      const fetchOpts = { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } };
      const [matRes, tarRes] = await Promise.all([
        fetch(`/api/materias?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts),
        fetch(`/api/tareas?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts)
      ]);
      if (matRes.ok) {
        const matData: MateriaDTO[] = await matRes.json();
        setMaterias(matData);
        if (matData.length > 0 && !newQuickTaskMateriaId) {
          setNewQuickTaskMateriaId(matData[0].id);
        }
      }
      if (tarRes.ok) setTareas(await tarRes.json());
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  // Map de materias para lookup rápido
  const materiasMap = new Map<string, MateriaDTO>();
  materias.forEach(m => materiasMap.set(m.id, m));

  // Tareas de HOY
  const todayTasks = tareas.filter(t => t.fechaVencimiento === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.estado === 'listo');
  const todayProgressPct = todayTasks.length === 0 ? 0 : Math.round((completedTodayTasks.length / todayTasks.length) * 100);

  // Tareas PENDIENTES GLOBALES (que no sean de hoy ni estén completadas)
  const otherPendingTasks = tareas.filter(t => t.estado !== 'listo' && t.fechaVencimiento !== todayStr);

  // Filtrado de pendientes en el modal
  const filteredPendingTasks = otherPendingTasks.filter(t => {
    const mat = materiasMap.get(t.materiaId);
    const searchLower = modalSearch.toLowerCase();
    return (
      t.titulo.toLowerCase().includes(searchLower) ||
      (mat && mat.nombre.toLowerCase().includes(searchLower))
    );
  });

  // Alternar estado listo/pendiente de una tarea
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
            const todayT = newTareas.filter(tt => tt.fechaVencimiento === todayStr);
            const compT = todayT.filter(tt => tt.estado === 'listo');
            if (todayT.length > 0 && compT.length === todayT.length) {
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

  // Eliminar una tarea
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

  // Crear Tarea Rápida para Hoy
  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickTaskTitle.trim() || !newQuickTaskMateriaId) return;

    try {
      const res = await fetch(`/api/materias/${newQuickTaskMateriaId}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: newQuickTaskTitle.trim(),
          importante: newQuickTaskImportante,
          fechaVencimiento: todayStr
        })
      });
      if (res.ok) {
        const created = await res.json();
        setTareas(prev => [created, ...prev]);
        setNewQuickTaskTitle('');
        setNewQuickTaskImportante(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Seleccionar / Deseleccionar tarea en modal
  const handleToggleSelectTaskInModal = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllInModal = () => {
    if (selectedTaskIds.length === filteredPendingTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredPendingTasks.map(t => t.id));
    }
  };

  // Agregar Tareas Seleccionadas a Hoy
  const handleAddSelectedToToday = async () => {
    if (selectedTaskIds.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(
        selectedTaskIds.map(id =>
          fetch(`/api/tareas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fechaVencimiento: todayStr })
          })
        )
      );
      setTareas(prev =>
        prev.map(t => (selectedTaskIds.includes(t.id) ? { ...t, fechaVencimiento: todayStr } : t))
      );
      setSelectedTaskIds([]);
      setShowPendingModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const dayFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedToday = today.toLocaleDateString('es-ES', dayFormatOptions);

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Pomodoro Timer Bar */}
      <PomodoroTimer />

      {/* Banner de Bienvenida y Fecha */}
      <header
        style={{
          background: '#FDFAF5',
          color: 'var(--foreground)',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(118,142,120,0.10), 0 1px 4px rgba(46,53,48,0.06)',
          border: '1px solid var(--border)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'capitalize', marginBottom: '0.25rem' }}>
              <Calendar size={16} /> {formattedToday}
            </div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
              ¡Hola de nuevo!
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Organiza tus metas académicas para el día de hoy.
            </p>
          </div>
        </div>

        {/* Resumen y Progreso */}
        <div style={{ background: 'var(--surface-alt)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)', minWidth: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
            <span>Progreso de Hoy</span>
            <span style={{ color: 'var(--fern)' }}>{todayProgressPct}%</span>
          </div>
          {/* Progress Bar */}
          <div style={{ background: 'var(--border)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: `${todayProgressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--fern) 0%, #5d7160 100%)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
            {completedTodayTasks.length} de {todayTasks.length} tareas completadas
          </div>
        </div>
      </header>

      {/* Sección TODO List de Hoy */}
      <section style={{ background: '#FDFAF5', padding: '1.75rem', borderRadius: '16px', boxShadow: '0 4px 16px rgba(118,142,120,0.10), 0 1px 4px rgba(46,53,48,0.06)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={24} color="var(--primary-blue)" /> TODO List para Hoy
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              {todayTasks.length === 0 ? 'No tienes tareas asignadas para el día de hoy.' : `Tienes ${todayTasks.length - completedTodayTasks.length} tarea(s) pendiente(s) por realizar hoy.`}
            </p>
          </div>

          {/* Botón Principal: Ver Todos los Pendientes */}
          <button
            onClick={() => setShowPendingModal(true)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(135deg, var(--fern) 0%, #5d7160 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s ease, transform 0.15s ease',
              boxShadow: '0 2px 10px rgba(118,142,120,0.35)'
            }}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <ClipboardList size={18} /> Ver Todos los Pendientes ({otherPendingTasks.length})
          </button>
        </div>

        {/* Lista de Tareas para Hoy */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando tareas de hoy...</div>
        ) : todayTasks.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={40} color="var(--fern)" opacity={0.7} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)', fontSize: '1.1rem' }}>¡Tu lista de hoy está limpia!</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', fontSize: '0.9rem' }}>
              Haz clic en <strong>"Ver Todos los Pendientes"</strong> para elegir qué tareas quieres completar hoy.
            </p>
            <button
              onClick={() => setShowPendingModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', padding: '0.6rem 1.2rem', background: 'var(--primary-light)', color: 'var(--fern)', border: '1px solid var(--fern)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={18} /> Seleccionar Tareas Pendientes
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {todayTasks.map(t => {
              const mat = materiasMap.get(t.materiaId);
              const color = mat?.colorHex || 'var(--primary-blue)';
              const isListo = t.estado === 'listo';

              return (
                <div
                  key={t.id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    background: isListo ? 'var(--surface-alt)' : '#FDFAF5',
                    border: '1px solid var(--border)',
                    borderLeft: `5px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    opacity: isListo ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={isListo}
                      onChange={() => handleToggleEstado(t)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--fern)' }}
                    />
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: t.importante ? 700 : 500,
                          fontSize: '1.05rem',
                          color: isListo ? 'var(--text-secondary)' : 'var(--foreground)',
                          textDecoration: isListo ? 'line-through' : 'none'
                        }}
                      >
                        {t.importante && <Star size={16} color="#eab308" fill="#eab308" />} {t.titulo}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: `${color}18`,
                            color: color
                          }}
                        >
                          {mat?.nombre || 'Materia'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: isListo ? 'var(--fern)' : 'var(--peach)', fontWeight: 700 }}>
                          {isListo ? <><CheckCircle size={14} /> Completado</> : <><Clock size={14} /> Pendiente de Hoy</>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTarea(t.id)}
                    title="Eliminar tarea"
                    style={{ background: 'rgba(231,152,151,0.12)', border: 'none', color: 'var(--peony)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulario Rápido para Crear Nueva Tarea de Hoy */}
        <form
          onSubmit={handleCreateQuickTask}
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            background: 'var(--surface-alt)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <input
            type="text"
            placeholder="Escribe una nueva tarea para HOY..."
            value={newQuickTaskTitle}
            onChange={e => setNewQuickTaskTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '0.95rem',
              background: '#FDFAF5',
              color: 'var(--foreground)'
            }}
          />

          <select
            value={newQuickTaskMateriaId}
            onChange={e => setNewQuickTaskMateriaId(e.target.value)}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: '#FDFAF5',
              color: 'var(--foreground)'
            }}
          >
            {materias.map(m => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={newQuickTaskImportante}
              onChange={e => setNewQuickTaskImportante(e.target.checked)}
              style={{ accentColor: 'var(--honey)' }}
            />
            <Star size={16} color={newQuickTaskImportante ? "#eab308" : "currentColor"} fill={newQuickTaskImportante ? "#eab308" : "none"} /> Importante
          </label>

          <button
            type="submit"
            disabled={!newQuickTaskTitle.trim()}
            style={{
              padding: '0.6rem 1.25rem',
              background: newQuickTaskTitle.trim() ? 'linear-gradient(135deg, var(--fern) 0%, #5d7160 100%)' : 'var(--border)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: newQuickTaskTitle.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: newQuickTaskTitle.trim() ? '0 2px 8px rgba(118,142,120,0.3)' : 'none'
            }}
          >
            <Plus size={18} /> Agregar a Hoy
          </button>
        </form>
      </section>

      {/* Modal: Seleccionar Tareas Pendientes para Hoy */}
      {showPendingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(46,53,48,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#FDFAF5', padding: '2rem', borderRadius: '18px', width: '100%', maxWidth: '620px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(46,53,48,0.18), 0 4px 16px rgba(46,53,48,0.1)', border: '1px solid var(--border)' }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={22} color="var(--fern)" /> Tareas Pendientes
                </h2>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Selecciona las tareas pendientes que deseas agendar para HOY.
                </p>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                style={{ background: 'var(--fennel)', border: '1px solid var(--border)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filtro / Buscador */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Buscar por título o materia..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', background: '#FDFAF5', color: 'var(--foreground)' }}
                />
              </div>
              <button
                onClick={handleSelectAllInModal}
                style={{ padding: '0.55rem 0.85rem', background: 'var(--fennel)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--foreground)' }}
              >
                {selectedTaskIds.length === filteredPendingTasks.length && filteredPendingTasks.length > 0 ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>

            {/* Lista Scrollable de Pendientes */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px', marginBottom: '1.25rem' }}>
              {filteredPendingTasks.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={32} color="#cbd5e1" />
                  {modalSearch ? 'No se encontraron tareas con esa búsqueda.' : '¡No hay más tareas pendientes almacenadas en ninguna materia!'}
                </div>
              ) : (
                filteredPendingTasks.map(t => {
                  const mat = materiasMap.get(t.materiaId);
                  const color = mat?.colorHex || 'var(--primary-blue)';
                  const isSelected = selectedTaskIds.includes(t.id);

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleSelectTaskInModal(t.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: isSelected ? 'var(--primary-light)' : 'var(--surface-alt)',
                        border: isSelected ? '1px solid var(--fern)' : '1px solid var(--border)',
                        borderLeft: `5px solid ${color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div onClick
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--fern)' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: t.importante ? 700 : 500, fontSize: '0.95rem', color: 'var(--foreground)' }}>
                            {t.importante && <Star size={14} color="#eab308" fill="#eab308" />} {t.titulo}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            Materia: <strong>{mat?.nombre || 'Desconocida'}</strong> {t.fechaVencimiento ? `• Vence: ${t.fechaVencimiento}` : ''}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: isSelected ? 'var(--fern)' : 'var(--border)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {isSelected ? <><Check size={14} /> Seleccionada</> : 'Seleccionar'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal Acciones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {selectedTaskIds.length} tarea(s) seleccionada(s)
              </span>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowPendingModal(false)}
                  style={{ padding: '0.6rem 1.2rem', background: 'var(--fennel)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSelectedToToday}
                  disabled={selectedTaskIds.length === 0 || submitting}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: selectedTaskIds.length > 0 && !submitting ? 'linear-gradient(135deg, var(--fern) 0%, #5d7160 100%)' : 'var(--border)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: selectedTaskIds.length > 0 && !submitting ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: selectedTaskIds.length > 0 && !submitting ? '0 2px 8px rgba(118,142,120,0.3)' : 'none'
                  }}
                >
                  {submitting ? 'Guardando...' : <><Plus size={18} /> Asignar a Hoy ({selectedTaskIds.length})</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
