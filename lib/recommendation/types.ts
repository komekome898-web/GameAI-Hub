import type { ProductionStageId, ProjectInput } from '@/lib/domain';
import type { Service } from '@/lib/schema';

export type StageRequirement = 'required' | 'optional' | 'excluded';

export interface ToolRecommendation {
  service: Service;
  reason: string;
  evidence: string[];
  limitations: string[];
  unknowns: string[];
  manualChecks: string[];
  costVisibility: string;
  fitScore: number;
  fitBand: 'strong' | 'good' | 'review';
  inputEffects: string[];
  positiveMatches: string[];
  hardExclusions: string[];
  warnings: string[];
}

export interface StageRecommendation {
  stage: ProductionStageId;
  requirement: StageRequirement;
  primary: ToolRecommendation | null;
  alternatives: ToolRecommendation[];
  /** Candidates blocked from being a recommendation until a hard constraint is checked. */
  reviewCandidates: ToolRecommendation[];
  manualFallback: string | null;
  nextAction: string;
  deliverable: string;
  acceptanceCriteria: string[];
  handoff: string;
  manualTasks: string[];
}

export interface RecommendationResult {
  input: ProjectInput;
  stages: StageRecommendation[];
  productionOrder: ProductionStageId[];
  costSummary: {
    freePlanConfirmed: number;
    freePlanUnknown: number;
    pricingAmountKnown: number;
    pricingAmountUnknown: number;
    reviewFreePlanConfirmed: number;
    reviewFreePlanUnknown: number;
    reviewPricingAmountKnown: number;
    reviewPricingAmountUnknown: number;
    note: string;
  };
  projectGuidance: string[];
}
