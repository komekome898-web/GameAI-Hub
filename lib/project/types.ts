import { z } from 'zod';

export const projectCapabilities = ['coding','art-2d','assets-3d','animation','voice','music','sfx','npc-dialogue','localization','trailer'] as const;
export const ProjectCapabilitySchema = z.enum(projectCapabilities);
export type ProjectCapability = z.infer<typeof ProjectCapabilitySchema>;

export const projectDetailKinds = ['player-role','setting','core-mechanic','entity','tone','constraint'] as const;
export const ProjectDetailSchema = z.object({
  id: z.string().regex(/^detail-[a-z0-9-]+$/).max(80),
  kind: z.enum(projectDetailKinds),
  text: z.string().trim().min(1).max(80),
  provenance: z.enum(['explicit_text','confirmed']),
  evidence: z.string().trim().max(100).optional(),
});
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;

export const ProjectBriefSchema = z.object({
  idea: z.string().trim().min(1).max(1200),
  genre: z.enum(['rpg','monster-collection','visual-novel','horror','action','puzzle','other','unknown']),
  dimension: z.enum(['2d','3d','unknown']),
  platform: z.enum(['web','mobile','desktop','multi-platform','unknown']),
  engine: z.enum(['unity','unreal','godot','other','undecided','unknown']),
  budget: z.enum(['free','low','flexible','unknown']),
  experience: z.enum(['beginner','intermediate','advanced','unknown']),
  team: z.enum(['solo','small-team','team','unknown']),
  commercialIntent: z.enum(['personal','commercial','undecided','unknown']),
  capabilities: z.array(ProjectCapabilitySchema).max(projectCapabilities.length),
  locale: z.enum(['ja','ja-en','multi','unknown']),
  details: z.array(ProjectDetailSchema).max(20).default([]),
});
export type ProjectBrief = z.infer<typeof ProjectBriefSchema>;

export type FieldProvenance = 'explicit_text' | 'confirmed' | 'unknown';
export type InferredField = { field: keyof ProjectBrief; value: string | string[]; provenance: FieldProvenance; evidence?: string };
export type DetailCandidate = Omit<ProjectDetail,'provenance'> & { provenance:'explicit_text' };
export type Interpretation = { idea: string; fields: InferredField[]; detailCandidates: DetailCandidate[]; unresolved: (keyof ProjectBrief)[]; conflicts: string[] };

export type VerticalSliceItem = { id:string; title:string; why:string; outOfScope:string[]; doneWhen:string[] };
export type PlanTool = {
  serviceSlug:string;
  name:string;
  role:'primary'|'alternative'|'review';
  reason:string;
  inputRefs:string[];
  evidence:string[];
  commercialUse:'yes'|'no'|'conditional'|'unknown'|'not_applicable';
  freePlan:'yes'|'no'|'conditional'|'unknown'|'not_applicable';
  api:'yes'|'no'|'conditional'|'unknown'|'not_applicable';
  engineRelevance:string[];
  limitations:string[];
  unknowns:string[];
  manualChecks:string[];
  lastVerified:string;
  sources:{label:string;url:string;type:'official'|'terms'|'pricing'|'docs'}[];
};
export type PlanPhase = { id:string; title:string; objective:string; deliverables:string[]; toolPath:string[]; tools:PlanTool[]; alternatives:string[]; manualWork:string[]; dependencies:string[]; risks:string[]; doneWhen:string[]; handoff:string };
export type AgentArtifact = { title:string; content:string };
export type ProjectRisk = { id:string; title:string; why:string; mitigation:string; verification:string };
export type PromptArtifact = { id:string; taskId:string; title:string; content:string };
export type BuildChecklistStep = {
  id:string;
  title:string;
  outcome:string;
  why:string;
  substeps:string[];
  tools:PlanTool[];
  usageInstructions:string[];
  prompt:string;
  doneWhen:string[];
};
export type ProjectPlan = {
  version: 1;
  brief: ProjectBrief;
  assumptions: string[];
  unresolved: string[];
  today: string[];
  verticalSlice: VerticalSliceItem[];
  phases: PlanPhase[];
  repositoryStructure: string;
  masterBrief: AgentArtifact;
  firstTask: AgentArtifact;
  agentsStarter: AgentArtifact;
  assetChecklist: string[];
  prompts: PromptArtifact[];
  risks: ProjectRisk[];
  cost: { categories:string[]; note:string };
};
