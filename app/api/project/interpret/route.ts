import { z } from 'zod';
import { deterministicInterpretation,interpretWithFallback } from '@/lib/project/providers';
import { consumeInterpretationQuota } from '@/lib/project/providers/rate-limit';
import { externalInterpreterReady } from '@/lib/project/providers/cloudflare';

const RequestSchema=z.object({idea:z.string().trim().min(1).max(1200)}).strict();
async function readBoundedBody(request:Request,limit:number){
  if(!request.body)return '';
  const reader=request.body.getReader();const decoder=new TextDecoder();let size=0;let body='';
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();return null;}body+=decoder.decode(value,{stream:true});}
  return body+decoder.decode();
}
export async function POST(request:Request){
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return Response.json({error:'invalid_request'},{status:415});
  const length=Number(request.headers.get('content-length')??0); if(length>5000)return Response.json({error:'invalid_request'},{status:413});
  let input:unknown; try{const body=await readBoundedBody(request,5000);if(body===null)return Response.json({error:'invalid_request'},{status:413});input=JSON.parse(body);}catch{return Response.json({error:'invalid_request'},{status:400});}
  const parsed=RequestSchema.safeParse(input); if(!parsed.success)return Response.json({error:'invalid_request'},{status:400});
  if(externalInterpreterReady()&&!consumeInterpretationQuota())return Response.json(deterministicInterpretation(parsed.data.idea,'rate_limited'),{headers:{'Cache-Control':'no-store','X-RateLimit-Policy':'10;w=60'}});
  return Response.json(await interpretWithFallback(parsed.data.idea),{headers:{'Cache-Control':'no-store'}});
}
