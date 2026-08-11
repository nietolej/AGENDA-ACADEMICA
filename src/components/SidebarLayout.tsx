'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CalendarDays, CalendarClock, ListTodo, GraduationCap, ChevronLeft, ChevronRight, NotebookPen, Award } from 'lucide-react';
import { useSemester } from '@/core/SemesterContext';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { selectedSemester, setSelectedSemester } = useSemester();

  const menuItems = [
    { name: 'Inicio', href: '/inicio', icon: <Home size={20} /> },
    { name: 'Mis Materias', href: '/', icon: <BookOpen size={20} /> },
    { name: 'Mis Calificaciones', href: '/calificaciones', icon: <Award size={20} /> },
    { name: 'Calendario', href: '/calendario', icon: <CalendarDays size={20} /> },
    { name: 'Horario Semanal', href: '/horario', icon: <CalendarClock size={20} /> },
    { name: 'Todas las Tareas', href: '/tareas', icon: <ListTodo size={20} /> },
    { name: 'Notas y Apuntes', href: '/#notas', icon: <NotebookPen size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? '80px' : '260px',
          backgroundColor: '#FDFAF5',
          color: 'var(--foreground)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '1.5rem 1rem',
          borderRight: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50
        }}
      >
        {/* Logo / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--fern) 0%, #5d7160 100%)',
                width: '36px', height: '36px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(118,142,120,0.35)'
              }}>
                <GraduationCap size={22} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                AGENDA
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'var(--fennel)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'background 0.2s',
              margin: collapsed ? '0 auto' : '0'
            }}
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--pistachio)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--fennel)')}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Semester Selector */}
        <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {!collapsed && (
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--pistachio)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Semestre
            </label>
          )}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{
              width: '100%',
              padding: collapsed ? '0.5rem 0' : '0.6rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: collapsed ? 'center' : 'left',
              appearance: collapsed ? 'none' : 'auto'
            }}
            title="Seleccionar Semestre"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
              <option key={sem} value={sem.toString()}>
                {collapsed ? sem : `Semestre ${sem}`}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--pistachio)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '0 0.5rem 0.75rem 0.5rem'
          }}>
            {!collapsed && 'Navegación'}
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  color: isActive ? 'var(--fern)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderLeft: isActive ? '3px solid var(--fern)' : '3px solid transparent'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.65 }}>{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div style={{
            padding: '1rem 0.5rem 0 0.5rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.75rem',
            color: 'var(--pistachio)',
            textAlign: 'center',
            fontWeight: 600
          }}>
            Agenda Académica v1.0
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '0', height: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
