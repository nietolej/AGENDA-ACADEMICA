'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SemesterContextType {
  selectedSemester: string;
  setSelectedSemester: (semester: string) => void;
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

export function SemesterProvider({ children }: { children: ReactNode }) {
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('selectedSemester');
    if (stored) {
      setSelectedSemester(stored);
    }
  }, []);

  const handleSetSemester = (semester: string) => {
    setSelectedSemester(semester);
    localStorage.setItem('selectedSemester', semester);
  };

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <SemesterContext.Provider value={{ selectedSemester, setSelectedSemester: handleSetSemester }}>
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemester() {
  const context = useContext(SemesterContext);
  if (context === undefined) {
    throw new Error('useSemester must be used within a SemesterProvider');
  }
  return context;
}
