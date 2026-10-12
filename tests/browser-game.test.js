// One real full game in the browser (Playwright), driven by the economy playtest bot through all 10 waves.
const {chromium}=require('playwright'),assert=require('assert'),path=require('path');const {STRATS,helpers}=require('./playtest');
const URL='file://'+path.join(__dirname,'../docs/index.html');
(async()=>{const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(URL);await p.keyboard.press('Enter');
 await p.addScriptTag({content:helpers.map(f=>f.toString()).join('\n')+'\nwindow.__bot='+STRATS.economy.toString()+';'});
 const r=await p.evaluate(async()=>{const w=window,G=w.__G(),C=w.__CFG;while(!G.over&&G.t<1500){for(let k=0;k<5;k++)w.__step(0.1);w.__bot(w,G,C);if(Math.floor(G.t)%60===0)await new Promise(r=>requestAnimationFrame(r));}
  return{won:G.won,t:G.t,hp:G.keep.hp,wave:G.wave,kills:G.kills};});
 await p.waitForTimeout(300);console.log(JSON.stringify(r));assert(r.won&&r.wave===10,'bot wins the real game');assert.deepStrictEqual(errs,[]);console.log('browser game test passed');await b.close();})().catch(e=>{console.error(e);process.exit(1);});
