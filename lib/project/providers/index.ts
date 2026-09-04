import { z } from 'zod';
import { interpretProjectIdea } from '../interpreter';
import { InterpretationSchema, ProjectDetailSchema, type Interpretation } from '../types';
import { cloudflareProviderFromEnv } from './cloudflare';
import type { InterpreterFallbackReason, ProjectInterpreterProvider, ProviderInterpretation } from './types';

const ProviderOutputSchema=z.object({
  fields:z.array(z.object({field:z.enum(['genre','dimension','platform','engine','budget','experience','team','commercialIntent','capabilities','locale']),value:z.union([z.string().max(80),z.array(z.string().max(40)).max(10)]),evidence:z.string().max(100).optional()}).strict()).max(10),
  details:z.array(z.object({kind:z.enum(['player-role','setting','core-loop','core-mechanic','entity','requested-asset','audio-requirement','runtime-ai','tone','constraint']),text:z.string().trim().min(1).max(80),evidence:z.string().max(100).optional()}).strict()).max(20).default([]),
  unresolved:z.array(z.enum(['genre','dimension','platform','engine','budget','experience','team','commercialIntent','capabilities','locale'])).max(10).default([]), conflicts:z.array(z.string().trim().min(1).max(160)).max(10).default([]),
}).strict();
const scalarValues={genre:['rpg','monster-collection','visual-novel','horror','action','puzzle','other'],dimension:['2d','3d'],platform:['web','mobile','desktop','multi-platform'],engine:['unity','unreal','godot','other','undecided'],budget:['free','low','flexible'],experience:['beginner','intermediate','advanced'],team:['solo','small-team','team'],commercialIntent:['personal','commercial','undecided'],locale:['ja','ja-en','multi']} as const;

function validatedInterpretation(idea:string,raw:unknown):Interpretation{
  const parsed=ProviderOutputSchema.parse(raw); const fields:Interpretation['fields']=[];
  const seen=new Set<string>();
  for(const item of parsed.fields){
    if(seen.has(item.field))throw new z.ZodError([]); seen.add(item.field);
    if(item.field==='capabilities'){
      const checked=z.array(z.enum(['coding','art-2d','assets-3d','animation','voice','music','sfx','npc-dialogue','localization','trailer'])).safeParse(item.value);
      if(checked.success&&checked.data.length)fields.push({field:item.field,value:[...new Set(checked.data)],provenance:'explicit_text'});
    }else if(typeof item.value==='string'&&(scalarValues[item.field] as readonly string[]).includes(item.value)) fields.push({field:item.field,value:item.value,provenance:'explicit_text'});
    else throw new z.ZodError([]);
  }
  const unique=new Map(fields.map(item=>[item.field,item]));
  const unsafeContact=/(?:https?:\/\/|\bwww\.|\S+@\S+)/i;
  const details=parsed.details.filter(item=>!unsafeContact.test(item.text)&&!unsafeContact.test(item.evidence??'')).map((item,index)=>ProjectDetailSchema.parse({...item,id:`detail-${item.kind}-ai-${index}`,provenance:'explicit_text'}));
  const known=new Set(unique.keys());
  return InterpretationSchema.parse({idea,fields:[...unique.values()],detailCandidates:details,unresolved:Object.keys(scalarValues).filter(field=>!known.has(field as never)),conflicts:parsed.conflicts.filter(value=>!unsafeContact.test(value))});
}

export async function interpretWithFallback(idea:string,options:{provider?:ProjectInterpreterProvider;timeoutMs?:number}={}):Promise<ProviderInterpretation>{
  const bounded=idea.trim().slice(0,1200); const provider=options.provider??cloudflareProviderFromEnv();
  const fallback=(reason:InterpreterFallbackReason)=>deterministicInterpretation(bounded,reason);
  if(!provider.isReady())return fallback('not_configured');
  const controller=new AbortController(); let rejectTimeout:(reason?:unknown)=>void=()=>{};
  const timeout=new Promise<never>((_,reject)=>{rejectTimeout=reject});
  const timer=setTimeout(()=>{controller.abort();rejectTimeout(new DOMException('Timed out','TimeoutError'));},options.timeoutMs??6000);
  try{
    const providerWork=provider.interpret(bounded,controller.signal); providerWork.catch(()=>{});
    const interpretation=validatedInterpretation(bounded,await Promise.race([providerWork,timeout]));
    const local=interpretProjectIdea(bounded);
    const detailKeys=new Set(interpretation.detailCandidates.map(item=>`${item.kind}:${item.text.normalize('NFKC').toLocaleLowerCase('ja-JP')}`));
    for(const detail of local.detailCandidates){const key=`${detail.kind}:${detail.text.normalize('NFKC').toLocaleLowerCase('ja-JP')}`;if(!detailKeys.has(key)){interpretation.detailCandidates.push(detail);detailKeys.add(key);}}
    const providerFields=new Set(interpretation.fields.map(item=>String(item.field)));
    const conflicted=new Set(local.conflicts.map(item=>item.split(':')[0]));
    const comparable=(value:unknown)=>Array.isArray(value)?JSON.stringify([...value].sort()):JSON.stringify(value);
    for(const localField of local.fields){const remote=interpretation.fields.find(item=>item.field===localField.field);if(remote&&comparable(remote.value)!==comparable(localField.value))conflicted.add(String(localField.field));else if(!remote&&!conflicted.has(String(localField.field)))interpretation.fields.push(localField);}
    if(conflicted.size){interpretation.fields=interpretation.fields.filter(item=>!conflicted.has(String(item.field)));interpretation.unresolved=[...new Set([...interpretation.unresolved,...conflicted])] as Interpretation['unresolved'];interpretation.conflicts=[...new Set([...interpretation.conflicts,...local.conflicts,...[...conflicted].map(field=>`${field}: 入力の明示条件とAI候補が一致しません`)])];}
    const localFields=new Map(local.fields.map(item=>[String(item.field),item]));
    const confirmationRequired=interpretation.fields.filter(item=>providerFields.has(String(item.field))&&comparable(localFields.get(String(item.field))?.value)!==comparable(item.value)).map(item=>item.field);
    return {interpretation,status:{providerName:provider.providerName,mode:'provider'},confirmationRequired};
  }catch(error){return fallback(error instanceof z.ZodError||error instanceof SyntaxError?'invalid_output':controller.signal.aborted?'timeout':'provider_error');}
  finally{clearTimeout(timer);}
}
export function deterministicInterpretation(idea:string,reason:InterpreterFallbackReason):ProviderInterpretation{return {interpretation:interpretProjectIdea(idea.trim().slice(0,1200)),status:{providerName:'ローカル判定',mode:'deterministic',fallbackReason:reason},confirmationRequired:[]};}
export type { ProjectInterpreterProvider, ProviderInterpretation } from './types';
