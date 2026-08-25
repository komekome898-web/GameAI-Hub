import fs from 'node:fs';
import path from 'node:path';

type AffiliateStatus='active'|'pending'|'rejected'|'inactive'|'unknown';
type AffiliateProgram={status:AffiliateStatus;affiliateUrl:string|null;network:string|null;approvedAt:string|null};

const slug=process.env.AFFILIATE_SERVICE?.trim();
const status=(process.env.AFFILIATE_STATUS?.trim()||'active') as AffiliateStatus;
const url=(process.env.AFFILIATE_URL?.trim()||'');
const network=(process.env.AFFILIATE_NETWORK?.trim()||'');
const approvedAt=(process.env.AFFILIATE_APPROVED_AT?.trim()||'');
const validStatuses=new Set<AffiliateStatus>(['active','pending','rejected','inactive','unknown']);
if(!slug) throw new Error('AFFILIATE_SERVICE is required');
if(!validStatuses.has(status)) throw new Error(`Invalid AFFILIATE_STATUS: ${status}`);
if(status==='active'&&!url) throw new Error('AFFILIATE_URL is required when status=active');
if(url){const parsed=new URL(url);if(parsed.protocol!=='https:')throw new Error('Affiliate URL must use https');}
if(approvedAt&&!/^\d{4}-\d{2}-\d{2}$/.test(approvedAt))throw new Error('AFFILIATE_APPROVED_AT must be YYYY-MM-DD');

const registryPath=path.join(process.cwd(),'data/affiliate-programs.json');
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8')) as Record<string,AffiliateProgram>;
if(!registry[slug]) throw new Error(`${slug}: not present in affiliate registry`);
registry[slug]={
  status,
  affiliateUrl:status==='active'?url:null,
  network:network||registry[slug].network||null,
  approvedAt:status==='active'?(approvedAt||new Date().toISOString().slice(0,10)):null
};
fs.writeFileSync(registryPath,`${JSON.stringify(registry,null,2)}\n`);
console.log(`Updated ${slug}: ${status}`);
