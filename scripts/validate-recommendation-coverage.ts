import { recommendationRules } from '../data/recommendation-rules';
import { defaultProjectInput, productionStageIds, type ProjectInput } from '../lib/domain';
import { recommendProject } from '../lib/recommendation';

const scenarios: Array<{ name: string; input: ProjectInput }> = [
  { name:'beginner-free-2d-rpg', input:{...defaultProjectInput,gameType:'2d',genre:'rpg',budget:'free',experience:'beginner',assetRequirements:['2d-assets']} },
  { name:'monster-collection-mobile', input:{...defaultProjectInput,gameType:'mobile',genre:'monster-collection',platform:'mobile',assetRequirements:['2d-assets','animation']} },
  { name:'visual-novel-voice-heavy', input:{...defaultProjectInput,genre:'visual-novel',voiceRequirement:'required',assetRequirements:['2d-assets']} },
  { name:'3d-indie-steam', input:{...defaultProjectInput,gameType:'3d',platform:'desktop',budget:'low',assetRequirements:['3d-assets','animation']} },
  { name:'browser-code-focused', input:{...defaultProjectInput,gameType:'browser',platform:'web',codingPreference:'code-first',integrationImportance:'high'} },
  { name:'quality-first-flexible', input:{...defaultProjectInput,budget:'flexible',experience:'advanced',voiceRequirement:'optional',musicRequirement:'optional'} },
  { name:'no-voice-no-3d', input:{...defaultProjectInput,gameType:'2d',voiceRequirement:'none',assetRequirements:[]} },
  { name:'unknown-pricing-commercial', input:{...defaultProjectInput,codingPreference:'no-code',commercialIntent:'commercial',budget:'free'} },
];

const fail=(message:string):never=>{throw new Error(message)};
const knownReasons=new Set(recommendationRules.map(rule=>rule.reasonTemplate));
for(const {name,input} of scenarios){
  const result=recommendProject(input);
  if(result.stages.length!==productionStageIds.length)fail(`${name}: not every production stage is represented`);
  if(new Set(result.productionOrder).size!==result.productionOrder.length)fail(`${name}: duplicate stage in production order`);
  for(const stage of result.stages){
    if(stage.requirement==='required'&&!stage.primary&&!stage.reviewCandidates.length&&!stage.manualFallback)fail(`${name}/${stage.stage}: required stage has no decision or explicit manual rationale`);
    if(stage.requirement==='excluded'&&(stage.primary||stage.alternatives.length||stage.reviewCandidates.length))fail(`${name}/${stage.stage}: excluded stage contains a tool`);
    const tools=[...(stage.primary?[stage.primary]:[]),...stage.alternatives,...stage.reviewCandidates];
    const slugs=tools.map(tool=>tool.service.slug);
    if(new Set(slugs).size!==slugs.length)fail(`${name}/${stage.stage}: duplicate tool slug`);
    for(const decision of tools){
      if(!decision.service.lastVerified)fail(`${name}/${stage.stage}/${decision.service.slug}: missing verification date`);
      if(!decision.service.sources.length)fail(`${name}/${stage.stage}/${decision.service.slug}: missing official source`);
      if(!decision.service.sources.every(source=>source.url&&source.label))fail(`${name}/${stage.stage}/${decision.service.slug}: incomplete source`);
      const isPrimary=stage.primary?.service.slug===decision.service.slug;
      if(isPrimary&&!knownReasons.has(decision.reason))fail(`${name}/${stage.stage}/${decision.service.slug}: reason is not from validated recommendation rules`);
      if(!decision.manualChecks.some(check=>check.includes(decision.service.lastVerified)))fail(`${name}/${stage.stage}/${decision.service.slug}: decision omits source freshness check`);
      if(decision.costVisibility!==decision.service.pricing)fail(`${name}/${stage.stage}/${decision.service.slug}: unsupported pricing transformation`);
      if(decision.limitations.some(item=>!decision.service.weaknesses.includes(item)))fail(`${name}/${stage.stage}/${decision.service.slug}: unsupported limitation`);
    }
  }
  const voice=result.stages.find(stage=>stage.stage==='voice');
  if(input.voiceRequirement==='none'&&voice?.requirement!=='excluded')fail(`${name}: no-voice invariant failed`);
  const threeD=result.stages.find(stage=>stage.stage==='3d');
  if(input.gameType!=='3d'&&!input.assetRequirements.includes('3d-assets')&&threeD?.requirement!=='excluded')fail(`${name}: no-3D invariant failed`);
  if(result.costSummary.pricingAmountKnown!==0||!result.costSummary.note.includes('合計額は算出しません'))fail(`${name}: unsupported numeric total exposed`);
}
console.log(`Validated recommendation coverage across ${scenarios.length} required user journeys`);
