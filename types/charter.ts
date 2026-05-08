import { v4 as uuidv4 } from 'uuid'
// ─── Project Charter Types ────────────────────────────────────────────────────

export interface VersionEntry {
  id: string;
  version: string;
  madeBy: string;
  reviewedBy: string;
  approvedBy: string;
  date: string;
  reason: string;
}

export interface Objective {
  concept: "alcance" | "tiempo" | "costo";
  objective: string;
  successCriteria: string;
}

export interface Milestone {
  id: string;
  name: string;
  scheduledDate: string;
}

export interface Organization {
  id: string;
  nameOrGroup: string;
  role: string;
}

export interface Risk {
  id: string;
  type: "amenaza" | "oportunidad";
  description: string;
}

export interface ProjectCharterFormData {
  // Paso 1 – Identificación
  projectName: string;
  projectAcronym: string;

  // Paso 2 – Control de versiones
  versions: VersionEntry[];

  // Paso 3 – Descripción general
  generalDescription: string;
  location: string;
  duration: string;

  // Paso 4 – Definición del producto
  productDefinition: string;
  solutionArchitecture: string;
  projectPhases: string;

  // Paso 5 – Requisitos
  sponsorRequirements: string;
  clientRequirements: string;
  functionalRequirements: string;
  nonFunctionalRequirements: string;
  qualityRequirements: string;

  // Paso 6 – Objetivos (triple restricción)
  objectives: Objective[];

  // Paso 7 – Project Manager
  pmName: string;
  pmReportsTo: string;
  pmAuthority: string;
  pmSupervises: string;

  // Paso 8 – Hitos
  milestones: Milestone[];

  // Paso 9 – Organizaciones
  organizations: Organization[];

  // Paso 10 – Riesgos
  risks: Risk[];

  // Paso 11 – Presupuesto y Sponsor
  totalBudget: string;
  sponsorName: string;
  sponsorCompany: string;
  sponsorPosition: string;
  sponsorDate: string;
}

export type StepId =
  | "identificacion"
  | "versiones"
  | "descripcion"
  | "producto"
  | "requisitos"
  | "objetivos"
  | "pm"
  | "hitos"
  | "organizaciones"
  | "riesgos"
  | "presupuesto";

export interface FormStep {
  id: StepId;
  label: string;
  shortLabel: string;
}

export const FORM_STEPS: FormStep[] = [
  { id: "identificacion", label: "Identificación del proyecto", shortLabel: "ID" },
  { id: "versiones", label: "Control de versiones", shortLabel: "Versiones" },
  { id: "descripcion", label: "Descripción general", shortLabel: "Descripción" },
  { id: "producto", label: "Definición del producto", shortLabel: "Producto" },
  { id: "requisitos", label: "Requisitos del proyecto", shortLabel: "Requisitos" },
  { id: "objetivos", label: "Objetivos del proyecto", shortLabel: "Objetivos" },
  { id: "pm", label: "Project Manager", shortLabel: "PM" },
  { id: "hitos", label: "Hitos del proyecto", shortLabel: "Hitos" },
  { id: "organizaciones", label: "Organizaciones involucradas", shortLabel: "Orgs" },
  { id: "riesgos", label: "Riesgos del proyecto", shortLabel: "Riesgos" },
  { id: "presupuesto", label: "Presupuesto y Sponsor", shortLabel: "Presupuesto" },
];

export const DEFAULT_FORM_VALUES: ProjectCharterFormData = {
  projectName: "",
  projectAcronym: "",
  versions: [
    {
      id: uuidv4(),
      version: "0.1",
      madeBy: "",
      reviewedBy: "",
      approvedBy: "",
      date: "",
      reason: "Versión original",
    },
  ],
  generalDescription: "",
  location: "",
  duration: "",
  productDefinition: "",
  solutionArchitecture: "",
  projectPhases: "",
  sponsorRequirements: "",
  clientRequirements: "",
  functionalRequirements: "",
  nonFunctionalRequirements: "",
  qualityRequirements: "",
  objectives: [
    { concept: "alcance", objective: "", successCriteria: "" },
    { concept: "tiempo", objective: "", successCriteria: "" },
    { concept: "costo", objective: "", successCriteria: "" },
  ],
  pmName: "",
  pmReportsTo: "",
  pmAuthority: "",
  pmSupervises: "",
  milestones: [{ id: uuidv4(), name: "Inicio del Proyecto", scheduledDate: "" }],
  organizations: [{ id: uuidv4(), nameOrGroup: "", role: "" }],
  risks: [{ id: uuidv4(), type: "amenaza", description: "" }],
  totalBudget: "",
  sponsorName: "",
  sponsorCompany: "",
  sponsorPosition: "",
  sponsorDate: "",
};
