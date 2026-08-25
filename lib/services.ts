import raw from '@/data/services.json';
import { serviceSchema, type Service } from './schema';
const parsed=serviceSchema.array().parse(raw);
export function getServices():Service[]{return parsed;}
export function getService(slug:string){return parsed.find((item)=>item.slug===slug);}
export function getOutboundUrl(service:Service){return service.affiliateUrl ?? service.officialUrl;}
export function getAlternatives(service:Service){return service.alternatives.map(getService).filter((v):v is Service=>Boolean(v));}
