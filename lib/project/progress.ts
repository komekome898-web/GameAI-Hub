import type { ProjectPlan } from './types';

function canonical(value:unknown):string {
  if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;
  if(value&&typeof value==='object')return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value);
}

export function projectProgressIdentity(plan:ProjectPlan):string {
  const {idea: _unconfirmedProse, details, capabilities, ...fields}=plan.brief;
  void _unconfirmedProse;
  return canonical({
    version:plan.version,
    brief:{
      ...fields,
      capabilities:[...capabilities].sort(),
      details:details.map(({kind,text})=>({kind,text})).sort((a,b)=>`${a.kind}:${a.text}`.localeCompare(`${b.kind}:${b.text}`)),
    },
    slice:plan.verticalSlice.map(item=>item.id),
    phases:plan.phases.map(phase=>phase.id),
  });
}

/** SHA-256 keeps approved project details out of the localStorage key itself. */
export async function projectProgressKey(plan:ProjectPlan):Promise<string> {
  const bytes=new TextEncoder().encode(projectProgressIdentity(plan));
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  const hex=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
  return `gameai:build-progress:v2:${hex}`;
}
