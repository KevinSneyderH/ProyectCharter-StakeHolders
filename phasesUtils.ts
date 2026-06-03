import { v4 as uuidv4 } from "uuid";
import type { DeliverableStatus, PhaseDeliverable, ProjectPhase } from "./types/charter";

const DELIVERABLE_PROGRESS: Record<DeliverableStatus, number> = {
  pendiente: 0,
  "en-revision": 50,
  entregado: 100,
  finalizado: 100,
};

/** Progreso de la fase según estados de sus entregables (promedio ponderado). */
export function computePhaseProgress(deliverables: PhaseDeliverable[]): number {
  if (deliverables.length === 0) return 0;
  const sum = deliverables.reduce(
    (acc, d) => acc + (DELIVERABLE_PROGRESS[d.status] ?? 0),
    0
  );
  return Math.round(sum / deliverables.length);
}

export function createEmptyDeliverable(): PhaseDeliverable {
  return {
    id: uuidv4(),
    name: "",
    responsible: "",
    dueDate: "",
    priority: "media",
    status: "pendiente",
  };
}

export function isPhaseSaved(phase: ProjectPhase | undefined): boolean {
  return Boolean(phase?.title?.trim());
}

export function getSavedPhases(phases: ProjectPhase[]): ProjectPhase[] {
  return phases.filter(isPhaseSaved);
}

export function createEmptyPhase(): ProjectPhase {
  return {
    id: uuidv4(),
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    responsiblesCount: 1,
    status: "pending",
    progress: 0,
    deliverables: [],
  };
}

const STATUS_LABELS: Record<ProjectPhase["status"], string> = {
  pending: "Pendiente",
  "in-progress": "En Progreso",
  completed: "Completada",
  delayed: "Retrasada",
};

export function serializePhases(phases: ProjectPhase[]): string {
  return getSavedPhases(phases)
    .map((phase, index) => {
      const deliverableLines = phase.deliverables.map(
        (d) =>
          `- ${d.name} | Responsable: ${d.responsible} | Fecha: ${d.dueDate} | Prioridad: ${d.priority} | Estado: ${d.status}`
      );

      return [
        `Fase ${index + 1}: ${phase.title}`,
        `Descripción: ${phase.description}`,
        `Periodo: ${phase.startDate} - ${phase.endDate}`,
        `Estado: ${STATUS_LABELS[phase.status]} | Progreso: ${phase.progress}% | Responsables: ${phase.responsiblesCount}`,
        "Entregables:",
        ...deliverableLines,
      ].join("\n");
    })
    .join("\n\n");
}
