import fs from 'node:fs';
import path from 'node:path';
import { assertAffiliateStatus, assertHttpsAffiliateUrl } from './affiliate-validation';

type AffiliateStatus='active'|'pending'|'rejected'|'inactive'|'unknown';
type AffiliateProgram={status:AffiliateStatus;affiliateUrl:string|null;network:string|null;approvedAt:string|null};
type Service={slug:string;affiliateUrl:string|null;affiliateAvailable:'yes'|'no'|'unknown';[key:string]:unknown};

const root=process.cwd();
const servicesPath=path.join(root,'data/services.json');
const registryPath=path.join(root,'data/affiliate-programs.json');
const services=JSON.parse(fs.readFileSync(servicesPath,'utf8')) as Service[];
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8')) as Record<string,AffiliateProgram>;

// Validate the complete registry before mutating services, so malformed state fails closed.
for(const [slug,program] of Object.entries(registry)){
  assertAffiliateStatus(program.status);
  if(program.status==='active'){
    if(!program.affiliateUrl) throw new Error(`${slug}: active affiliate requires affiliateUrl`);
    assertHttpsAffiliateUrl(program.affiliateUrl);
  }else if(program.affiliateUrl) throw new Error(`${slug}: inactive affiliate must not retain URL`);
}

for(const service of services){
  const program=registry[service.slug];
  if(!program) throw new Error(`${service.slug}: missing from data/affiliate-programs.json`);
  if(program.status==='active'){
    if(!program.affiliateUrl) throw new Error(`${service.slug}: active affiliate requires affiliateUrl`);
    service.affiliateUrl=program.affiliateUrl;
    service.affiliateAvailable='yes';
  }else{
    service.affiliateUrl=null;
    service.affiliateAvailable=program.status==='rejected'||program.status==='inactive'?'no':'unknown';
  }
}

fs.writeFileSync(servicesPath,`${JSON.stringify(services,null,2)}\n`);
console.log(`Synced affiliate state for ${services.length} services`);
