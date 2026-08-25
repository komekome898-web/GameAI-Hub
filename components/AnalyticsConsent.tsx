'use client';

import { useEffect, useState } from 'react';
import { ANALYTICS_CONSENT_KEY, type AnalyticsConsentChoice } from '@/lib/analytics-consent';

export { ANALYTICS_CONSENT_KEY } from '@/lib/analytics-consent';

type ConsentGtag = (command: 'consent', action: 'default' | 'update', settings: Record<string, string | number>) => void;

const deniedConsent = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const;

export const consentBootstrap = `window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
try {
  if (window.localStorage.getItem('${ANALYTICS_CONSENT_KEY}') === 'accepted') {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
} catch (error) { /* Storage can be unavailable; default denial remains in force. */ }`;

function updateConsent(choice: AnalyticsConsentChoice) {
  const target = window as typeof window & { gtag?: ConsentGtag; dataLayer?: unknown[] };
  const settings = { ...deniedConsent, analytics_storage: choice === 'accepted' ? 'granted' : 'denied' };
  if (target.gtag) target.gtag('consent', 'update', settings);
  else {
    target.dataLayer = target.dataLayer || [];
    target.dataLayer.push(['consent', 'update', settings]);
  }
}

export function AnalyticsConsent() {
  const [choice, setChoice] = useState<AnalyticsConsentChoice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: AnalyticsConsentChoice | null = null;
    try {
      const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
      if (value === 'accepted' || value === 'rejected') stored = value;
    } catch { /* Default denial is deliberately retained when storage is unavailable. */ }
    // Browser storage is intentionally read after hydration; the inline bootstrap
    // has already enforced denial before this preference UI becomes interactive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(stored);
    setOpen(stored === null);
  }, []);

  function choose(nextChoice: AnalyticsConsentChoice) {
    try { window.localStorage.setItem(ANALYTICS_CONSENT_KEY, nextChoice); } catch { /* Consent still applies for this page. */ }
    updateConsent(nextChoice);
    setChoice(nextChoice);
    setOpen(false);
  }

  return <>
    <script id="analytics-consent-default" dangerouslySetInnerHTML={{ __html: consentBootstrap }} />
    {open && <section className="consent-banner" role="dialog" aria-modal="false" aria-labelledby="consent-title" aria-describedby="consent-description">
      <div>
        <strong id="consent-title">アクセス解析の設定</strong>
        <p id="consent-description">サイト改善のためGoogle Analyticsを利用します。許可するまで解析用ストレージは使用せず、広告用ストレージは常に無効です。詳しくは<a href="/privacy/">プライバシーポリシー</a>をご覧ください。</p>
      </div>
      <div className="consent-actions">
        <button type="button" className="button secondary" onClick={() => choose('rejected')}>拒否する</button>
        <button type="button" className="button" onClick={() => choose('accepted')}>解析を許可する</button>
      </div>
    </section>}
    <button type="button" className="analytics-settings" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      解析設定を変更{choice ? `（現在: ${choice === 'accepted' ? '許可' : '拒否'}）` : ''}
    </button>
  </>;
}
