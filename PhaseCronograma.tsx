import { Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { PhaseDeliverable, ProjectPhase } from "./types/charter";
import { computePhaseProgress } from "./phasesUtils";
import {
  barPosition,
  buildTimeline,
  countAtRisk,
  deliverableBarStyle,
  formatRange,
  overallProgress,
  todayLineLeft,
  type TimelineScale,
} from "./phaseCronogramaUtils";

const ROW_H = 48;
const SIDEBAR_W = 288; // w-72
/** Altura unificada de encabezados (sidebar + eje temporal) en días, semanas y meses */
const GANTT_HEADER_H_CLASS = "h-14 min-h-[56px] max-h-[56px] box-border";
/** Altura fija de filas de fase y entregable (alineación sidebar ↔ timeline) */
const GANTT_ROW_CLASS = "h-12 min-h-12 max-h-12 box-border";

function MaterialIcon({ name, className = "", fill = false }: { name: string; className?: string; fill?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden
    >
      {name}
    </span>
  );
}

const PHASE_STATUS_LABELS: Record<ProjectPhase["status"], string> = {
  completed: "Completada",
  "in-progress": "En Progreso",
  delayed: "Retrasada",
  pending: "Pendiente",
};

const PHASE_STATUS_PILL: Record<ProjectPhase["status"], string> = {
  completed: "bg-emerald-500/10 text-emerald-600",
  "in-progress": "bg-blue-500/10 text-blue-600",
  delayed: "bg-rose-500/10 text-rose-500",
  pending: "bg-slate-500/10 text-slate-500",
};

type Props = {
  phases: ProjectPhase[];
  onClose?: () => void;
};

function getPhaseDeliverables(phase: ProjectPhase): PhaseDeliverable[] {
  return (phase.deliverables ?? []).filter((d) => d?.name?.trim() || d?.dueDate);
}

function DeliverableBar({
  phase,
  deliverable,
  rangeStart,
  columnWidth,
  scale,
}: {
  phase: ProjectPhase;
  deliverable: PhaseDeliverable;
  rangeStart: Date;
  columnWidth: number;
  scale: TimelineScale;
}) {
  const pos = barPosition(phase.startDate, deliverable.dueDate, rangeStart, columnWidth, scale);
  const style = deliverableBarStyle(deliverable.status, deliverable.dueDate);

  return (
    <div className="h-full w-full flex items-center px-2 relative">
      {pos ? (
        <div
          className={`h-7 rounded-full absolute overflow-hidden shadow-sm cursor-default hover:ring-2 ring-blue-600/30 transition-all ${
            style.dashed ? "border border-dashed border-white/40" : ""
          } ${style.barClass}`}
          style={{ left: pos.left, width: Math.max(pos.width, 48) }}
          title={`${deliverable.name} — ${style.label}`}
        >
          {style.fillPercent < 100 && style.fillClass ? (
            <>
              <div
                className={`h-full absolute top-0 left-0 ${style.fillClass}`}
                style={{ width: `${style.fillPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-[11px] text-white font-semibold drop-shadow-sm truncate">
                  {style.fillPercent}% {style.label}
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center px-3">
              <span className="text-[11px] text-white font-semibold truncate">{style.label}</span>
            </div>
          )}
        </div>
      ) : (
        <span className="text-xs text-neutral-400 px-4">Sin fechas válidas</span>
      )}
    </div>
  );
}

function UnifiedGanttChart({
  phases,
  scale,
}: {
  phases: ProjectPhase[];
  scale: TimelineScale;
}) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    () => new Set(phases.map((p) => p.id))
  );

  useEffect(() => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      phases.forEach((p) => {
        if (!next.has(p.id)) next.add(p.id);
      });
      return next;
    });
  }, [phases]);

  const { rangeStart, columns, dayWidth } = useMemo(
    () => buildTimeline(phases, scale),
    [phases, scale]
  );
  const timelineWidth = columns.length * dayWidth;
  const todayLeft = todayLineLeft(rangeStart, columns, dayWidth, scale);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const totalDeliverables = phases.reduce((n, p) => n + getPhaseDeliverables(p).length, 0);
  const timelineMinWidth = Math.max(timelineWidth, 600);
  const gridMinWidth = SIDEBAR_W + timelineMinWidth;

  const ganttColBgStyle = {
    backgroundSize: `${dayWidth}px 100%`,
  };

  return (
    <div className="flex-1 min-h-0 w-full overflow-auto custom-scrollbar">
      <div
        className="relative inline-grid w-max min-w-full gap-0 content-start items-start"
        style={{
          gridTemplateColumns: `${SIDEBAR_W}px ${timelineMinWidth}px`,
          minWidth: gridMinWidth,
        }}
      >
        {/* Fila 0: encabezados */}
        <div
          className={`${GANTT_HEADER_H_CLASS} border-b border-r border-neutral-200 flex items-center px-4 bg-neutral-50 sticky top-0 left-0 z-40`}
        >
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Entregables y Tareas
          </span>
        </div>
        <div
          className={`${GANTT_HEADER_H_CLASS} border-b border-neutral-200 flex bg-neutral-50 sticky top-0 z-30`}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              style={{ width: dayWidth }}
              className={`flex-shrink-0 border-r border-neutral-200 flex flex-col items-center justify-center ${
                col.isToday
                  ? "bg-blue-50"
                  : col.isWeekend
                    ? "bg-neutral-100"
                    : "bg-neutral-50"
              }`}
            >
              <span
                className={`font-bold uppercase leading-tight text-center px-1 ${
                  scale === "days" ? "text-[10px]" : "text-[11px]"
                } ${col.isToday ? "text-blue-700" : "text-neutral-400"}`}
              >
                {col.label}
              </span>
              <span
                className={`text-center px-1 leading-tight whitespace-nowrap ${
                  scale === "months" ? "text-[11px]" : "text-xs"
                } ${col.isToday ? "text-blue-700 font-bold" : "text-neutral-700"}`}
              >
                {col.subLabel}
              </span>
            </div>
          ))}
        </div>

        {phases.map((phase) => {
          const deliverables = getPhaseDeliverables(phase);
          const isOpen = expandedPhases.has(phase.id);
          const phaseStatus =
            phase.status in PHASE_STATUS_LABELS ? phase.status : "pending";
          const progress = computePhaseProgress(phase.deliverables ?? []);

          return (
            <Fragment key={phase.id}>
              {/* Fila fase: una sola fila de grid (sin celda vacía debajo) */}
              <div
                className={`${GANTT_ROW_CLASS} flex border-b border-neutral-200 bg-neutral-50`}
                style={{ gridColumn: "1 / -1" }}
              >
                <button
                  type="button"
                  onClick={() => togglePhase(phase.id)}
                  className="h-full shrink-0 border-r border-neutral-200 bg-neutral-50 px-4 flex items-center gap-2 hover:bg-neutral-100 transition-colors text-left sticky left-0 z-20"
                  style={{ width: SIDEBAR_W }}
                  aria-expanded={isOpen}
                  title={`${formatRange(phase.startDate, phase.endDate)} · ${PHASE_STATUS_LABELS[phaseStatus]} · ${progress}%`}
                >
                  <MaterialIcon
                    name={isOpen ? "expand_more" : "chevron_right"}
                    className="text-neutral-400 text-[20px] shrink-0"
                  />
                  <span className="font-semibold text-sm text-neutral-900 truncate min-w-0 flex-1">
                    {phase.title || "Fase sin título"}
                  </span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded shrink-0">
                    {deliverables.length} Tarea{deliverables.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <div
                  className="h-full flex-1 gantt-grid-cols bg-neutral-50"
                  style={{ ...ganttColBgStyle, minWidth: timelineMinWidth }}
                />
              </div>

              {isOpen &&
                (deliverables.length === 0 ? (
                  <div
                    className={`${GANTT_ROW_CLASS} flex border-b border-neutral-200`}
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <div
                      className={`${GANTT_ROW_CLASS} pl-10 pr-4 flex items-center text-xs text-neutral-500 border-r border-neutral-200 bg-white sticky left-0 z-20`}
                      style={{ width: SIDEBAR_W }}
                    >
                      Sin entregables
                    </div>
                    <div
                      className="h-full flex-1 gantt-grid-cols bg-white"
                      style={{ ...ganttColBgStyle, minWidth: timelineMinWidth }}
                    />
                  </div>
                ) : (
                  deliverables.map((d) => (
                    <Fragment key={d.id}>
                      <div
                        className={`${GANTT_ROW_CLASS} pl-10 pr-4 flex items-center border-b border-r border-neutral-200 bg-white hover:bg-neutral-50 transition-colors sticky left-0 z-20`}
                      >
                        <span className="text-sm text-neutral-900 truncate">
                          {d.name || "Entregable sin nombre"}
                        </span>
                      </div>
                      <div
                        className={`${GANTT_ROW_CLASS} relative border-b border-neutral-200 gantt-grid-cols overflow-hidden bg-white`}
                        style={ganttColBgStyle}
                      >
                        <DeliverableBar
                          phase={phase}
                          deliverable={d}
                          rangeStart={rangeStart}
                          columnWidth={dayWidth}
                          scale={scale}
                        />
                      </div>
                    </Fragment>
                  ))
                ))}
            </Fragment>
          );
        })}

        {phases.length === 0 && (
          <>
            <div className="col-span-1 px-6 py-8 text-sm text-neutral-500 text-center border-r border-neutral-200">
              Sin fases
            </div>
            <div className="col-span-1 py-8 text-sm text-neutral-500 text-center" />
          </>
        )}

        {todayLeft !== null && phases.length > 0 && (
          <div
            className="absolute w-0.5 bg-blue-600 z-10 pointer-events-none"
            style={{
              left: SIDEBAR_W + todayLeft,
              top: 56,
              bottom: 0,
            }}
          >
            <div className="w-3 h-3 bg-blue-600 rounded-full -ml-[5px] -mt-1.5 shadow-sm" />
          </div>
        )}

        {totalDeliverables === 0 && phases.length > 0 && (
          <p
            className="pointer-events-none text-sm text-neutral-400 text-center px-4 py-3"
            style={{ gridColumn: "1 / -1" }}
          >
            Agrega entregables con fechas en cada fase
          </p>
        )}
      </div>
    </div>
  );
}

export function PhaseCronograma({ phases, onClose }: Props) {
  const sorted = useMemo(
    () => [...phases].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [phases]
  );
  const [scale, setScale] = useState<TimelineScale>("days");
  const [viewportExpanded, setViewportExpanded] = useState(false);
  const atRisk = countAtRisk(sorted);
  const totalProgress = overallProgress(sorted);
  const totalCollaborators = sorted.reduce((n, p) => n + (p.responsiblesCount || 0), 0);

  const projectRange = useMemo(() => {
    if (sorted.length === 0) return "—";
    const starts = sorted.map((p) => p.startDate).filter(Boolean);
    const ends = sorted.map((p) => p.endDate).filter(Boolean);
    if (starts.length === 0 || ends.length === 0) return "—";
    const minStart = starts.sort()[0];
    const maxEnd = ends.sort().at(-1)!;
    return formatRange(minStart, maxEnd);
  }, [sorted]);

  useEffect(() => {
    if (!viewportExpanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewportExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [viewportExpanded]);

  if (sorted.length === 0) {
    return (
      <div className="card p-10 text-center">
        <MaterialIcon name="calendar_month" className="text-4xl text-neutral-300 mb-3" />
        <p className="text-neutral-600 font-medium">No hay fases para mostrar en el cronograma</p>
        <p className="text-sm text-neutral-500 mt-1">
          Guarda al menos una fase con fechas y entregables.
        </p>
      </div>
    );
  }

  const panel = (
    <div
      className={`rounded-xl border border-neutral-200 bg-white shadow-lg flex flex-col overflow-hidden ${
        viewportExpanded ? "h-full w-full" : "h-[min(85vh,720px)]"
      }`}
      role="dialog"
      aria-modal={viewportExpanded}
      aria-label="Cronograma del proyecto"
    >
      <div className="px-6 py-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-700 shrink-0">
            <MaterialIcon name="calendar_month" fill />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-neutral-900">Cronograma del Proyecto</h3>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">
              {sorted.length} fase{sorted.length !== 1 ? "s" : ""} · {projectRange}
              {viewportExpanded ? " · Pantalla ampliada" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setViewportExpanded((v) => !v)}
            className="p-2 text-neutral-500 hover:text-blue-700 transition-colors rounded-lg hover:bg-neutral-50"
            aria-label={viewportExpanded ? "Salir de pantalla ampliada" : "Ampliar cronograma"}
            title={viewportExpanded ? "Reducir" : "Ampliar"}
          >
            <MaterialIcon name={viewportExpanded ? "fullscreen_exit" : "open_in_full"} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-rose-600 transition-colors rounded-lg hover:bg-neutral-50"
              aria-label="Cerrar cronograma"
            >
              <MaterialIcon name="close" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
          {(["days", "weeks", "months"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                scale === s
                  ? "bg-white shadow-sm text-blue-700 font-bold"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {s === "days" ? "Días" : s === "weeks" ? "Semanas" : "Meses"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-500 uppercase">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            Completado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500" />
            En Curso
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-400" />
            Pendiente
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <UnifiedGanttChart phases={sorted} scale={scale} />
      </div>

      <div className="px-6 py-4 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0 relative z-20 shadow-[0_-6px_16px_-8px_rgba(0,0,0,0.12)]">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Progreso Global</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-48 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-700"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-blue-700">{totalProgress}%</span>
            </div>
          </div>
          <div className="h-10 w-px bg-neutral-200 hidden sm:block" />
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Ruta Crítica</p>
            <p
              className={`text-sm mt-1 flex items-center gap-1 ${atRisk > 0 ? "text-rose-500" : "text-neutral-600"}`}
            >
              {atRisk > 0 ? (
                <>
                  <MaterialIcon name="warning" className="text-base" />
                  {atRisk} tarea{atRisk !== 1 ? "s" : ""} con riesgo de atraso
                </>
              ) : (
                <>
                  <MaterialIcon name="check_circle" className="text-base text-emerald-500" />
                  Sin tareas vencidas pendientes
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <MaterialIcon name="groups" className="text-neutral-400" />
          <span>
            {totalCollaborators} colaborador{totalCollaborators !== 1 ? "es" : ""} en fases
          </span>
        </div>
      </div>
    </div>
  );

  if (viewportExpanded) {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex flex-col p-2 sm:p-4">
        <button
          type="button"
          className="absolute inset-0 bg-neutral-900/45 backdrop-blur-[2px]"
          aria-label="Salir de pantalla ampliada"
          onClick={() => setViewportExpanded(false)}
        />
        <div className="relative flex-1 min-h-0 w-full max-w-[100vw] mx-auto pointer-events-auto">
          {panel}
        </div>
      </div>,
      document.body
    );
  }

  return panel;
}
