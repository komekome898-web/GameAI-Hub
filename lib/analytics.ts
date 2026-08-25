export type EventName='page_view'|'tool_view'|'compare_start'|'compare_view'|'outbound_click'|'affiliate_click'|'calculator_start'|'calculator_complete'|'diagnosis_start'|'diagnosis_complete';
export type EventProperties={service?:string;page?:string;placement?:string;services?:string[];[key:string]:string|string[]|number|boolean|undefined};
export function track(name:EventName,properties:EventProperties={}){if(typeof window==='undefined')return;window.dispatchEvent(new CustomEvent('gameai:event',{detail:{name,properties}}));if(process.env.NODE_ENV!=='production')console.debug('[GameAI analytics]',name,properties);}
export function buildSubId(service:string,page:string,placement:string){return [service,page,placement].map(v=>v.replace(/[^a-z0-9_-]/gi,'-')).join('__').slice(0,100);}
