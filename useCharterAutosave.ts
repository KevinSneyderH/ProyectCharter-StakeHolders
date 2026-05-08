import { useEffect, useCallback, useRef } from "react";
import type { ProjectCharterFormData } from "../types/charter";

const STORAGE_KEY = "project_charter_draft";
const AUTOSAVE_DELAY = 1500; // ms

export function useCharterAutosave(data: ProjectCharterFormData) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  const save = useCallback((formData: ProjectCharterFormData) => {
    try {
      const serialized = JSON.stringify(formData);
      if (serialized === lastSavedRef.current) return;
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, new Date().toISOString());
      lastSavedRef.current = serialized;
    } catch {
      // Storage quota or serialization error — fail silently
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(data), AUTOSAVE_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, save]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
    lastSavedRef.current = "";
  }, []);

  return { clearDraft };
}

export function loadDraft(): { data: ProjectCharterFormData; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ts = localStorage.getItem(`${STORAGE_KEY}_timestamp`);
    if (!raw) return null;
    return { data: JSON.parse(raw) as ProjectCharterFormData, savedAt: ts ?? "" };
  } catch {
    return null;
  }
}
