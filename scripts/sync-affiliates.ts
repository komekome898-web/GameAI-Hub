import fs from 'node:fs';
import path from 'node:path';

type AffiliateStatus='active'|'pending'|'rejected'|'inactive'|'unknown';
type AffiliateProgram={status:AffiliateStatus;affiliateUrl:string|null;network:string|null;approvedAt:string|null};
type Service={slug:string;affiliateUrl:string|null;affiliateAvailable:'yes'|'no'|'unknown';[key:string]:unknown};

const root=process.cwd();
const servicesPath=path.join(root,'data/services.json');
const registryPath=path.join(root,'data/affiliate-programs.json');
const services=JSON.parse(fs.readFileSync(servicesPath,'utf8')) as Service[];
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8')) as Record<string,AffiliateProgram>;

for(const service of services){
  const program=registry[service.slug];
  if(!program) throw new Error(`${service.slug}: missing from data/affiliate-programs.json`);
  if(program.status==='active'){
    if(!program.affiliateUrl) throw new Error(`${service.slug}: active affiliate requires affiliateUrl`);
    new URL(program.affiliateUrl);
    service.affiliateUrl=program.affiliateUrl;
    service.affiliateAvailable='yes';
  }else{
    service.affiliateUrl=null;
    service.affiliateAvailable=program.status==='rejected'||program.status==='inactive'?'no':'unknown';
  }
}

fs.writeFileSync(servicesPath,`${JSON.stringify(services,null,2)}\n`);
console.log(`Synced affiliate state for ${services.length} services`);
