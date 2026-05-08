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

// ─── Step 9: Organizaciones ───────────────────────────────────────────────────

export function StepOrganizaciones({ form }: FormProps) {
  const { register, control, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "organizations" });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Organizaciones y Grupos Involucrados"
        description="Entidades internas o externas que intervienen en el proyecto y el rol que desempeñan."
      />

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-xl border border-neutral-200 bg-white p-4 items-start shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="md:col-span-2">
              <TextInput
                label="Organización o grupo"
                placeholder="Ej. Dependencia Ingeniería de Sistemas"
                required
                error={errors.organizations?.[index]?.nameOrGroup}
                {...register(`organizations.${index}.nameOrGroup`)}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Rol que desempeña"
                placeholder="Proveer el servicio de instalación, configuración de equipos..."
                rows={2}
                required
                error={errors.organizations?.[index]?.role}
                {...register(`organizations.${index}.role`)}
              />
            </div>
            <div className="flex items-center justify-end pt-6">
              {fields.length > 1 && (
                <RemoveButton onClick={() => remove(index)} label="Eliminar organización" />
              )}
            </div>
          </div>
        ))}
      </div>

      <AddButton
        label="Agregar organización"
        onClick={() => append({ id: uuidv4(), nameOrGroup: "", role: "" })}
      />
    </div>
  );
}

// ─── Step 10: Riesgos ─────────────────────────────────────────────────────────

export function StepRiesgos({ form }: FormProps) {
  const { register, control, watch, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "risks" });
  const risks = watch("risks");

  const threats = fields.filter((_, i) => risks[i]?.type === "amenaza");
  const opportunities = fields.filter((_, i) => risks[i]?.type === "oportunidad");

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Riesgos del Proyecto"
        description="Identifica las principales amenazas (riesgos negativos) y oportunidades (riesgos positivos) del proyecto."
      />

      <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
        <div className="space-y-1">
          <p className="text-3xl font-bold text-red-600">{threats.length}</p>
          <p className="text-sm font-medium text-neutral-600">⚠ Amenazas</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-emerald-600">{opportunities.length}</p>
          <p className="text-sm font-medium text-neutral-600">✨ Oportunidades</p>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const type = risks[index]?.type ?? "amenaza";
          return (
            <div
              key={field.id}
              className={`rounded-xl border-2 p-5 space-y-4 smooth-transition ${type === "amenaza"
                ? "border-red-200 bg-red-50/40"
                : "border-emerald-200 bg-emerald-50/40"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={type === "amenaza" ? "threat" : "opportunity"}>
                    {type === "amenaza" ? "⚠ Amenaza" : "✨ Oportunidad"}
                  </Badge>
                  <span className="text-xs font-medium text-neutral-500">#Riesgo {index + 1}</span>
                </div>
                {fields.length > 1 && (
                  <RemoveButton onClick={() => remove(index)} label="Eliminar riesgo" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-2">
                    Tipo de riesgo <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input-field text-sm"
                    {...register(`risks.${index}.type`)}
                  >
                    <option value="amenaza">⚠ Amenaza (negativo)</option>
                    <option value="oportunidad">✨ Oportunidad (positivo)</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <Textarea
                    label="Descripción del riesgo"
                    placeholder={
                      type === "amenaza"
                        ? "El sistema puede presentar... lo que podría causar..."
                        : "La implementación puede posicionar... mejorando..."
                    }
                    rows={2}
                    required
                    error={errors.risks?.[index]?.description}
                    {...register(`risks.${index}.description`)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <AddButton
          label="Agregar amenaza"
          onClick={() =>
            append({ id: uuidv4(), type: "amenaza", description: "" })
          }
        />
        <AddButton
          label="Agregar oportunidad"
          onClick={() =>
            append({ id: uuidv4(), type: "oportunidad", description: "" })
          }
        />
      </div>
    </div>
  );
}

// ─── Step 11: Presupuesto y Sponsor ───────────────────────────────────────────

export function StepPresupuesto({ form }: FormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <SectionHeading
          title="Presupuesto Preliminar"
          description="Costo total estimado del proyecto."
        />

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <TextInput
            label="Costo Total del Proyecto"
            placeholder="Ej. $33.157.461 COP  /  $ 8,000 USD"
            required
            error={errors.totalBudget}
            hint="Incluye la moneda (COP, USD, etc.) y el monto total aprobado."
            {...register("totalBudget")}
          />
        </div>
      </div>

      <div className="space-y-6">
        <SectionHeading
          title="Sponsor que Autoriza el Proyecto"
          description="Persona que autoriza formalmente la ejecución del proyecto."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Nombre del Sponsor"
            placeholder="Ej. Johel Rodríguez"
            required
            error={errors.sponsorName}
            {...register("sponsorName")}
          />
          <TextInput
            label="Empresa / Organización"
            placeholder="Ej. Universidad Simón Bolívar"
            required
            error={errors.sponsorCompany}
            {...register("sponsorCompany")}
          />
          <TextInput
            label="Cargo"
            placeholder="Ej. Director Ingeniería de Sistemas"
            required
            error={errors.sponsorPosition}
            {...register("sponsorPosition")}
          />
          <TextInput
            label="Fecha de autorización"
            type="date"
            required
            error={errors.sponsorDate}
            {...register("sponsorDate")}
          />
        </div>

        <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-5 text-sm text-emerald-900 space-y-2">
          <p className="font-bold flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Último paso - ¡Ya casi terminas!
          </p>
          <p>
            Al enviar el formulario, el profesor recibirá una notificación con tu Project Charter
            completo para revisión y calificación. Asegúrate de que toda la información sea correcta
            antes de enviar.
          </p>
        </div>
      </div>
    </div>
  );
}
