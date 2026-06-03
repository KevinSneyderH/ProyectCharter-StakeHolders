import type { DeliverableStatus, ProjectPhase } from "./types/charter";
import { computePhaseProgress } from "./phasesUtils";

export type TimelineScale = "days" | "weeks" | "months";

/** Ancho de cada columna en el eje temporal (px). */
export const TIMELINE_COLUMN_WIDTH: Record<TimelineScale, number> = {
  days: 72,
  weeks: 120,
  months: 100,
};

const MS_DAY = 86_400_000;

export function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_DAY);
}

/** true si hoy es posterior a la fecha límite (venció el plazo). */
export function isOverdue(due: Date, today = startOfDay(new Date())): boolean {
  return diffDays(due, today) > 0;
}

export function formatShortDate(d: Date, withYear = false): string {
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function formatRange(start: string, end: string): string {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return "—";
  return `${formatShortDate(s)} – ${formatShortDate(e, true)}`;
}

export type TimelineColumn = {
  key: string;
  label: string;
  subLabel: string;
  start: Date;
  isToday: boolean;
  isWeekend: boolean;
};

export function buildTimeline(
  phases: ProjectPhase[],
  scale: TimelineScale
): { rangeStart: Date; rangeEnd: Date; columns: TimelineColumn[]; dayWidth: number } {
  const dates = phases.flatMap((p) => {
    const s = parseDate(p.startDate);
    const e = parseDate(p.endDate);
    const deliverableDates = (p.deliverables ?? [])
      .map((d) => parseDate(d.dueDate))
      .filter((d): d is Date => d !== null);
    return [s, e, ...deliverableDates].filter((d): d is Date => d !== null);
  });

  const today = startOfDay(new Date());
  let rangeStart = today;
  let rangeEnd = addDays(today, 14);

  if (dates.length > 0) {
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    rangeStart = addDays(startOfDay(min), -2);
    rangeEnd = addDays(startOfDay(max), 5);
  }

  if (diffDays(rangeStart, rangeEnd) < 7) {
    rangeEnd = addDays(rangeStart, 13);
  }

  const columns: TimelineColumn[] = [];
  const dayWidth = TIMELINE_COLUMN_WIDTH[scale];

  if (scale === "days") {
    const maxDays = 120;
    let totalDays = diffDays(rangeStart, rangeEnd) + 1;
    if (totalDays > maxDays) {
      rangeEnd = addDays(rangeStart, maxDays - 1);
      totalDays = maxDays;
    }
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(rangeStart, i);
      const isToday = diffDays(d, today) === 0;
      columns.push({
        key: d.toISOString(),
        label: isToday ? "HOY" : d.toLocaleDateString("es-CO", { weekday: "short" }).slice(0, 3),
        subLabel: String(d.getDate()),
        start: d,
        isToday,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }
  } else if (scale === "weeks") {
    let cursor = startOfDay(rangeStart);
    while (cursor <= rangeEnd) {
      const weekEnd = addDays(cursor, 6);
      const weekNum = Math.floor(diffDays(rangeStart, cursor) / 7) + 1;
      columns.push({
        key: cursor.toISOString(),
        label: `Sem ${weekNum}`,
        subLabel: cursor.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
        }),
        start: cursor,
        isToday: today >= cursor && today <= weekEnd,
        isWeekend: false,
      });
      cursor = addDays(cursor, 7);
    }
  } else {
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    while (cursor <= rangeEnd) {
      columns.push({
        key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
        label: cursor.toLocaleDateString("es-CO", { month: "long" }),
        subLabel: String(cursor.getFullYear()),
        start: cursor,
        isToday:
          today.getMonth() === cursor.getMonth() && today.getFullYear() === cursor.getFullYear(),
        isWeekend: false,
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  return { rangeStart, rangeEnd, columns, dayWidth };
}

export type DeliverableBarStyle = {
  barClass: string;
  fillClass: string;
  fillPercent: number;
  label: string;
  dashed?: boolean;
};

export function deliverableBarStyle(status: DeliverableStatus, dueDate: string): DeliverableBarStyle {
  const due = parseDate(dueDate);
  const today = startOfDay(new Date());
  const isLate =
    due &&
    isOverdue(due, today) &&
    status !== "entregado" &&
    status !== "finalizado";

  if (isLate) {
    return {
      barClass: "bg-rose-500",
      fillClass: "bg-rose-600",
      fillPercent: 100,
      label: "Retrasado",
    };
  }

  switch (status) {
    case "finalizado":
    case "entregado":
      return {
        barClass: "bg-emerald-500",
        fillClass: "bg-emerald-600",
        fillPercent: 100,
        label: status === "finalizado" ? "Finalizado" : "Entregado",
      };
    case "en-revision":
      return {
        barClass: "bg-slate-200",
        fillClass: "bg-blue-500",
        fillPercent: 50,
        label: "En revisión",
      };
    default:
      return {
        barClass: "bg-slate-400",
        fillClass: "bg-slate-500",
        fillPercent: 100,
        label: "Pendiente",
        dashed: true,
      };
  }
}

export function barPosition(
  phaseStart: string,
  dueDate: string,
  rangeStart: Date,
  columnWidth: number,
  scale: TimelineScale
): { left: number; width: number } | null {
  const pStart = parseDate(phaseStart);
  const pEnd = parseDate(dueDate);
  if (!pStart || !pEnd) return null;

  const barStart = pStart;
  const barEnd = pEnd < pStart ? pStart : pEnd;

  if (scale === "days") {
    const leftDays = diffDays(rangeStart, barStart);
    const spanDays = Math.max(1, diffDays(barStart, barEnd) + 1);
    return { left: leftDays * columnWidth + 8, width: spanDays * columnWidth - 16 };
  }

  if (scale === "weeks") {
    const leftDays = diffDays(rangeStart, barStart);
    const spanDays = Math.max(1, diffDays(barStart, barEnd) + 1);
    return {
      left: (leftDays / 7) * columnWidth + 4,
      width: Math.max(columnWidth * 0.6, (spanDays / 7) * columnWidth - 8),
    };
  }

  const startMonth = barStart.getFullYear() * 12 + barStart.getMonth();
  const endMonth = barEnd.getFullYear() * 12 + barEnd.getMonth();
  const rangeMonth = rangeStart.getFullYear() * 12 + rangeStart.getMonth();
  const leftMonths = startMonth - rangeMonth;
  const spanMonths = Math.max(1, endMonth - startMonth + 1);
  return {
    left: leftMonths * columnWidth + 4,
    width: spanMonths * columnWidth - 8,
  };
}

export function todayLineLeft(
  rangeStart: Date,
  columns: TimelineColumn[],
  columnWidth: number,
  scale: TimelineScale
): number | null {
  const today = startOfDay(new Date());
  if (scale === "days") {
    const idx = diffDays(rangeStart, today);
    if (idx < 0 || idx >= columns.length) return null;
    return idx * columnWidth + columnWidth / 2;
  }
  const col = columns.findIndex((c) => c.isToday);
  if (col < 0) return null;
  return col * columnWidth + columnWidth / 2;
}

export function countAtRisk(phases: ProjectPhase[]): number {
  const today = startOfDay(new Date());
  return phases.reduce((acc, phase) => {
    return (
      acc +
      (phase.deliverables ?? []).filter((d) => {
        const due = parseDate(d.dueDate);
        return (
          due &&
          isOverdue(due, today) &&
          d.status !== "entregado" &&
          d.status !== "finalizado"
        );
      }).length
    );
  }, 0);
}

export function overallProgress(phases: ProjectPhase[]): number {
  if (phases.length === 0) return 0;
  const sum = phases.reduce((acc, p) => acc + computePhaseProgress(p.deliverables), 0);
  return Math.round(sum / phases.length);
}
