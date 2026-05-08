import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { ProjectCharterFormData } from "./types/charter";
import { v4 as uuidv4 } from 'uuid'
import {
  TextInput,
  Textarea,
  SectionHeading,
  Badge,
  RemoveButton,
  AddButton,
} from "./FieldComponents";

type FormProps = { form: UseFormReturn<ProjectCharterFormData> };

// ─── Step 5: Requisitos ───────────────────────────────────────────────────────

export function StepRequisitos({ form }: FormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Definición de Requisitos del Proyecto"
        description="Requerimientos del sponsor, cliente, funcionales, no funcionales y de calidad."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          label="Requisitos del Sponsor"
          placeholder="El Sponsor requiere: ..."
          rows={4}
          required
          error={errors.sponsorRequirements}
          {...register("sponsorRequirements")}
        />
        <Textarea
          label="Requisitos del Cliente"
          placeholder="El cliente solicita: reuniones sistemáticas, presentación a comité de cambios..."
          rows={4}
          required
          error={errors.clientRequirements}
          {...register("clientRequirements")}
        />
      </div>

      <Textarea
        label="Requisitos Funcionales"
        placeholder="- El sistema debe ser capaz de...&#10;- Debe integrarse con...&#10;- Debe permitir al usuario..."
        rows={5}
        required
        error={errors.functionalRequirements}
        hint="Lista cada requisito funcional con un guión o numeración."
        {...register("functionalRequirements")}
      />

      <Textarea
        label="Requisitos No Funcionales"
        placeholder="- El sistema debe soportar N usuarios concurrentes.&#10;- Disponibilidad 24/7.&#10;- Tiempo de respuesta menor a 2 segundos."
        rows={5}
        required
        error={errors.nonFunctionalRequirements}
        {...register("nonFunctionalRequirements")}
      />

      <Textarea
        label="Requisitos de Calidad"
        placeholder="- Las respuestas deben ser precisas y relevantes.&#10;- La interfaz debe ser intuitiva.&#10;- El sistema debe ser fácil de mantener."
        rows={4}
        required
        error={errors.qualityRequirements}
        {...register("qualityRequirements")}
      />
    </div>
  );
}

// ─── Step 6: Objetivos ────────────────────────────────────────────────────────

const conceptLabels = {
  alcance: { label: "1. Alcance", badge: "scope" as const, emoji: "📦" },
  tiempo: { label: "2. Tiempo", badge: "time" as const, emoji: "⏱️" },
  costo: { label: "3. Costo", badge: "cost" as const, emoji: "💰" },
};

export function StepObjetivos({ form }: FormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Objetivos del Proyecto"
        description="Metas hacia las cuales se debe dirigir el trabajo del proyecto en términos de la triple restricción (alcance, tiempo, costo)."
      />

      {(["alcance", "tiempo", "costo"] as const).map((concept, index) => {
        const meta = conceptLabels[concept];
        return (
          <div
            key={concept}
            className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2">
              <Badge variant={meta.badge}>{meta.label}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Objetivo"
                placeholder={
                  concept === "alcance"
                    ? "Cumplir con la elaboración y entrega de los entregables: ..."
                    : concept === "tiempo"
                      ? "Concluir el proyecto dentro del plazo establecido..."
                      : "Cumplir con el presupuesto estimado del proyecto..."
                }
                rows={4}
                required
                error={errors.objectives?.[index]?.objective}
                {...register(`objectives.${index}.objective`)}
              />
              <Textarea
                label="Criterio de éxito"
                placeholder={
                  concept === "alcance"
                    ? "Aprobación de todos los entregables por parte del cliente..."
                    : concept === "tiempo"
                      ? "Finalizar el proyecto dentro del cronograma acordado..."
                      : "No exceder el presupuesto total de $..."
                }
                rows={4}
                required
                error={errors.objectives?.[index]?.successCriteria}
                {...register(`objectives.${index}.successCriteria`)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 7: Project Manager ──────────────────────────────────────────────────

export function StepPM({ form }: FormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Designación del Project Manager"
        description="Información del responsable de planificación, ejecución y control del proyecto."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Nombre del Project Manager"
          placeholder="Ej. Wilson Castro"
          required
          error={errors.pmName}
          {...register("pmName")}
        />
        <TextInput
          label="Reporta a"
          placeholder="Ej. Miguel Ángel Pérez"
          required
          error={errors.pmReportsTo}
          {...register("pmReportsTo")}
        />
      </div>

      <Textarea
        label="Niveles de autoridad"
        placeholder="Exigir el cumplimiento de los entregables del proyecto dentro del cronograma establecido y el presupuesto aprobado..."
        rows={4}
        required
        error={errors.pmAuthority}
        hint="Describe las decisiones que puede tomar el PM de forma autónoma."
        {...register("pmAuthority")}
      />

      <TextInput
        label="Supervisa a"
        placeholder="Ej. Kevin Hernández, Antuan Peñaranda"
        required
        error={errors.pmSupervises}
        hint="Lista los miembros del equipo que reportan al PM."
        {...register("pmSupervises")}
      />
    </div>
  );
}

// ─── Step 8: Hitos ────────────────────────────────────────────────────────────

export function StepHitos({ form }: FormProps) {
  const { register, control, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "milestones" });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Cronograma de Hitos del Proyecto"
        description="Eventos o entregas significativas que marcan el progreso del proyecto y sus fechas programadas."
      />

      <div className="rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm bg-white">
          <thead className="bg-blue-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-5 py-3 font-bold text-neutral-700">
                Hito o evento significativo
              </th>
              <th className="text-left px-5 py-3 font-bold text-neutral-700 w-48">
                Fecha programada
              </th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-5 py-3">
                  <input
                    className={`
                      w-full rounded-md border px-3 py-2 text-sm text-neutral-800
                      outline-none smooth-transition bg-transparent
                      placeholder:text-neutral-400
                      ${errors.milestones?.[index]?.name
                        ? "border-red-300 focus:border-red-400"
                        : "border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      }
                    `}
                    placeholder="Ej. Inicio del Proyecto"
                    {...register(`milestones.${index}.name`)}
                  />
                  {errors.milestones?.[index]?.name && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.milestones[index]?.name?.message}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <input
                    type="date"
                    className={`
                      w-full rounded-md border px-3 py-2 text-sm text-neutral-800
                      outline-none smooth-transition bg-transparent
                      ${errors.milestones?.[index]?.scheduledDate
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                      }
                    `}
                    {...register(`milestones.${index}.scheduledDate`)}
                  />
                </td>
                <td className="px-2 py-2">
                  {fields.length > 1 && (
                    <RemoveButton onClick={() => remove(index)} label="Eliminar hito" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddButton
        label="Agregar hito"
        onClick={() => append({ id: uuidv4(), name: "", scheduledDate: "" })}
      />
    </div>
  );
}
