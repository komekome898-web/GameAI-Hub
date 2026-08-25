import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_CONSENT_KEY, AnalyticsConsent, consentBootstrap } from '@/components/AnalyticsConsent';
import { googleAnalyticsInit, measurementId } from '@/components/GoogleAnalytics';

type TestWindow = Window & typeof globalThis & { gtag?: ReturnType<typeof vi.fn>; dataLayer?: unknown[] };

beforeEach(() => { window.localStorage.clear(); delete (window as TestWindow).gtag; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('analytics consent', () => {
  it('defaults every storage category to denied before analytics config', () => {
    expect(consentBootstrap).toContain("analytics_storage: 'denied'");
    expect(consentBootstrap).toContain("ad_storage: 'denied'");
    expect(consentBootstrap).toContain("ad_user_data: 'denied'");
    expect(consentBootstrap).toContain("ad_personalization: 'denied'");
    expect(consentBootstrap.indexOf("'default'")).toBeLessThan(consentBootstrap.indexOf("'update'"));
  });

  it('persists acceptance while granting analytics only', async () => {
    const gtag = vi.fn(); (window as TestWindow).gtag = gtag;
    render(<AnalyticsConsent />);
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: '解析を許可する' }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('accepted');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /解析設定を変更/ }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
  });

  it('persists rejection and never grants advertising consent', async () => {
    const gtag = vi.fn(); (window as TestWindow).gtag = gtag;
    render(<AnalyticsConsent />);
    fireEvent.click(await screen.findByRole('button', { name: '拒否する' }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('rejected');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    });
  });

  it('does not reopen on a later render until the settings control is used', async () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'rejected');
    render(<AnalyticsConsent />);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: /解析設定を変更/ }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
  });

  it('keeps the fixed measurement ID and production config behavior', () => {
    expect(measurementId).toBe('G-B9Q283QVER');
    expect(googleAnalyticsInit).toContain("gtag('config', 'G-B9Q283QVER')");
  });
});
