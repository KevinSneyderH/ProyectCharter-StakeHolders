import React from "react";
import type { FieldError } from "react-hook-form";

// ─── Base field wrapper ────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  htmlFor?: string;
  error?: FieldError;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = "",
}: FieldWrapperProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-neutral-700 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500 text-xs font-bold">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}

// ─── Text Input ────────────────────────────────────────────────────────────────

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  hint?: string;
  wrapperClassName?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, wrapperClassName, id, required, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
        className={wrapperClassName}
      >
        <input
          id={inputId}
          ref={ref}
          className={`
            input-field
            ${error ? "error" : ""}
          `}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
TextInput.displayName = "TextInput";

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: FieldError;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, wrapperClassName, id, required, rows = 4, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
        className={wrapperClassName}
      >
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={`
            input-field resize-vertical min-h-24
            ${error ? "error" : ""}
          `}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Textarea.displayName = "Textarea";

// ─── Section heading ──────────────────────────────────────────────────────────

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1.5 pb-2">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      {description && <p className="text-sm text-neutral-600">{description}</p>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = "threat" | "opportunity" | "scope" | "time" | "cost";

const badgeStyles: Record<BadgeVariant, string> = {
  threat: "bg-red-100 text-red-800 border border-red-300",
  opportunity: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  scope: "bg-blue-100 text-blue-800 border border-blue-300",
  time: "bg-amber-100 text-amber-800 border border-amber-300",
  cost: "bg-purple-100 text-purple-800 border border-purple-300",
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${badgeStyles[variant]}`}
    >
      {children}
    </span>
  );
}

// ─── Remove button ────────────────────────────────────────────────────────────

export function RemoveButton({ onClick, label = "Eliminar" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

// ─── Add button ───────────────────────────────────────────────────────────────

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-blue-300
        text-sm text-blue-700 font-semibold
        hover:bg-blue-50 hover:border-blue-400 
        transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
      "
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  );
}
