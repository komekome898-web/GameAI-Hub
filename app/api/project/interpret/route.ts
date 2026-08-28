import { z } from 'zod';
import { interpretWithFallback } from '@/lib/project/providers';

const RequestSchema=z.object({idea:z.string().trim().min(1).max(1200)}).strict();
export async function POST(request:Request){
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return Response.json({error:'invalid_request'},{status:415});
  const length=Number(request.headers.get('content-length')??0); if(length>5000)return Response.json({error:'invalid_request'},{status:413});
  let input:unknown; try{input=await request.json();}catch{return Response.json({error:'invalid_request'},{status:400});}
  const parsed=RequestSchema.safeParse(input); if(!parsed.success)return Response.json({error:'invalid_request'},{status:400});
  return Response.json(await interpretWithFallback(parsed.data.idea),{headers:{'Cache-Control':'no-store'}});
}
