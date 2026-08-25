export const ANALYTICS_CONSENT_KEY = 'gameai:analytics-consent:v1';
export type AnalyticsConsentChoice = 'accepted' | 'rejected';

export function hasAnalyticsConsent(storage: Pick<Storage, 'getItem'> | undefined = typeof window === 'undefined' ? undefined : window.localStorage) {
  if (!storage) return false;
  try { return storage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'; }
  catch { return false; }
}
