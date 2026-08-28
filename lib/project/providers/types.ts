import type { Interpretation } from '../types';

export type InterpreterFallbackReason = 'not_configured'|'timeout'|'provider_error'|'invalid_output'|'rate_limited';
export type InterpreterProviderStatus = {
  providerName:string;
  mode:'provider'|'deterministic';
  fallbackReason?:InterpreterFallbackReason;
};
export type ProviderInterpretation = { interpretation:Interpretation; status:InterpreterProviderStatus; confirmationRequired:string[] };

export interface ProjectInterpreterProvider {
  readonly providerName:string;
  isReady():boolean;
  interpret(idea:string,signal:AbortSignal):Promise<unknown>;
}
