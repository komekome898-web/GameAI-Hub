import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
for (const c of [{n:'desktop',w:1280,h:900},{n:'375',w:375,h:812},{n:'320',w:320,h:700}]) {
 const p=await browser.newPage({viewport:{width:c.w,height:c.h},deviceScaleFactor:1});
 await p.goto('http://localhost:3000/articles/ai-browser-game-how-to',{waitUntil:'networkidle'});
 console.log(c.n, await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,title:document.title,h1:document.querySelector('h1')?.textContent, bodyH:document.body.scrollHeight})));
 await p.screenshot({path:`/tmp/article-${c.n}.png`,fullPage:true});
 await p.locator('text=AIへ最初のpromptを送る').first().scrollIntoViewIfNeeded().catch(()=>{});
 await p.screenshot({path:`/tmp/article-${c.n}-prompt.png`});
}
const p=await browser.newPage({viewport:{width:320,height:700},deviceScaleFactor:1});
await p.goto('http://localhost:3000/articles/ai-browser-game-how-to',{waitUntil:'networkidle'});
await p.addStyleTag({content:'html { zoom: 2; }'});
console.log('zoom2',await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bodyH:document.body.scrollHeight})));
await p.screenshot({path:'/tmp/article-320-zoom2-top.png'});
for(const txt of ['AIへ最初のpromptを送る','AI生成HTMLを貼って確認','掲載完成例へ戻って、敵名を1か所だけ変える','壊れたら戻す','Project Generatorへ進む']) { const l=p.getByText(txt,{exact:false}).first(); if(await l.count()){await l.scrollIntoViewIfNeeded(); await p.screenshot({path:'/tmp/zoom-'+txt.slice(0,5).replaceAll('/','-')+'.png'});} }
await browser.close();
