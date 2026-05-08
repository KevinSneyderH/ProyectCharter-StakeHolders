import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ProjectCharterFormData, StepId } from "./charter";
import { FORM_STEPS, DEFAULT_FORM_VALUES } from "./charter";
import { charterSchema, stepSchemas } from "./charterSchema";
import { useCharterAutosave, loadDraft } from "./useCharterAutosave";

import { StepNavigator, MobileProgress } from "./StepNavigator";
import {
  StepIdentificacion,
  StepVersiones,
  StepDescripcion,
  StepProducto,
} from "./Steps1to4";
import {
  StepRequisitos,
  StepObjetivos,
  StepPM,
  StepHitos,
} from "./Steps5to8";
import {
  StepOrganizaciones,
  StepRiesgos,
  StepPresupuesto,
} from "./Steps9to11";

// ─── API submission helper ────────────────────────────────────────────────────

async function submitCharter(data: ProjectCharterFormData): Promise<{ id: string }> {
  const response = await fetch("/api/submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Authorization: `Bearer ${token}` ← add when Sanctum is wired
    },
    body: JSON.stringify({ type: "project_charter", data }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message ?? "Error al enviar el formulario");
  }

  return response.json();
}

function AutosaveIndicator({ savedAt }: { savedAt: string | null }) {
  if (!savedAt) return null;
  const date = new Date(savedAt);
  const time = date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return (
    <span className="text-xs text-neutral-500 flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L9 14.414l-4.707-4.707a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span className="font-medium">Borrador guardado {time}</span>
    </span>
  );
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export function ProjectCharterForm() {
  const [currentStep, setCurrentStep] = useState<StepId>("identificacion");
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const form = useForm<ProjectCharterFormData>({
    resolver: zodResolver(charterSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  const { watch, handleSubmit, reset, trigger, getValues } = form;
  const formData = watch();

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !draftLoaded) {
      reset(draft.data);
      setLastSaved(draft.savedAt);
      setDraftLoaded(true);
    }
  }, [reset, draftLoaded]);

  // Autosave
  useCharterAutosave(formData);

  useEffect(() => {
    const stored = localStorage.getItem("project_charter_draft_timestamp");
    if (stored) setLastSaved(stored);
  }, [formData]);

  const currentStepIndex = FORM_STEPS.findIndex((s) => s.id === currentStep);

  const validateCurrentStep = useCallback(async () => {
    const schema = stepSchemas[currentStep];
    if (!schema) return true;

    const values = getValues();
    const result = schema.safeParse(values);
    if (result.success) return true;

    await trigger();
    return false;
  }, [currentStep, getValues, trigger]);

  const goToStep = useCallback((stepId: StepId) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNext = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (valid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      const next = FORM_STEPS[currentStepIndex + 1];
      if (next) goToStep(next.id);
    }
  }, [validateCurrentStep, currentStep, currentStepIndex, goToStep]);

  const handlePrev = useCallback(() => {
    const prev = FORM_STEPS[currentStepIndex - 1];
    if (prev) goToStep(prev.id);
  }, [currentStepIndex, goToStep]);

  const onSubmit = async (data: ProjectCharterFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitCharter(data);
      setSubmitSuccess(true);
      // clearDraft();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-neutral-50 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-md">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-neutral-900">¡Excelente!</h2>
            <p className="text-lg text-neutral-600">Project Charter enviado correctamente</p>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Tu profesor recibirá el formulario y te notificará cuando esté calificado. Gracias por completar el documento.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              reset(DEFAULT_FORM_VALUES);
              setCompletedSteps(new Set());
              setCurrentStep("identificacion");
            }}
            className="btn-primary w-full"
          >
            Crear nuevo formulario
          </button>
        </div>
      </div>
    );
  }

  const stepComponentMap: Record<StepId, React.ReactElement> = {
    identificacion: <StepIdentificacion form={form} />,
    versiones: <StepVersiones form={form} />,
    descripcion: <StepDescripcion form={form} />,
    producto: <StepProducto form={form} />,
    requisitos: <StepRequisitos form={form} />,
    objetivos: <StepObjetivos form={form} />,
    pm: <StepPM form={form} />,
    hitos: <StepHitos form={form} />,
    organizaciones: <StepOrganizaciones form={form} />,
    riesgos: <StepRiesgos form={form} />,
    presupuesto: <StepPresupuesto form={form} />,
  };

  const currentStepMeta = FORM_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="container-responsive py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-neutral-900">Project Charter</p>
              <p className="text-xs text-neutral-500">{currentStepMeta.label}</p>
            </div>
          </div>
          <AutosaveIndicator savedAt={lastSaved} />
        </div>
      </header>

      <div className="container-responsive py-8">
        <div className="flex gap-8">
          {/* Sidebar navigator – desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1 mb-3">
                📋 Secciones
              </p>
              <StepNavigator
                steps={FORM_STEPS}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onNavigate={goToStep}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile progress */}
            <div className="lg:hidden mb-6">
              <MobileProgress
                steps={FORM_STEPS}
                currentStepIndex={currentStepIndex}
                completedCount={completedSteps.size}
              />
              <p className="text-xs font-medium text-neutral-600 mt-2 px-1">{currentStepMeta.label}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Step panel */}
              <div className="card-elevated p-6 md:p-8 mb-6">
                {stepComponentMap[currentStep]}
              </div>

              {/* Error banner */}
              {submitError && (
                <div className="notification-error mb-6 flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-sm">Error al enviar</h3>
                    <p className="text-sm mt-1">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary order-1 sm:order-2"
                  >
                    Siguiente
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold
                      bg-gradient-to-r from-emerald-600 to-emerald-700 text-white
                      hover:shadow-lg active:scale-95
                      disabled:opacity-60 disabled:cursor-not-allowed
                      smooth-transition order-1 sm:order-2
                    "
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Enviar al profesor
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
