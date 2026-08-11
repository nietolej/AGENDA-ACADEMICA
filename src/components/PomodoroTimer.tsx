'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Shrink, Expand } from 'lucide-react';

export default function PomodoroTimer() {
  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [totalBlocks, setTotalBlocks] = useState(4);
  const [currentBlock, setCurrentBlock] = useState(1);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'idle' | 'study' | 'break'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (mode === 'study') {
        setMode('break');
        setTimeLeft(breakTime * 60);
        alert(`¡Bloque ${currentBlock} terminado! Toma un descanso.`);
      } else if (mode === 'break') {
        if (currentBlock >= totalBlocks) {
          setMode('idle');
          setIsRunning(false);
          setCurrentBlock(1);
          setTimeLeft(studyTime * 60);
          alert('¡Felicidades, has completado todos tus bloques de Pomodoro!');
        } else {
          setMode('study');
          setCurrentBlock(prev => prev + 1);
          setTimeLeft(studyTime * 60);
          alert(`¡Descanso terminado! Comenzando bloque ${currentBlock + 1}.`);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, studyTime, breakTime, currentBlock, totalBlocks]);

  const handleStart = () => {
    if (mode === 'idle') {
      setMode('study');
      setCurrentBlock(1);
      setTimeLeft(studyTime * 60);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('idle');
    setCurrentBlock(1);
    setTimeLeft(studyTime * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const expandedStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    background: '#ffffff',
    color: 'var(--foreground)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '3rem'
  };

  const normalStyle: React.CSSProperties = {
    background: '#ffffff',
    color: 'var(--foreground)',
    padding: '1.5rem 2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #e5e7eb',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1.5rem',
    position: 'relative'
  };

  return (
    <div style={isExpanded ? expandedStyle : normalStyle}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'absolute',
          top: isExpanded ? '2rem' : '1rem',
          right: isExpanded ? '2rem' : '1rem',
          background: '#f6f7f8',
          border: '1px solid #e5e7eb',
          color: 'var(--text-secondary)',
          padding: '0.6rem',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
          zIndex: 10000
        }}
        title={isExpanded ? "Reducir" : "Agrandar a pantalla completa"}
        onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
        onMouseOut={e => e.currentTarget.style.background = '#f6f7f8'}
      >
        {isExpanded ? <Shrink size={20} /> : <Expand size={20} />}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: isExpanded ? 'column' : 'row' }}>
        <div style={{ background: '#f0f5ff', padding: isExpanded ? '1.5rem' : '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Timer size={isExpanded ? 48 : 28} color="var(--primary-blue)" />
        </div>
        <div style={{ textAlign: isExpanded ? 'center' : 'left' }}>
          <h2 style={{ margin: 0, fontSize: isExpanded ? '3rem' : '1.5rem', fontWeight: 800 }}>Pomodoro</h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: isExpanded ? '1.2rem' : '0.9rem' }}>
            Mantén el enfoque y gestiona tus descansos
          </p>
        </div>
      </div>

      {mode === 'idle' && !isRunning ? (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: isExpanded ? '1rem' : '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: isExpanded ? 'center' : 'left', fontWeight: 600 }}>Estudio (min)</label>
            <input 
              type="number" value={studyTime}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setStudyTime(val);
                setTimeLeft(val * 60);
              }}
              style={{ width: isExpanded ? '120px' : '80px', fontSize: isExpanded ? '1.5rem' : '1rem', textAlign: 'center', background: '#f6f7f8', border: '1px solid #d1d5db', color: 'var(--foreground)', padding: '0.5rem', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: isExpanded ? '1rem' : '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: isExpanded ? 'center' : 'left', fontWeight: 600 }}>Descanso (min)</label>
            <input 
              type="number" value={breakTime}
              onChange={(e) => setBreakTime(parseInt(e.target.value) || 0)}
              style={{ width: isExpanded ? '120px' : '80px', fontSize: isExpanded ? '1.5rem' : '1rem', textAlign: 'center', background: '#f6f7f8', border: '1px solid #d1d5db', color: 'var(--foreground)', padding: '0.5rem', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: isExpanded ? '1rem' : '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: isExpanded ? 'center' : 'left', fontWeight: 600 }}>Bloques</label>
            <input 
              type="number" value={totalBlocks}
              onChange={(e) => setTotalBlocks(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: isExpanded ? '120px' : '80px', fontSize: isExpanded ? '1.5rem' : '1rem', textAlign: 'center', background: '#f6f7f8', border: '1px solid #d1d5db', color: 'var(--foreground)', padding: '0.5rem', borderRadius: '8px' }}
            />
          </div>
          <button 
            onClick={handleStart}
            style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: isExpanded ? '1rem 2rem' : '0.6rem 1.25rem', fontSize: isExpanded ? '1.2rem' : '1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s', height: isExpanded ? 'auto' : '42px' }}
            onMouseOver={e => e.currentTarget.style.background = '#1557d0'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary-blue)'}
          >
            Empezar
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: isExpanded ? 'column' : 'row', alignItems: 'center', gap: isExpanded ? '3rem' : '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: isExpanded ? '1.5rem' : '0.85rem', color: mode === 'study' ? '#ef4444' : '#22c55e', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: isExpanded ? '1rem' : '0' }}>
               {mode === 'study' ? 'Estudiando' : 'Descanso'} - Bloque {currentBlock}/{totalBlocks}
             </div>
             <div style={{ fontSize: isExpanded ? '12rem' : '2.5rem', fontWeight: 800, fontFamily: 'monospace', lineHeight: '1', color: 'var(--foreground)' }}>
               {formatTime(timeLeft)}
             </div>
          </div>
          <div style={{ display: 'flex', gap: isExpanded ? '1.5rem' : '0.5rem' }}>
            {isRunning ? (
              <button onClick={handlePause} style={{ background: '#eab308', color: 'white', border: 'none', padding: isExpanded ? '1rem 2rem' : '0.6rem 1rem', fontSize: isExpanded ? '1.5rem' : '1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Pausa
              </button>
            ) : (
              <button onClick={handleStart} style={{ background: '#22c55e', color: 'white', border: 'none', padding: isExpanded ? '1rem 2rem' : '0.6rem 1rem', fontSize: isExpanded ? '1.5rem' : '1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Reanudar
              </button>
            )}
            <button onClick={handleReset} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: isExpanded ? '1rem 2rem' : '0.6rem 1rem', fontSize: isExpanded ? '1.5rem' : '1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Parar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
