import { ProjectBriefSchema, type ProjectBrief } from './types';

// A 1,200-character Japanese idea expands under percent encoding. Keep the
// validated upper bound large enough for an encode/decode round trip while
// still rejecting unbounded public input.
const MAX_STATE_LENGTH=20000;
export function encodeProjectState(brief:ProjectBrief):string {
  const value=ProjectBriefSchema.parse(brief);
  // Raw free text must never enter page_location/referrers or analytics via a
  // shared query. A shared plan contains confirmed structured conditions only.
  const safe:Omit<ProjectBrief,'idea'>={...value};
  delete (safe as Partial<ProjectBrief>).idea;
  return new URLSearchParams({v:'1',p:JSON.stringify(safe)}).toString();
}
export function decodeProjectState(raw:string|URLSearchParams):ProjectBrief|null {
  const source=typeof raw==='string'?raw:raw.toString();
  if(source.length>MAX_STATE_LENGTH)return null;
  const params=typeof raw==='string'?new URLSearchParams(raw.replace(/^[?#]/,'')):raw;
  if(params.get('v')!=='1')return null;
  const encoded=params.get('p'); if(!encoded)return null;
  try{return ProjectBriefSchema.parse({...JSON.parse(encoded),idea:'共有されたプロジェクト（元の自由文はプライバシー保護のため含まれません）'});}catch{return null;}
}
