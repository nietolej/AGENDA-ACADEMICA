import { EventEmitter } from 'events';

// Create a singleton instance of the EventEmitter
class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners if needed, default is 10
    this.setMaxListeners(20);
  }
}

// Global instance to maintain state across module boundaries
// In a Next.js environment, we might want to attach this to the global object
// so it survives hot-reloads in development.
const globalForEventBus = global as unknown as { eventBus: AppEventBus };

export const eventBus =
  globalForEventBus.eventBus || new AppEventBus();

if (process.env.NODE_ENV !== 'production') globalForEventBus.eventBus = eventBus;

// Event Name Constants for Type Safety
export const EVENTS = {
  MATERIA_CREADA: 'materia.creada',
  EVENTO_CREADO: 'evento.creado',
  EVENTO_ALERTA_DISPARADA: 'evento.alerta_disparada',
  CALIFICACION_REGISTRADA: 'calificacion.registrada',
  TAREA_COMPLETADA: 'tarea.completada',
  PREGUNTA_CREADA: 'pregunta.creada',
  PREGUNTA_RESUELTA: 'pregunta.resuelta',
  DOCENTE_ASIGNADO: 'docente.asignado',
  MATERIA_RIESGO_DETECTADO: 'materia.riesgo_detectado',
} as const;
