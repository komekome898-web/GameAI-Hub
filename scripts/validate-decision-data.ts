import { getServices } from '../lib/services';
import { productionStageIds } from '../lib/domain';
import { recommendationRules } from '../data/recommendation-rules';
import { stackTemplates } from '../data/stack-templates';
const serviceSlugs=new Set(getServices().map(({slug})=>slug));
const unique=(xs:string[],label:string)=>{if(new Set(xs).size!==xs.length)throw new Error(`Duplicate ${label}`)};
unique(stackTemplates.map(({slug})=>slug),'stack slug');unique(recommendationRules.map(({id})=>id),'rule id');unique([...productionStageIds],'stage id');
for(const stack of stackTemplates){unique(stack.workflow,`${stack.slug} workflow stage`);for(const tool of stack.tools){if(!stack.workflow.includes(tool.stage))throw new Error(`${stack.slug}: tool stage outside workflow`);if(!serviceSlugs.has(tool.serviceSlug))throw new Error(`${stack.slug}: unknown service ${tool.serviceSlug}`);for(const alt of tool.alternativeSlugs){if(!serviceSlugs.has(alt)||alt===tool.serviceSlug)throw new Error(`${stack.slug}: invalid alternative ${alt}`)}}}
for(const rule of recommendationRules)if(!serviceSlugs.has(rule.serviceSlug))throw new Error(`${rule.id}: unknown service`);
console.log(`Validated ${stackTemplates.length} stacks and ${recommendationRules.length} recommendation rules`);
