import { z } from "zod";

const versionSchema = z.object({
  id: z.string(),
  version: z.string().min(1, "La versión es requerida"),
  madeBy: z.string().min(1, "Requerido"),
  reviewedBy: z.string().min(1, "Requerido"),
  approvedBy: z.string().min(1, "Requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  reason: z.string().min(1, "El motivo es requerido"),
});

const objectiveSchema = z.object({
  concept: z.enum(["alcance", "tiempo", "costo"]),
  objective: z.string().min(10, "Describe el objetivo con al menos 10 caracteres"),
  successCriteria: z.string().min(10, "Describe el criterio de éxito"),
});

const milestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre del hito es requerido"),
  scheduledDate: z.string().min(1, "La fecha programada es requerida"),
});

const organizationSchema = z.object({
  id: z.string(),
  nameOrGroup: z.string().min(1, "El nombre/grupo es requerido"),
  role: z.string().min(1, "El rol es requerido"),
});

const riskSchema = z.object({
  id: z.string(),
  type: z.enum(["amenaza", "oportunidad"]),
  description: z.string().min(10, "Describe el riesgo con detalle"),
});

export const charterSchema = z.object({
  projectName: z.string().min(5, "El nombre del proyecto debe tener al menos 5 caracteres"),
  projectAcronym: z.string().min(1, "Las siglas son requeridas").max(20, "Máximo 20 caracteres"),

  versions: z.array(versionSchema).min(1, "Debe haber al menos una versión"),

  generalDescription: z.string().min(50, "La descripción debe tener al menos 50 caracteres"),
  location: z.string().min(3, "La ubicación es requerida"),
  duration: z.string().min(3, "La duración es requerida"),

  productDefinition: z.string().min(50, "Define el producto con más detalle"),
  solutionArchitecture: z.string().min(30, "Describe la arquitectura de la solución"),
  projectPhases: z.string().min(30, "Describe las fases del proyecto"),

  sponsorRequirements: z.string().min(10, "Los requisitos del sponsor son requeridos"),
  clientRequirements: z.string().min(10, "Los requisitos del cliente son requeridos"),
  functionalRequirements: z.string().min(20, "Los requisitos funcionales son requeridos"),
  nonFunctionalRequirements: z.string().min(20, "Los requisitos no funcionales son requeridos"),
  qualityRequirements: z.string().min(20, "Los requisitos de calidad son requeridos"),

  objectives: z.array(objectiveSchema).length(3, "Deben existir los 3 objetivos"),

  pmName: z.string().min(3, "El nombre del PM es requerido"),
  pmReportsTo: z.string().min(3, "Especifica a quién reporta"),
  pmAuthority: z.string().min(10, "Describe los niveles de autoridad"),
  pmSupervises: z.string().min(3, "Especifica a quién supervisa"),

  milestones: z.array(milestoneSchema).min(1, "Agrega al menos un hito"),
  organizations: z.array(organizationSchema).min(1, "Agrega al menos una organización"),
  risks: z.array(riskSchema).min(1, "Agrega al menos un riesgo"),

  totalBudget: z.string().min(1, "El presupuesto es requerido"),
  sponsorName: z.string().min(3, "El nombre del sponsor es requerido"),
  sponsorCompany: z.string().min(2, "La empresa del sponsor es requerida"),
  sponsorPosition: z.string().min(3, "El cargo del sponsor es requerido"),
  sponsorDate: z.string().min(1, "La fecha de autorización es requerida"),
});

export type CharterSchema = z.infer<typeof charterSchema>;

// Step-level validation subsets
export const stepSchemas: Record<string, z.ZodType> = {
  identificacion: charterSchema.pick({ projectName: true, projectAcronym: true }),
  versiones: charterSchema.pick({ versions: true }),
  descripcion: charterSchema.pick({
    generalDescription: true,
    location: true,
    duration: true,
  }),
  producto: charterSchema.pick({
    productDefinition: true,
    solutionArchitecture: true,
    projectPhases: true,
  }),
  requisitos: charterSchema.pick({
    sponsorRequirements: true,
    clientRequirements: true,
    functionalRequirements: true,
    nonFunctionalRequirements: true,
    qualityRequirements: true,
  }),
  objetivos: charterSchema.pick({ objectives: true }),
  pm: charterSchema.pick({
    pmName: true,
    pmReportsTo: true,
    pmAuthority: true,
    pmSupervises: true,
  }),
  hitos: charterSchema.pick({ milestones: true }),
  organizaciones: charterSchema.pick({ organizations: true }),
  riesgos: charterSchema.pick({ risks: true }),
  presupuesto: charterSchema.pick({
    totalBudget: true,
    sponsorName: true,
    sponsorCompany: true,
    sponsorPosition: true,
    sponsorDate: true,
  }),
};
