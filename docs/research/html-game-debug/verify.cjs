const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require('@playwright/test');
const root = __dirname;
const shots = path.join(root,'screenshots');
fs.mkdirSync(shots,{recursive:true});
const server = http.createServer((req,res)=>{
  if (req.url === '/favicon.ico') {res.writeHead(204);res.end();return;}
  const file = path.join(root,'fixtures',path.basename(req.url.split('?')[0]));
  if (!file.endsWith('.html') || !fs.existsSync(file)) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(file));
});
const results = {date:new Date().toISOString(),mode:'headless real Chromium; local HTTP; normal clicks only',viewports:[],cases:[]};
async function state(page) {
  return page.evaluate(()=>({player:document.querySelector('#playerHp').textContent,enemy:document.querySelector('#enemyHp').textContent,name:document.querySelector('#enemyName').textContent,message:document.querySelector('#message').textContent,disabled:document.querySelector('#fight').disabled,mainVisible:!!document.querySelector('main').getBoundingClientRect().height,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
}
function expected(s,p,e,disabled=false) {assert.equal(s.player,String(p));assert.equal(s.enemy,String(e));assert.equal(s.disabled,disabled);}
async function shot(page,id,label) {await page.screenshot({path:path.join(shots,`${id}-${label}.png`),fullPage:true});}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:process.env.BUILDIARY_CHROMIUM || '/usr/bin/chromium'}); results.browser=browser.version();
 try {
  for (const width of [1280,375,320]) {
   results.viewports.push({width,height:800});
   for (const file of ['original','syntax-broken','syntax-repaired','selector-broken','selector-repaired','reset-broken','reset-repaired']) {
    const page=await browser.newPage({viewport:{width,height:800}});
    const errors=[],consoleErrors=[];
    page.on('pageerror',e=>errors.push({name:e.name,message:e.message}));
    page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
    const rec={file,width,states:[],errors,consoleErrors}; results.cases.push(rec);
    const capture=async(label)=>{const s=await state(page);rec.states.push({label,...s});return s;};
    await page.goto(`http://127.0.0.1:${server.address().port}/${file}.html`);
    await page.waitForLoadState('load');
    const initial=await capture('initial');expected(initial,24,18);assert(initial.mainVisible);
    await shot(page,`${file}-${width}`,'initial');
    if (file==='syntax-broken'||file==='selector-broken') {
      assert.equal(errors.length,1);
      assert.equal(errors[0].name,file==='syntax-broken'?'SyntaxError':'TypeError');
      if(file==='syntax-broken')assert.equal(initial.name,'');else assert.equal(initial.name,'スライム');
      if(file==='selector-broken')assert.equal(await page.evaluate(()=>document.querySelector('#attack')),null);
      await page.locator('#fight').click();assert.deepEqual(await state(page),initial);
      await page.locator('#reset').click();assert.deepEqual(await state(page),initial);
      await capture('clicks-have-no-effect');
    } else {
      for(let round=1;round<=2;round++) {
        for(const [i,p,e,d] of [[1,20,12,false],[2,16,6,false],[3,16,0,true]]) {
          await page.locator('#fight').click();expected(await capture(`round-${round}-attack-${i}`),p,e,d);
        }
        assert.equal(await page.locator('#message').textContent(),'スライムに勝った！');
        // A normal physical mouse click on the disabled control must not dispatch an attack.
        const victory=await state(page);const box=await page.locator('#fight').boundingBox();
        await page.mouse.click(box.x+box.width/2,box.y+box.height/2);assert.deepEqual(await state(page),victory);
        await shot(page,`${file}-${width}`,`victory-${round}`);
        await page.locator('#reset').click();const reset=await capture(`reset-${round}`);
        expected(reset,24,18,file==='reset-broken');assert.equal(reset.message,'たたかうを押そう');
        if(file==='reset-broken') {
          await shot(page,`${file}-${width}`,'replay-blocked');
          const b=await page.locator('#fight').boundingBox();await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
          assert.deepEqual(await state(page),reset);await capture('replay-click-has-no-effect');break;
        }
      }
      assert.equal(errors.length,0);assert.equal(consoleErrors.length,0);
    }
    const count=errors.length;await page.reload();const reloaded=await capture('reload');expected(reloaded,24,18);
    if(file.endsWith('-broken')&&file!=='reset-broken')assert.equal(errors.length,count+1);
    else {assert.equal(errors.length,0);assert.equal(reloaded.name,'スライム');await page.locator('#fight').click();expected(await capture('reload-first-attack'),20,12);}
    rec.pass=true;await page.close();
   }
  }
  results.pass=true;
 } finally {await browser.close();server.close();fs.writeFileSync(path.join(root,'results.json'),JSON.stringify(results,null,2)+'\n');}
 console.log(`PASS: ${results.cases.length} browser cases; Chromium ${results.browser}`);
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
