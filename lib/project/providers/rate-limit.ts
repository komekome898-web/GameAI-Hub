import 'server-only';

type Entry={count:number;resetAt:number};
const windowMs=60_000;
const maximum=10;
let entry:Entry|undefined;

/**
 * Best-effort anonymous per-instance global guard. It never reads or retains
 * IP addresses, identifiers, or ideas. A durable Vercel/edge global limit is
 * still required; this guard ensures each hot instance fails closed.
 */
export function consumeInterpretationQuota(now=Date.now()){
  if(!entry||entry.resetAt<=now){entry={count:1,resetAt:now+windowMs};return true;}
  if(entry.count>=maximum)return false;
  entry.count+=1; return true;
}

export function resetInterpretationQuotaForTests(){entry=undefined;}
