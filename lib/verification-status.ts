import type { Service } from '@/lib/schema';

export type VerificationStatus = Service['verificationStatus'];

const verificationLabels: Record<VerificationStatus, string> = {
  verified: '公式資料確認済み',
  partially_verified: '一部の公式資料を確認',
  stale: '再確認が必要',
  unknown: '要確認',
};

export function verificationStatusLabel(status: VerificationStatus) {
  return verificationLabels[status];
}

export function hasDocumentedCommercialUse(service: Pick<Service, 'commercialUse'>) {
  return service.commercialUse === 'yes' || service.commercialUse === 'conditional';
}
