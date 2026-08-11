import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Singleton instance
let db: Database | null = null;

export async function getDbConnection(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'db', 'gestor_academico.sqlite');

  // Open the database connection
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON;');

  return db;
}

export async function initializeDatabase() {
  const db = await getDbConnection();

  // Create tables based on the blueprint
  await db.exec(`
    CREATE TABLE IF NOT EXISTS docentes (
      id                TEXT PRIMARY KEY,
      nombre            TEXT NOT NULL,
      email             TEXT,
      oficina           TEXT,
      horario_atencion  TEXT,
      notas_generales   TEXT
    );

    CREATE TABLE IF NOT EXISTS materias (
      id            TEXT PRIMARY KEY,
      nombre        TEXT NOT NULL,
      codigo        TEXT,
      semestre      TEXT,
      creditos      INTEGER,
      color_hex     TEXT DEFAULT '#4A90D9',
      docente_principal_id TEXT REFERENCES docentes(id),
      estado        TEXT CHECK(estado IN ('activa','finalizada','archivada')) DEFAULT 'activa',
      meta_promedio REAL,
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS eventos_calendario (
      id              TEXT PRIMARY KEY,
      titulo          TEXT NOT NULL,
      tipo            TEXT CHECK(tipo IN ('examen','entrega','tutoria','personal','otro')),
      materia_id      TEXT REFERENCES materias(id),
      fecha           TEXT NOT NULL,
      hora            TEXT,
      ponderacion_pct REAL,
      prioridad       TEXT CHECK(prioridad IN ('alta','media','baja')) DEFAULT 'media',
      recordatorio_offset_min INTEGER DEFAULT 1440,
      estado          TEXT CHECK(estado IN ('pendiente','completado','vencido')) DEFAULT 'pendiente',
      notas           TEXT
    );

    CREATE TABLE IF NOT EXISTS tareas_diarias (
      id                    TEXT PRIMARY KEY,
      titulo                TEXT NOT NULL,
      descripcion           TEXT,
      materia_id            TEXT REFERENCES materias(id),
      evento_relacionado_id TEXT REFERENCES eventos_calendario(id),
      fecha                 TEXT NOT NULL,
      hora_limite           TEXT,
      prioridad             TEXT CHECK(prioridad IN ('alta','media','baja')) DEFAULT 'media',
      estado                TEXT CHECK(estado IN ('pendiente','en_progreso','completada')) DEFAULT 'pendiente',
      origen                TEXT CHECK(origen IN ('manual','auto_evento')) DEFAULT 'manual'
    );

    CREATE TABLE IF NOT EXISTS materia_docente (
      materia_id TEXT REFERENCES materias(id),
      docente_id TEXT REFERENCES docentes(id),
      rol        TEXT CHECK(rol IN ('titular','laboratorio','ayudantia')),
      PRIMARY KEY (materia_id, docente_id, rol)
    );

    CREATE TABLE IF NOT EXISTS preguntas_docente (
      id              TEXT PRIMARY KEY,
      docente_id      TEXT NOT NULL REFERENCES docentes(id),
      materia_id      TEXT REFERENCES materias(id),
      pregunta        TEXT NOT NULL,
      contexto        TEXT,
      estado          TEXT CHECK(estado IN ('pendiente','resuelta')) DEFAULT 'pendiente',
      fecha_creacion  TEXT DEFAULT CURRENT_TIMESTAMP,
      fecha_resuelta  TEXT,
      respuesta_resumen TEXT
    );

    CREATE TABLE IF NOT EXISTS calificaciones (
      id               TEXT PRIMARY KEY,
      materia_id       TEXT NOT NULL REFERENCES materias(id),
      nombre_evaluacion TEXT NOT NULL,
      tipo             TEXT CHECK(tipo IN ('parcial','tarea','proyecto','quiz','final')),
      nota_obtenida    REAL,
      nota_maxima      REAL DEFAULT 5.0,
      ponderacion_pct  REAL NOT NULL,
      fecha            TEXT,
      evento_origen_id TEXT REFERENCES eventos_calendario(id)
    );
  `);
}
