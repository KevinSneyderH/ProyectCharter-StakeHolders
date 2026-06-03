import { useEffect, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type {
  DeliverablePriority,
  DeliverableStatus,
  ProjectCharterFormData,
  ProjectPhase,
} from "./types/charter";
import { projectPhaseSchema } from "./charterSchema";
import {
  computePhaseProgress,
  createEmptyDeliverable,
  createEmptyPhase,
  isPhaseSaved,
  serializePhases,
} from "./phasesUtils";
import { RemoveButton } from "./FieldComponents";
import { PhaseCronograma } from "./PhaseCronograma";

type FormProps = { form: UseFormReturn<ProjectCharterFormData> };

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined leading-none ${className}`} aria-hidden>
      {name}
    </span>
  );
}

const PHASE_STATUS_STYLES: Record<
  ProjectPhase["status"],
  { pill: string; icon: string; iconName: string; progress: string }
> = {
  completed: {
    pill: "bg-emerald-100 text-emerald-600",
    icon: "text-emerald-500",
    iconName: "check_circle",
    progress: "bg-emerald-500",
  },
  "in-progress": {
    pill: "bg-blue-100 text-blue-600",
    icon: "text-blue-500",
    iconName: "pending",
    progress: "bg-blue-500",
  },
  delayed: {
    pill: "bg-rose-100 text-rose-500",
    icon: "text-rose-500",
    iconName: "error_outline",
    progress: "bg-rose-500",
  },
  pending: {
    pill: "bg-slate-100 text-slate-500",
    icon: "text-slate-400",
    iconName: "schedule",
    progress: "bg-slate-400",
  },
};

const PHASE_STATUS_LABELS: Record<ProjectPhase["status"], string> = {
  completed: "Completada",
  "in-progress": "En Progreso",
  delayed: "Retrasada",
  pending: "Pendiente",
};

const PRIORITY_LABELS: Record<DeliverablePriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
  critica: "Crítica",
};

const DELIVERABLE_STATUS_LABELS: Record<DeliverableStatus, string> = {
  pendiente: "Pendiente",
  "en-revision": "En revisión",
  entregado: "Entregado",
  finalizado: "Finalizado",
};

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value + "T12:00:00");
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Vista de solo lectura (fases guardadas / en borrador) ─────────────────────

function PhaseViewCard({
  phase,
  onEdit,
  onDelete,
  canDelete,
}: {
  phase: ProjectPhase;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const status = phase.status;
  const styles = PHASE_STATUS_STYLES[status];
  const progress = computePhaseProgress(phase.deliverables);
  const finishedCount = phase.deliverables.filter(
    (d) => d.status === "entregado" || d.status === "finalizado"
  ).length;

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
        status === "delayed" ? "border-rose-200" : "border-neutral-200"
      }`}
    >
      <div className="p-6 border-b border-neutral-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4 flex-1 min-w-0">
            <MaterialIcon name={styles.iconName} className={`text-2xl mt-0.5 ${styles.icon}`} />
            <div className="min-w-0 flex-1 space-y-2">
              <h3
                className="text-lg font-bold text-neutral-900 truncate"
                title={phase.title}
              >
                {phase.title}
              </h3>
              {phase.description && (
                <p
                  className="text-sm text-neutral-600 leading-relaxed line-clamp-2"
                  title={phase.description}
                >
                  {phase.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  <MaterialIcon name="calendar_month" className="text-sm" />
                  {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MaterialIcon name="group" className="text-sm" />
                  {phase.responsiblesCount} responsable{phase.responsiblesCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <span className={`status-pill ${styles.pill}`}>{PHASE_STATUS_LABELS[status]}</span>
            <div className="w-48 sm:w-56">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Progreso</span>
                <span className={`text-[10px] font-bold ${styles.icon}`}>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${styles.progress}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1 text-right">
                {finishedCount}/{phase.deliverables.length} entregables finalizados
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-blue-700 transition-all"
                title="Editar fase"
              >
                <MaterialIcon name="edit" />
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="p-2 hover:bg-rose-50 rounded-lg text-neutral-400 hover:text-rose-600 transition-all"
                  title="Eliminar fase"
                >
                  <MaterialIcon name="delete" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <details className="group/details bg-neutral-50">
        <summary className="flex items-center gap-2 p-4 cursor-pointer hover:bg-neutral-100 transition-colors list-none font-semibold text-neutral-800 text-sm">
          <MaterialIcon
            name="chevron_right"
            className="transition-transform group-open/details:rotate-90 text-neutral-500"
          />
          <span>Entregables ({phase.deliverables.length})</span>
        </summary>
        <div className="px-6 pb-5 overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[520px]">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-200">
                <th className="py-2 pr-4 font-semibold text-xs uppercase">Nombre</th>
                <th className="py-2 pr-4 font-semibold text-xs uppercase">Responsable</th>
                <th className="py-2 pr-4 font-semibold text-xs uppercase">Fecha</th>
                <th className="py-2 pr-4 font-semibold text-xs uppercase">Prioridad</th>
                <th className="py-2 font-semibold text-xs uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {phase.deliverables.map((d) => (
                <tr key={d.id}>
                  <td className="py-2.5 pr-4 max-w-[200px]">
                    <span className="block font-medium text-neutral-800 truncate" title={d.name}>
                      {d.name || "—"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 max-w-[140px]">
                    <span className="block text-neutral-600 truncate" title={d.responsible}>
                      {d.responsible || "—"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-neutral-600">{formatDate(d.dueDate)}</td>
                  <td className="py-2.5 pr-4">
                    <span className="status-pill bg-blue-50 text-blue-700 !normal-case">
                      {PRIORITY_LABELS[d.priority]}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`status-pill !normal-case ${
                        d.status === "entregado" || d.status === "finalizado"
                          ? "bg-emerald-100 text-emerald-600"
                          : d.status === "en-revision"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {DELIVERABLE_STATUS_LABELS[d.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

// ─── Formulario superpuesto (crear / editar) ─────────────────────────────────

function PhaseFormPanel({
  form,
  index,
}: {
  form: UseFormReturn<ProjectCharterFormData>;
  index: number;
}) {
  const { register, control, setValue, formState: { errors } } = form;
  const phase = useWatch({ control, name: `phases.${index}` }) as ProjectPhase | undefined;
  const status = phase?.status ?? "pending";
  const styles = PHASE_STATUS_STYLES[status];
  const deliverables = phase?.deliverables ?? [];
  const computedProgress = computePhaseProgress(deliverables);
  const phaseErrors = errors.phases?.[index];

  useEffect(() => {
    if (phase && phase.progress !== computedProgress) {
      setValue(`phases.${index}.progress`, computedProgress, { shouldDirty: true });
    }
  }, [computedProgress, index, phase, setValue]);

  const {
    fields: deliverableFields,
    append: appendDeliverable,
    remove: removeDeliverable,
  } = useFieldArray({ control, name: `phases.${index}.deliverables` });

  return (
    <div className="space-y-4">
      <div className="p-6 border border-neutral-200 rounded-2xl bg-white space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <MaterialIcon name={styles.iconName} className={`text-2xl flex-shrink-0 ${styles.icon}`} />
            <span className={`status-pill ${styles.pill}`}>{PHASE_STATUS_LABELS[status]}</span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <input
            {...register(`phases.${index}.title`)}
            placeholder="Ej. Fase 1: Iniciación y Diagnóstico"
            className={`input-field w-full font-semibold text-lg ${phaseErrors?.title ? "error" : ""}`}
          />
          <textarea
            {...register(`phases.${index}.description`)}
            rows={2}
            placeholder="Describe el alcance y objetivos de esta fase..."
            className={`input-field w-full resize-vertical min-h-16 ${phaseErrors?.description ? "error" : ""}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Inicio</label>
              <input
                type="date"
                {...register(`phases.${index}.startDate`)}
                className={`input-field w-full ${phaseErrors?.startDate ? "error" : ""}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Fin</label>
              <input
                type="date"
                {...register(`phases.${index}.endDate`)}
                className={`input-field w-full ${phaseErrors?.endDate ? "error" : ""}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Responsables</label>
              <input
                type="number"
                min={1}
                {...register(`phases.${index}.responsiblesCount`, { valueAsNumber: true })}
                className={`input-field w-full ${phaseErrors?.responsiblesCount ? "error" : ""}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Estado</label>
              <select {...register(`phases.${index}.status`)} className="input-field w-full">
                <option value="pending">Pendiente</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="delayed">Retrasada</option>
              </select>
            </div>
          </div>

          <div className="w-full pt-1" title="Calculado según el estado de los entregables">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Progreso</span>
              <span className={`text-[10px] font-bold ${styles.icon}`}>{computedProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
                style={{ width: `${computedProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              {deliverables.filter((d) => d.status === "entregado" || d.status === "finalizado").length}
              /{deliverables.length} entregables finalizados
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 bg-white font-semibold text-sm text-neutral-800">
          Entregables ({deliverableFields.length})
        </div>
        <div className="px-4 sm:px-6 pb-6 pt-4 space-y-4">
          {deliverableFields.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-6 rounded-xl border border-dashed border-neutral-300 bg-white">
              No hay entregables. Usa el botón de abajo para agregar el primero.
            </p>
          )}
          {deliverableFields.map((field, dIndex) => (
            <div
              key={field.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                  Entregable {dIndex + 1}
                </span>
                <RemoveButton
                  onClick={() => removeDeliverable(dIndex)}
                  label="Eliminar entregable"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">Nombre</label>
                  <input
                    {...register(`phases.${index}.deliverables.${dIndex}.name`)}
                    placeholder="Nombre del entregable"
                    className="input-field w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">
                      Responsable
                    </label>
                    <input
                      {...register(`phases.${index}.deliverables.${dIndex}.responsible`)}
                      placeholder="Responsable"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">
                      Fecha compromiso
                    </label>
                    <input
                      type="date"
                      {...register(`phases.${index}.deliverables.${dIndex}.dueDate`)}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">
                      Prioridad
                    </label>
                    <select
                      {...register(`phases.${index}.deliverables.${dIndex}.priority`)}
                      className="input-field w-full"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">Estado</label>
                    <select
                      {...register(`phases.${index}.deliverables.${dIndex}.status`)}
                      className="input-field w-full"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en-revision">En revisión</option>
                      <option value="entregado">Entregado</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendDeliverable(createEmptyDeliverable())}
            className="text-sm font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <MaterialIcon name="add" className="text-base" />
            Agregar entregable
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Paso Fases ───────────────────────────────────────────────────────────────

export function StepFases({ form }: FormProps) {
  const { control, setValue, watch, getValues, setError, clearErrors, formState: { errors } } = form;
  const phases = watch("phases") ?? [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showCronograma, setShowCronograma] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { fields, append, remove } = useFieldArray({ control, name: "phases" });

  useEffect(() => {
    setValue("projectPhases", serializePhases(phases), { shouldValidate: true });
  }, [phases, setValue]);

  const savedPhaseEntries = fields
    .map((field, index) => ({ field, index, phase: phases[index] }))
    .filter(({ phase }) => isPhaseSaved(phase));

  const savedPhases = savedPhaseEntries.map(({ phase }) => phase!);

  const stats = {
    total: savedPhaseEntries.length,
    completed: savedPhaseEntries.filter(({ phase }) => phase?.status === "completed").length,
    inProgress: savedPhaseEntries.filter(({ phase }) => phase?.status === "in-progress").length,
    delayed: savedPhaseEntries.filter(({ phase }) => phase?.status === "delayed").length,
  };

  const openCreate = () => {
    setFormError(null);
    const newIndex = phases.length;
    append(createEmptyPhase());
    setEditingIndex(newIndex);
  };

  const openEdit = (index: number) => {
    setFormError(null);
    setEditingIndex(index);
  };

  const closeEditor = () => {
    setFormError(null);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    if (editingIndex !== null) {
      const phase = getValues(`phases.${editingIndex}`);
      if (!isPhaseSaved(phase)) {
        remove(editingIndex);
      }
    }
    closeEditor();
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;

    const phase = getValues(`phases.${editingIndex}`);
    const withProgress = {
      ...phase,
      progress: computePhaseProgress(phase?.deliverables ?? []),
    };

    const result = projectPhaseSchema.safeParse(withProgress);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setFormError(firstIssue?.message ?? "Completa los campos de la fase");
      clearErrors("phases");
      setError(`phases.${editingIndex}`, {
        type: "manual",
        message: firstIssue?.message,
      });
      return;
    }

    setValue(`phases.${editingIndex}`, result.data, { shouldDirty: true, shouldValidate: true });
    setFormError(null);
    closeEditor();
  };

  return (
    <div className="relative min-h-[28rem] overflow-hidden">
      <div
        className={`space-y-8 transition-opacity duration-200 ${
          editingIndex !== null ? "opacity-40 pointer-events-none select-none" : ""
        }`}
        aria-hidden={editingIndex !== null}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Fases del Proyecto</h2>
            <p className="text-neutral-600 mt-1">
              Gestión y seguimiento de fases, entregables y cronograma
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 w-full sm:w-44 ml-0 md:ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowCronograma((v) => !v)}
              disabled={editingIndex !== null}
              className="btn-outline gap-2 w-full justify-center disabled:opacity-50"
            >
              <MaterialIcon name="calendar_today" />
              {showCronograma ? "Fases" : "Cronograma"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCronograma(false);
                openCreate();
              }}
              disabled={editingIndex !== null}
              className="btn-primary gap-2 w-full justify-center disabled:opacity-50"
            >
              <MaterialIcon name="add" />
              Agregar Fase
            </button>
          </div>
        </div>

        {errors.phases?.message && editingIndex === null && (
          <div className="notification-error text-sm flex items-start gap-2">
            <MaterialIcon name="error" className="text-base flex-shrink-0" />
            <span>{String(errors.phases.message)}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
              <MaterialIcon name="layers" />
            </div>
            <div>
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-tight">Total Fases</p>
              <p className="text-2xl font-bold text-neutral-900">{String(stats.total).padStart(2, "0")}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MaterialIcon name="check_circle" />
            </div>
            <div>
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-tight">Completadas</p>
              <p className="text-2xl font-bold text-neutral-900">{String(stats.completed).padStart(2, "0")}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <MaterialIcon name="pending_actions" />
            </div>
            <div>
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-tight">En Progreso</p>
              <p className="text-2xl font-bold text-neutral-900">{String(stats.inProgress).padStart(2, "0")}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <MaterialIcon name="warning" />
            </div>
            <div>
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-tight">Retrasadas</p>
              <p className="text-2xl font-bold text-neutral-900">{String(stats.delayed).padStart(2, "0")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {showCronograma ? (
            <PhaseCronograma
              phases={savedPhases}
              onClose={() => setShowCronograma(false)}
            />
          ) : savedPhaseEntries.length === 0 ? (
            <div className="card p-10 text-center">
              <MaterialIcon name="layers" className="text-4xl text-neutral-300 mb-3" />
              <p className="text-neutral-600 font-medium">Aún no hay fases registradas</p>
              <p className="text-sm text-neutral-500 mt-1">
                Configura la primera fase del proyecto.
              </p>
            </div>
          ) : (
            savedPhaseEntries.map(({ index, phase }) => (
              <PhaseViewCard
                key={fields[index].id}
                phase={phase!}
                onEdit={() => openEdit(index)}
                onDelete={() => remove(index)}
                canDelete={savedPhaseEntries.length > 1}
              />
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-500">
            {savedPhaseEntries.length === 0
              ? "Sin fases configuradas"
              : `Mostrando ${savedPhaseEntries.length} fase${savedPhaseEntries.length === 1 ? "" : "s"} guardada${savedPhaseEntries.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {editingIndex !== null && (
        <div
          className="absolute inset-0 z-[1] flex flex-col p-1 sm:p-2"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phase-editor-title"
        >
          <div className="flex flex-col flex-1 min-h-0 max-h-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div>
                <h3 id="phase-editor-title" className="text-lg font-bold text-neutral-900">
                  {isPhaseSaved(phases[editingIndex]) ? "Editar fase" : "Nueva fase"}
                </h3>
                <p className="text-sm text-neutral-500">Complete el formulario y pulse Actualizar</p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Cerrar"
              >
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4">
              {formError && (
                <div className="notification-error mb-4 text-sm">{formError}</div>
              )}
              <PhaseFormPanel form={form} index={editingIndex} />
            </div>

            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-neutral-200 bg-neutral-50">
              <button type="button" onClick={handleCancel} className="btn-outline">
                Cancelar
              </button>
              <button type="button" onClick={handleUpdate} className="btn-primary gap-2">
                <MaterialIcon name="save" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
