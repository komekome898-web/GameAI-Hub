import registryData from '../data/affiliate-programs.json';
import { getServices } from '../lib/services';
import { assertAffiliateSlug, assertAffiliateStatus, assertApprovalDate, assertHttpsAffiliateUrl } from './affiliate-validation';

type RegistryProgram={status:string;affiliateUrl:string|null;network:string|null;approvedAt:string|null};
const registry=registryData as Record<string,RegistryProgram>;
const services=getServices();
for(const [slug,program] of Object.entries(registry)){
  assertAffiliateSlug(slug);
  assertAffiliateStatus(program.status);
  if(program.approvedAt)assertApprovalDate(program.approvedAt);
  if(program.status==='active'){
    if(!program.affiliateUrl)throw new Error(`${slug}: active affiliate requires URL`);
    assertHttpsAffiliateUrl(program.affiliateUrl);
    if(!program.approvedAt)throw new Error(`${slug}: active affiliate requires approval date`);
  }else if(program.affiliateUrl)throw new Error(`${slug}: inactive affiliate must not retain URL`);
}
for(const s of services){
  const program=registry[s.slug];
  if(!program)throw new Error(`${s.slug}: missing affiliate registry entry`);
  const expectedAvailable=program.status==='active'?'yes':program.status==='inactive'||program.status==='rejected'?'no':'unknown';
  if(s.affiliateAvailable!==expectedAvailable)throw new Error(`${s.slug}: affiliateAvailable does not match registry status`);
  if(s.affiliateUrl!==program.affiliateUrl)throw new Error(`${s.slug}: affiliateUrl does not exactly match registry`);
  if(s.affiliateUrl){
    if(s.affiliateAvailable!=='yes')throw new Error(`${s.slug}: URL present without availability`);
    if(!s.sources.some(x=>x.type==='terms'))throw new Error(`${s.slug}: affiliate requires terms source`);
  }
}
console.log('Affiliate links are centrally managed and consistent');
