'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MateriaDTO } from '../materias/materias.model';
import { Tarea } from '../materias/tareas.model';
import { Examen } from '../materias/examenes.model';
import { CalendarDays, Calendar, Target, ChevronUp, ChevronDown, ZoomIn, ZoomOut, Search, Plus, Minus, FileText, Star, CheckCircle, Clock, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useSemester } from '@/core/SemesterContext';

export default function CalendarioView() {
  const { selectedSemester } = useSemester();
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Nivel de Zoom (0.5x a 1.6x, por defecto 1.0x)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const today = new Date();

  // Selección Rápida de Mes y Año
  const [targetMonth, setTargetMonth] = useState<number>(today.getMonth());
  const [targetYear, setTargetYear] = useState<number>(today.getFullYear());
  const [showMonthPickerModal, setShowMonthPickerModal] = useState<boolean>(false);

  // Lista de meses a renderizar en la vista vertical continua
  const [months, setMonths] = useState<Date[]>(() => {
    const list: Date[] = [];
    const baseYear = today.getFullYear();
    const baseMonth = today.getMonth();
    // Inicializar con 7 meses centrados en el mes actual (-3 a +3)
    for (let offset = -3; offset <= 3; offset++) {
      list.push(new Date(baseYear, baseMonth + offset, 1));
    }
    return list;
  });

  const monthRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const fetchCalendarData = async () => {
    try {
      const fetchOpts = { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } };
      const [matRes, tarRes, exRes] = await Promise.all([
        fetch(`/api/materias?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts),
        fetch(`/api/tareas?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts),
        fetch(`/api/examenes?semestre=${selectedSemester}&t=${Date.now()}`, fetchOpts)
      ]);
      if (matRes.ok) setMaterias(await matRes.json());
      if (tarRes.ok) setTareas(await tarRes.json());
      if (exRes.ok) setExamenes(await exRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [selectedSemester]);

  // Hacer scroll automático al mes actual tras cargar la información
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        scrollToMonth(today.getFullYear(), today.getMonth(), false);
      }, 100);
    }
  }, [loading]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Manejadores de Zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(1.6, parseFloat((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, parseFloat((prev - 0.15).toFixed(2))));
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
  };

  // Manejadores de Scroll y Navegación de Meses
  const getMonthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

  const scrollToMonth = (y: number, m: number, smooth = true) => {
    const key = `${y}-${m}`;
    const el = monthRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    }
  };

  // Salto Rápido a un Mes Específico
  const handleJumpToMonth = (mIndex: number, yVal: number) => {
    setTargetMonth(mIndex);
    setTargetYear(yVal);

    const targetDate = new Date(yVal, mIndex, 1);
    const targetKey = getMonthKey(targetDate);

    setMonths(prev => {
      const exists = prev.some(m => getMonthKey(m) === targetKey);
      if (exists) return prev;
      const newMonths = [...prev];
      for (let offset = -1; offset <= 1; offset++) {
        const d = new Date(yVal, mIndex + offset, 1);
        if (!newMonths.some(m => getMonthKey(m) === getMonthKey(d))) {
          newMonths.push(d);
        }
      }
      return newMonths.sort((a, b) => a.getTime() - b.getTime());
    });

    setTimeout(() => {
      scrollToMonth(yVal, mIndex, true);
    }, 100);
  };

  const handleLoadEarlier = () => {
    setMonths(prev => {
      const first = prev[0];
      const newMonth = new Date(first.getFullYear(), first.getMonth() - 1, 1);
      return [newMonth, ...prev];
    });
  };

  const handleLoadLater = () => {
    setMonths(prev => {
      const last = prev[prev.length - 1];
      const newMonth = new Date(last.getFullYear(), last.getMonth() + 1, 1);
      return [...prev, newMonth];
    });
  };

  const handleScrollUpBtn = () => {
    handleLoadEarlier();
    setTimeout(() => {
      const first = months[0];
      const targetMonth = new Date(first.getFullYear(), first.getMonth() - 1, 1);
      scrollToMonth(targetMonth.getFullYear(), targetMonth.getMonth());
    }, 60);
  };

  const handleScrollDownBtn = () => {
    handleLoadLater();
    setTimeout(() => {
      const last = months[months.length - 1];
      const targetMonth = new Date(last.getFullYear(), last.getMonth() + 1, 1);
      scrollToMonth(targetMonth.getFullYear(), targetMonth.getMonth());
    }, 60);
  };

  const handleToday = () => {
    setTargetMonth(today.getMonth());
    setTargetYear(today.getFullYear());
    const currentMonthKey = getMonthKey(today);
    const exists = months.some(m => getMonthKey(m) === currentMonthKey);
    if (!exists) {
      setMonths(prev => [...prev, new Date(today.getFullYear(), today.getMonth(), 1)].sort((a, b) => a.getTime() - b.getTime()));
      setTimeout(() => scrollToMonth(today.getFullYear(), today.getMonth()), 100);
    } else {
      scrollToMonth(today.getFullYear(), today.getMonth());
    }
  };

  // Mapear materias para búsqueda rápida
  const materiasMap = new Map<string, MateriaDTO>();
  materias.forEach(m => materiasMap.set(m.id, m));

  // Formatear Date -> YYYY-MM-DD
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateKey(today);

  // Agrupar tareas por fechaVencimiento
  const tasksByDate = new Map<string, Tarea[]>();
  tareas.forEach(t => {
    if (t.fechaVencimiento) {
      const existing = tasksByDate.get(t.fechaVencimiento) || [];
      existing.push(t);
      tasksByDate.set(t.fechaVencimiento, existing);
    }
  });

  // Agrupar exámenes por fecha
  const examsByDate = new Map<string, Examen[]>();
  examenes.forEach(ex => {
    if (ex.fecha) {
      const existing = examsByDate.get(ex.fecha) || [];
      existing.push(ex);
      examsByDate.set(ex.fecha, existing);
    }
  });

  // Dimensiones calculadas según el Zoom
  const minCellHeight = Math.round(115 * zoomLevel);
  const dayNumberFontSize = `${(0.85 * zoomLevel).toFixed(2)}rem`;
  const pillFontSize = `${(0.73 * zoomLevel).toFixed(2)}rem`;
  const dayHeaderFontSize = `${(0.85 * zoomLevel).toFixed(2)}rem`;
  const monthTitleFontSize = `${(1.35 * zoomLevel).toFixed(2)}rem`;
  const pillMaxHeight = Math.max(40, Math.round(85 * zoomLevel));

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Barra Superior de Control (Sticky) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '1rem',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={28} color="var(--primary-blue)" /> Calendario Académico
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Selecciona un mes directamente o desplázate arriba/abajo. Ajusta el Zoom libremente.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Selección Rápida de Mes y Año (Dropdown Directo) */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f6f7f8', padding: '4px 8px', borderRadius: '10px', border: '1px solid #e5e7eb', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={14} /> Mes:
            </span>
            <select
              value={targetMonth}
              onChange={(e) => {
                const m = parseInt(e.target.value);
                handleJumpToMonth(m, targetYear);
              }}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--foreground)',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>{name}</option>
              ))}
            </select>

            <select
              value={targetYear}
              onChange={(e) => {
                const y = parseInt(e.target.value);
                handleJumpToMonth(targetMonth, y);
              }}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--foreground)',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {Array.from({ length: 9 }, (_, i) => today.getFullYear() - 3 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={() => setShowMonthPickerModal(true)}
              title="Abrir Selector Visual de 12 Meses"
              style={{
                padding: '0.4rem 0.75rem',
                background: 'var(--primary-blue)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Calendar size={16} /> Ver Meses
            </button>
          </div>

          {/* Controles de Navegación Vertical */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f6f7f8', padding: '4px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <button
              onClick={handleScrollUpBtn}
              title="Cargar / Ir al Mes Anterior (Arriba)"
              style={{
                padding: '0.45rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                color: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={handleToday}
              title="Ir al Mes de Hoy"
              style={{
                padding: '0.45rem 0.85rem',
                background: 'var(--primary-blue)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                margin: '0 4px',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              <Calendar size={16} /> Hoy
            </button>
            <button
              onClick={handleScrollDownBtn}
              title="Cargar / Ir al Mes Siguiente (Abajo)"
              style={{
                padding: '0.45rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                color: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Controles de Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f6f7f8', padding: '4px 8px', borderRadius: '10px', border: '1px solid #e5e7eb', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ZoomIn size={14} /> Zoom:
            </span>
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              title="Alejar Zoom"
              style={{
                padding: '0.35rem 0.65rem',
                background: zoomLevel <= 0.5 ? '#f6f7f8' : '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: zoomLevel <= 0.5 ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                color: 'var(--foreground)'
              }}
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <button
              onClick={handleZoomReset}
              title="Restablecer Zoom (100%)"
              style={{
                padding: '0.35rem 0.6rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: 'var(--primary-blue)'
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 1.6}
              title="Acercar Zoom"
              style={{
                padding: '0.35rem 0.65rem',
                background: zoomLevel >= 1.6 ? '#f6f7f8' : '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: zoomLevel >= 1.6 ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                color: 'var(--foreground)'
              }}
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          ⌛ Cargando calendario y entregas...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Botón superior para cargar meses más antiguos */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleLoadEarlier}
              style={{
                padding: '0.6rem 1.5rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
            >
              <ArrowUp size={16} /> Cargar Mes Anterior
            </button>
          </div>

          {/* Lista de Meses en Vertical */}
          {months.map(monthDate => {
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();
            const monthKey = getMonthKey(monthDate);

            // Cálculo de días del mes
            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);

            let startDayOfWeek = firstDayOfMonth.getDay() - 1;
            if (startDayOfWeek === -1) startDayOfWeek = 6;

            const totalDays = lastDayOfMonth.getDate();

            const calendarCells = [];
            for (let i = 0; i < startDayOfWeek; i++) {
              calendarCells.push(null);
            }
            for (let d = 1; d <= totalDays; d++) {
              calendarCells.push(new Date(year, month, d));
            }

            const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

            return (
              <section
                key={monthKey}
                ref={el => { monthRefs.current[monthKey] = el; }}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: isCurrentMonth ? '0 10px 30px rgba(24, 101, 242, 0.08)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                  overflow: 'visible',
                  border: isCurrentMonth ? '2px solid var(--primary-blue)' : '1px solid #e5e7eb',
                  scrollMarginTop: '110px'
                }}
              >
                {/* Bloque Encabezado Fijo del Mes (Título + Días de la Semana) */}
                <div
                  style={{
                    position: 'sticky',
                    top: '75px',
                    zIndex: 40,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Título del Mes */}
                  <div
                    style={{
                      background: isCurrentMonth ? 'var(--primary-blue)' : '#f6f7f8',
                      color: isCurrentMonth ? '#ffffff' : 'var(--foreground)',
                      padding: '0.85rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTopLeftRadius: '14px',
                      borderTopRightRadius: '14px',
                      borderBottom: isCurrentMonth ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: monthTitleFontSize, fontWeight: 800, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={Math.max(16, 20 * zoomLevel)} /> {monthNames[month]} {year}
                    </h2>
                    {isCurrentMonth && (
                      <span style={{ background: '#ffffff', color: 'var(--primary-blue)', padding: '3px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '0.8rem' }}>
                        MES ACTUAL
                      </span>
                    )}
                  </div>

                  {/* Encabezado Días de la Semana */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      background: '#ffffff',
                      color: 'var(--text-secondary)',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '0.6rem 0',
                      fontSize: dayHeaderFontSize,
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    {dayNames.map(d => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                </div>

                {/* Grid de Días del Mes */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridAutoRows: `minmax(${minCellHeight}px, auto)`,
                    background: '#e5e7eb',
                    gap: '1px'
                  }}
                >
                  {calendarCells.map((date, idx) => {
                    if (!date) {
                      return (
                        <div key={`empty-${idx}`} style={{ background: '#f6f7f8', padding: '0.5rem' }} />
                      );
                    }

                    const dateStr = formatDateKey(date);
                    const isToday = dateStr === todayStr;
                    const dayTasks = tasksByDate.get(dateStr) || [];
                    const dayExams = examsByDate.get(dateStr) || [];

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDay(date)}
                        style={{
                          background: isToday ? 'rgba(24, 101, 242, 0.05)' : '#ffffff',
                          padding: `${Math.max(4, Math.round(6 * zoomLevel))}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          position: 'relative'
                        }}
                      >
                        {/* Número del Día */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span
                            style={{
                              fontWeight: isToday ? 800 : 600,
                              fontSize: dayNumberFontSize,
                              color: isToday ? 'var(--primary-blue)' : 'var(--foreground)',
                              background: isToday ? 'rgba(24, 101, 242, 0.1)' : 'transparent',
                              padding: isToday ? '2px 8px' : '0',
                              borderRadius: '12px'
                            }}
                          >
                            {date.getDate()}
                          </span>
                          {isToday && (
                            <span style={{ fontSize: `${(0.6 * zoomLevel).toFixed(2)}rem`, fontWeight: 800, background: 'var(--primary-blue)', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                              HOY
                            </span>
                          )}
                        </div>

                        {/* Listado de Tareas y Exámenes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: `${pillMaxHeight}px` }}>
                          {dayExams.map(ex => {
                            const mat = materiasMap.get(ex.materiaId);
                            const color = mat?.colorHex || '#ef4444';
                            return (
                              <div
                                key={ex.id}
                                style={{
                                  fontSize: pillFontSize,
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  background: '#fef2f2',
                                  borderLeft: `3px solid ${color}`,
                                  color: '#991b1b',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                                title={`EXAMEN: ${ex.nombre} (${mat?.nombre || 'Materia'}) - Nota: ${ex.nota}/100`}
                              >
                                <FileText size={12} /> EXAMEN: {ex.nombre}
                              </div>
                            );
                          })}

                          {dayTasks.map(t => {
                            const mat = materiasMap.get(t.materiaId);
                            const color = mat?.colorHex || '#3b82f6';
                            const isListo = t.estado === 'listo';

                            return (
                              <div
                                key={t.id}
                                style={{
                                  fontSize: pillFontSize,
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  background: isListo ? '#f6f7f8' : `${color}15`,
                                  borderLeft: `3px solid ${color}`,
                                  color: isListo ? 'var(--text-secondary)' : 'var(--foreground)',
                                  textDecoration: isListo ? 'line-through' : 'none',
                                  fontWeight: t.importante ? 700 : 500,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                                title={`${t.titulo} (${mat?.nombre || 'Materia'})`}
                              >
                                {t.importante && <Star size={12} color="#eab308" fill="#eab308" />} {t.titulo}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Botón inferior para cargar meses más futuros */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={handleLoadLater}
              style={{
                padding: '0.6rem 1.5rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
            >
              <ArrowDown size={16} /> Cargar Mes Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de Selector Rápido de 12 Meses */}
      {showMonthPickerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays size={24} color="var(--primary-blue)" /> Seleccionar Mes y Año
              </h2>
              <button
                onClick={() => setShowMonthPickerModal(false)}
                style={{ background: '#f6f7f8', border: 'none', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selector de Año en el Modal */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#f6f7f8', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setTargetYear(prev => prev - 1)}
                style={{ padding: '0.4rem 0.8rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, color: 'var(--foreground)' }}
              >
                ◀ {targetYear - 1}
              </button>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--foreground)', minWidth: '80px', textAlign: 'center' }}>
                {targetYear}
              </span>
              <button
                onClick={() => setTargetYear(prev => prev + 1)}
                style={{ padding: '0.4rem 0.8rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, color: 'var(--foreground)' }}
              >
                {targetYear + 1} ▶
              </button>
            </div>

            {/* Grid de 12 Meses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {monthNames.map((name, idx) => {
                const isSelected = targetMonth === idx;
                const isTodayMonth = today.getFullYear() === targetYear && today.getMonth() === idx;

                return (
                  <button
                    key={name}
                    onClick={() => {
                      handleJumpToMonth(idx, targetYear);
                      setShowMonthPickerModal(false);
                    }}
                    style={{
                      padding: '1rem 0.5rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--primary-blue)' : '1px solid #e5e7eb',
                      background: isSelected ? 'rgba(24, 101, 242, 0.05)' : isTodayMonth ? '#f0fdf4' : '#ffffff',
                      color: isSelected ? 'var(--primary-blue)' : isTodayMonth ? '#166534' : 'var(--foreground)',
                      fontWeight: isSelected || isTodayMonth ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '1rem' }}>{name}</div>
                    {isTodayMonth && (
                      <span style={{ fontSize: '0.65rem', background: '#166534', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                        HOY
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setShowMonthPickerModal(false)}
                style={{ padding: '0.6rem 1.2rem', background: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle del Día Seleccionado */}
      {selectedDay && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={22} color="var(--primary-blue)" /> {selectedDay.getDate()} de {monthNames[selectedDay.getMonth()]} {selectedDay.getFullYear()}
              </h2>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ background: '#f6f7f8', border: 'none', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const dayStr = formatDateKey(selectedDay);
              const dayTasks = tasksByDate.get(dayStr) || [];
              const dayExams = examsByDate.get(dayStr) || [];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Exámenes */}
                  <div>
                    <h3 style={{ fontSize: '1rem', color: '#b91c1c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                      <FileText size={18} /> Exámenes este día ({dayExams.length})
                    </h3>
                    {dayExams.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0, fontSize: '0.875rem' }}>No hay exámenes agendados para esta fecha.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {dayExams.map(ex => {
                          const mat = materiasMap.get(ex.materiaId);
                          const color = mat?.colorHex || '#ef4444';
                          return (
                            <div key={ex.id} style={{ padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: `5px solid ${color}`, background: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <FileText size={16} /> {ex.nombre}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                                  Materia: {mat?.nombre || 'Desconocida'}
                                </div>
                              </div>
                              <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '12px', background: '#ffffff', color: '#991b1b', fontWeight: 800, border: '1px solid #fca5a5' }}>
                                Nota: {ex.nota} / 100 pts
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tareas */}
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.75rem', fontWeight: 700 }}>
                      Tareas Vencen Este Día ({dayTasks.length})
                    </h3>

                    {dayTasks.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, fontSize: '0.875rem' }}>No hay tareas agendadas para esta fecha.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {dayTasks.map(t => {
                          const mat = materiasMap.get(t.materiaId);
                          const color = mat?.colorHex || '#3b82f6';
                          return (
                            <div key={t.id} style={{ padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: `5px solid ${color}`, background: '#f6f7f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)' }}>
                                  {t.importante && <Star size={16} color="#eab308" fill="#eab308" />} {t.titulo}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  Materia: {mat?.nombre || 'Desconocida'}
                                </div>
                              </div>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: t.estado === 'listo' ? '#d1fae5' : '#fef3c7', color: t.estado === 'listo' ? '#065f46' : '#92400e', fontWeight: 700 }}>
                                {t.estado === 'listo' ? <><CheckCircle size={14} /> Listo</> : <><Clock size={14} /> Pendiente</>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ padding: '0.6rem 1.2rem', background: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
