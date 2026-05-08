import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { ProjectCharterFormData } from "./types/charter";
import { v4 as uuidv4 } from 'uuid'
import {
  TextInput,
  Textarea,
  SectionHeading,
  RemoveButton,
  AddButton,
} from "./FieldComponents";

type FormProps = { form: UseFormReturn<ProjectCharterFormData> };

// ─── Step 1: Identificación ───────────────────────────────────────────────────

export function StepIdentificacion({ form }: FormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Identificación del Proyecto"
        description="Nombre oficial y siglas con las que se identificará el proyecto a lo largo de toda la documentación."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Nombre del Proyecto"
          placeholder="Ej. ChatBot Asistente USB"
          required
          error={errors.projectName}
          wrapperClassName="md:col-span-2"
          {...register("projectName")}
        />
        <TextInput
          label="Siglas del Proyecto"
          placeholder="Ej. CH USB"
          required
          error={errors.projectAcronym}
          {...register("projectAcronym")}
        />
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
        <p className="font-bold mb-2">💡 Consejo práctico</p>
        <p className="leading-relaxed">
          El nombre debe ser descriptivo y reflejar el alcance del proyecto. Las siglas serán usadas
          en todos los documentos, informes y comunicaciones del equipo.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Control de versiones ─────────────────────────────────────────────

export function StepVersiones({ form }: FormProps) {
  const { register, control, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "versions" });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Control de Versiones"
        description="Registra cada revisión del Project Charter. La versión inicial siempre debe ser la 0.1."
      />

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-700">
                📝 Versión #{index + 1}
              </span>
              {fields.length > 1 && (
                <RemoveButton onClick={() => remove(index)} label="Eliminar versión" />
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <TextInput
                label="Versión"
                placeholder="0.1"
                required
                error={errors.versions?.[index]?.version}
                {...register(`versions.${index}.version`)}
              />
              <TextInput
                label="Fecha"
                type="date"
                required
                error={errors.versions?.[index]?.date}
                {...register(`versions.${index}.date`)}
              />
              <TextInput
                label="Motivo"
                placeholder="Versión original"
                required
                error={errors.versions?.[index]?.reason}
                wrapperClassName="col-span-2 md:col-span-1"
                {...register(`versions.${index}.reason`)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TextInput
                label="Hecha por (iniciales)"
                placeholder="CH"
                required
                error={errors.versions?.[index]?.madeBy}
                {...register(`versions.${index}.madeBy`)}
              />
              <TextInput
                label="Revisada por (iniciales)"
                placeholder="AV"
                required
                error={errors.versions?.[index]?.reviewedBy}
                {...register(`versions.${index}.reviewedBy`)}
              />
              <TextInput
                label="Aprobada por (iniciales)"
                placeholder="AV"
                required
                error={errors.versions?.[index]?.approvedBy}
                {...register(`versions.${index}.approvedBy`)}
              />
            </div>
          </div>
        ))}
      </div>

      <AddButton
        label="Agregar versión"
        onClick={() =>
          append({
            id: uuidv4(),
            version: "",
            madeBy: "",
            reviewedBy: "",
            approvedBy: "",
            date: "",
            reason: "",
          })
        }
      />
    </div>
  );
}

// ─── Step 3: Descripción general ──────────────────────────────────────────────

export function StepDescripcion({ form }: FormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Descripción General"
        description="Contexto global del proyecto: qué se va a desarrollar, quiénes participan, cuánto tiempo tomará y dónde se realizará."
      />

      <Textarea
        label="Descripción general del proyecto"
        placeholder="El proyecto consiste en desarrollar... El equipo estará compuesto por... El plazo estimado es..."
        rows={5}
        required
        error={errors.generalDescription}
        hint="Mínimo 50 caracteres. Debe incluir qué se va a hacer, quiénes participan y el alcance general."
        {...register("generalDescription")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Ubicación / Lugar del proyecto"
          placeholder="Ej. Bogotá D.C., oficinas de la empresa"
          required
          error={errors.location}
          {...register("location")}
        />
        <TextInput
          label="Duración estimada"
          placeholder="Ej. 4 meses (sep 2024 – dic 2024)"
          required
          error={errors.duration}
          {...register("duration")}
        />
      </div>
    </div>
  );
}

// ─── Step 4: Definición del producto ─────────────────────────────────────────

export function StepProducto({ form }: FormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Definición del Producto del Proyecto"
        description="Descripción del producto, servicio o capacidad a generar, incluyendo arquitectura, fases y entregables."
      />

      <Textarea
        label="Definición del producto / servicio / capacidad"
        placeholder="El producto consiste en... Sus características principales son... Será implementado en..."
        rows={5}
        required
        error={errors.productDefinition}
        hint="Describe qué entregará el proyecto, sus características y cómo se usará."
        {...register("productDefinition")}
      />

      <Textarea
        label="Arquitectura de la solución a implementar"
        placeholder="La solución será construida utilizando... Incluirá los siguientes componentes: ..."
        rows={5}
        required
        error={errors.solutionArchitecture}
        hint="Describe los componentes técnicos, plataformas, integraciones y módulos de la solución."
        {...register("solutionArchitecture")}
      />

      <Textarea
        label="Fases del proyecto y entregables"
        placeholder="Fase 1 - Planificación (duración: X semanas): Entregable: ...&#10;Fase 2 - Desarrollo (duración: X semanas): Entregable: ..."
        rows={6}
        required
        error={errors.projectPhases}
        hint="Lista cada fase con su duración estimada y el entregable asociado."
        {...register("projectPhases")}
      />
    </div>
  );
}
