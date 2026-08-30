import { describe, expect, it } from 'vitest';
import { hasDocumentedCommercialUse, verificationStatusLabel } from '@/lib/verification-status';

describe('verification display rules', () => {
  it.each([
    ['verified', '公式資料確認済み'],
    ['partially_verified', '一部の公式資料を確認'],
    ['stale', '再確認が必要'],
    ['unknown', '要確認'],
  ] as const)('labels %s without exposing an internal enum', (status, expected) => {
    expect(verificationStatusLabel(status)).toBe(expected);
  });

  it('includes both yes and conditional in the documented commercial-use filter', () => {
    expect(hasDocumentedCommercialUse({ commercialUse: 'yes' })).toBe(true);
    expect(hasDocumentedCommercialUse({ commercialUse: 'conditional' })).toBe(true);
    expect(hasDocumentedCommercialUse({ commercialUse: 'unknown' })).toBe(false);
    expect(hasDocumentedCommercialUse({ commercialUse: 'no' })).toBe(false);
  });
});
