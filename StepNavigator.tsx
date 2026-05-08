import type { StepId, FormStep } from "../types/charter";

interface StepNavigatorProps {
  steps: FormStep[];
  currentStep: StepId;
  completedSteps: Set<StepId>;
  onNavigate: (step: StepId) => void;
}

export function StepNavigator({
  steps,
  currentStep,
  completedSteps,
  onNavigate,
}: StepNavigatorProps) {
  return (
    <nav
      aria-label="Pasos del formulario"
      className="flex flex-col gap-1"
    >
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isAccessible = index === 0 || completedSteps.has(steps[index - 1].id) || isCompleted;

        return (
          <button
            key={step.id}
            type="button"
            disabled={!isAccessible}
            onClick={() => isAccessible && onNavigate(step.id)}
            aria-current={isActive ? "step" : undefined}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium
              smooth-transition group
              ${isActive
                ? "bg-blue-50 text-blue-900 border-l-4 border-blue-600"
                : isCompleted
                  ? "text-neutral-700 hover:bg-neutral-100"
                  : isAccessible
                    ? "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                    : "text-neutral-300 cursor-not-allowed"
              }
            `}
          >
            {/* Step indicator */}
            <span
              className={`
                flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                smooth-transition
                ${isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : isCompleted
                    ? "bg-emerald-500 text-white"
                    : isAccessible
                      ? "bg-neutral-300 text-neutral-600"
                      : "bg-neutral-200 text-neutral-400"
                }
              `}
            >
              {isCompleted && !isActive ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </span>

            {/* Label */}
            <span className="text-sm leading-snug flex-1">{step.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Mobile step progress bar ─────────────────────────────────────────────────

interface MobileProgressProps {
  steps: FormStep[];
  currentStepIndex: number;
  completedCount: number;
}

export function MobileProgress({ steps, currentStepIndex, completedCount }: MobileProgressProps) {
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-lg border border-neutral-200">
      <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full smooth-transition shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-neutral-600 flex-shrink-0">
        {currentStepIndex + 1}/{steps.length}
      </span>
    </div>
  );
}
