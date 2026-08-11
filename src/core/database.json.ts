import fs from 'fs/promises';
import path from 'path';
// Trigger reload

const DB_DIR = path.join(process.cwd(), 'db');

// In-memory cache
const memoryDb: Record<string, any[]> = {
  materias: [],
  eventos_calendario: [],
  tareas_diarias: [],
  docentes: [],
  materia_docente: [],
  preguntas_docente: [],
  calificaciones: [],
  sub_temas: [],
  tareas: [],
  examenes: [],
};

let initialized = false;

// Initialize JSON files
export async function initializeDatabase() {
  if (initialized) return;
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    
    for (const table of Object.keys(memoryDb)) {
      const filePath = path.join(DB_DIR, `${table}.json`);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        memoryDb[table] = JSON.parse(data);
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          // File doesn't exist, create empty array
          await fs.writeFile(filePath, '[]');
        } else {
          console.error(`Error reading ${table}.json`, err);
        }
      }
    }
    initialized = true;
  } catch (err) {
    console.error('Error initializing JSON database:', err);
  }
}

// Helper to save to file
async function saveTable(table: string) {
  const filePath = path.join(DB_DIR, `${table}.json`);
  await fs.writeFile(filePath, JSON.stringify(memoryDb[table], null, 2));
}

export const db = {
  getTable: async (table: keyof typeof memoryDb) => {
    await initializeDatabase();
    return memoryDb[table];
  },
  
  insert: async (table: keyof typeof memoryDb, record: any) => {
    await initializeDatabase();
    memoryDb[table].push(record);
    await saveTable(table);
    return record;
  },

  update: async (table: keyof typeof memoryDb, id: string, updates: any) => {
    await initializeDatabase();
    const index = memoryDb[table].findIndex((item) => item.id === id);
    if (index !== -1) {
      memoryDb[table][index] = { ...memoryDb[table][index], ...updates };
      await saveTable(table);
      return memoryDb[table][index];
    }
    return null;
  },

  delete: async (table: keyof typeof memoryDb, id: string) => {
    await initializeDatabase();
    const initialLength = memoryDb[table].length;
    memoryDb[table] = memoryDb[table].filter((item) => item.id !== id);
    if (memoryDb[table].length !== initialLength) {
      await saveTable(table);
      return true;
    }
    return false;
  }
};
