const fs = require('fs');
const crypto = require('crypto');

function generateId() {
  return crypto.randomUUID();
}

const colors = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", 
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

const materiasData = [
  // Semestre 1
  { nombre: "Inglés I", creditos: 2, semestre: 1 },
  { nombre: "Actividades de Orientación", creditos: 2, semestre: 1 },
  { nombre: "Matemática I", creditos: 4, semestre: 1 },
  { nombre: "Lenguaje y Comunicación", creditos: 3, semestre: 1 },
  { nombre: "Educación Física y Deporte", creditos: 2, semestre: 1 },
  { nombre: "Estructuras Discretas I", creditos: 3, semestre: 1 },
  // Semestre 2
  { nombre: "Inglés II", creditos: 2, semestre: 2 },
  { nombre: "Dibujo", creditos: 2, semestre: 2 },
  { nombre: "Matemática II", creditos: 4, semestre: 2 },
  { nombre: "Química", creditos: 2, semestre: 2 },
  { nombre: "Física I", creditos: 4, semestre: 2 },
  { nombre: "Introducción a la Computación", creditos: 2, semestre: 2 },
  // Semestre 3
  { nombre: "Laboratorio de Inglés", creditos: 2, semestre: 3 },
  { nombre: "Metodología de Investigación I", creditos: 2, semestre: 3 },
  { nombre: "Estadística", creditos: 2, semestre: 3 },
  { nombre: "Matemática III", creditos: 4, semestre: 3 },
  { nombre: "Álgebra Lineal", creditos: 4, semestre: 3 },
  { nombre: "Física II", creditos: 4, semestre: 3 },
  { nombre: "Computación para Ingenieros", creditos: 3, semestre: 3 },
  // Semestre 4
  { nombre: "Metodología de Investigación II", creditos: 2, semestre: 4 },
  { nombre: "Matemática IV", creditos: 4, semestre: 4 },
  { nombre: "Circuitos Eléctricos I", creditos: 3, semestre: 4 },
  { nombre: "Programación I", creditos: 4, semestre: 4 },
  { nombre: "Estructuras Discretas II", creditos: 3, semestre: 4 },
  { nombre: "Introducción a los Sistemas", creditos: 2, semestre: 4 },
  // Semestre 5
  { nombre: "Análisis Numérico", creditos: 3, semestre: 5 },
  { nombre: "Análisis de Señales", creditos: 3, semestre: 5 },
  { nombre: "Circuitos Eléctricos II", creditos: 4, semestre: 5 },
  { nombre: "Programación II", creditos: 4, semestre: 5 },
  { nombre: "Estructuras de Datos I", creditos: 3, semestre: 5 },
  { nombre: "Teoría de Sistemas I", creditos: 2, semestre: 5 },
  { nombre: "Gerencia, Liderazgo y Emprendimiento", creditos: 2, semestre: 5 },
  // Semestre 6
  { nombre: "Teoría de Control I", creditos: 3, semestre: 6 },
  { nombre: "Electrónica I", creditos: 4, semestre: 6 },
  { nombre: "Lógica de Computación", creditos: 4, semestre: 6 },
  { nombre: "Lenguaje de Programación", creditos: 3, semestre: 6 },
  { nombre: "Estructuras de Datos II", creditos: 3, semestre: 6 },
  { nombre: "Teoría de Sistemas II", creditos: 2, semestre: 6 },
  { nombre: "Creatividad e Innovación", creditos: 2, semestre: 6 },
  // Semestre 7
  { nombre: "Teoría de Control II", creditos: 3, semestre: 7 },
  { nombre: "Electrónica II", creditos: 4, semestre: 7 },
  { nombre: "Circuitos Digitales", creditos: 4, semestre: 7 },
  { nombre: "Autómatas y Lenguajes Formales", creditos: 3, semestre: 7 },
  { nombre: "Sistemas Operativos", creditos: 3, semestre: 7 },
  { nombre: "Diseño de Software", creditos: 4, semestre: 7 },
  // Semestre 8
  { nombre: "Proyectos de Investigación", creditos: 2, semestre: 8 },
  { nombre: "Laboratorio de Instrumentación y Control", creditos: 1, semestre: 8 },
  { nombre: "Gestión Ambiental", creditos: 2, semestre: 8 },
  { nombre: "Fundamento para el Diseño con Microprocesadores", creditos: 3, semestre: 8 },
  { nombre: "Inteligencia Artificial", creditos: 4, semestre: 8 },
  { nombre: "Teleproceso", creditos: 3, semestre: 8 },
  { nombre: "Análisis de Algoritmo", creditos: 3, semestre: 8 },
  { nombre: "Electiva I", creditos: 2, semestre: 8 },
  // Semestre 9
  { nombre: "Seminario de Trabajo de Grado", creditos: 3, semestre: 9 },
  { nombre: "Técnicas de Mantenimiento y Control", creditos: 3, semestre: 9 },
  { nombre: "Diseño con Microprocesadores", creditos: 3, semestre: 9 },
  { nombre: "Robótica", creditos: 3, semestre: 9 },
  { nombre: "Ética, Valores y Ciudadanía", creditos: 2, semestre: 9 },
  { nombre: "Higiene y Seguridad Industrial", creditos: 1, semestre: 9 },
  { nombre: "Electiva II", creditos: 2, semestre: 9 },
  { nombre: "Ejercicio Legal de la Ingeniería", creditos: 1, semestre: 9 },
  // Semestre 10
  { nombre: "Pasantías", creditos: 4, semestre: 10 },
  { nombre: "Trabajo de Grado", creditos: 6, semestre: 10 }
];

const materias = materiasData.map(m => ({
  id: generateId(),
  nombre: m.nombre,
  codigo: m.nombre.substring(0, 3).toUpperCase() + m.semestre, // Example code
  profesor: "Por asignar",
  colorHex: getRandomColor(),
  horarios: [],
  semestre: String(m.semestre)
}));

fs.writeFileSync('./db/materias.json', JSON.stringify(materias, null, 2));
fs.writeFileSync('./db/tareas.json', JSON.stringify([], null, 2));
fs.writeFileSync('./db/examenes.json', JSON.stringify([], null, 2));

console.log('Base de datos actualizada con las nuevas materias!');
