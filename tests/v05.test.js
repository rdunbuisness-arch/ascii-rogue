// v0.5 tests (Playwright): node queue, supply cap, Human one-shot. Run: NODE_PATH=<playwright dir> node tests/v05.test.js
const {chromium}=require('playwright'),assert=require('assert'),path=require('path');
const URL='file://'+path.join(__dirname,'../docs/index.html');
(async()=>{const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});const p=await b.newPage({viewport:{width:1280,height:720}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(URL);await p.keyboard.press('Enter');
 // 1. node queue: one Intern mines a node at a time; interns spread to the shortest wait
 const q=await p.evaluate(()=>{const G=__G();G.mineLog=[];G.power=1e4;for(let i=0;i<6;i++)G.wq.push(0.01);for(let i=0;i<1200;i++)__step(0.05);
  const by={};for(const [n,a,b] of G.mineLog)(by[n]=by[n]||[]).push([a,b]);let overlaps=0,used=0;
  for(const n in by){used++;const v=by[n].sort((x,y)=>x[0]-y[0]);for(let i=1;i<v.length;i++)if(v[i][0]<v[i-1][1]-1e-6)overlaps++;}
  return{trips:G.mineLog.length,overlaps,used,nodesP:G.nodes.filter(n=>n.kind==='P').length,workers:G.workers.length};});
 assert(q.trips>30,'interns mined');assert.strictEqual(q.overlaps,0,'never two interns on one node');assert.strictEqual(q.used,q.nodesP,'interns spread across all Compute nodes');
 // 2. supply cap: 12 base, +6 Server Farm, +4 Workplace; training blocked at cap
 const s=await p.evaluate(()=>{const G=__G(),{C,R}=__dims();G.power=1e5;const out={};out.start=__supply();
  for(let i=0;i<30;i++)window.dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));out.queued=__supply();
  for(let i=0;i<1500;i++)__step(0.1);out.full=__supply();
  const kn=G.nodes.find(n=>n.kind==='K');__place('library',kn.cx+1,kn.cy+1);G.place=null;
  outer:for(let y=1;y<R;y++)for(let x=8;x<C-6;x++)if(__place('barracks',x,y))break outer;G.place=null;
  for(let i=0;i<200;i++)__step(0.1);out.capAfter=__supply()[1];
  for(let i=0;i<30;i++)window.dispatchEvent(new KeyboardEvent('keydown',{key:'s'}));out.afterS=__supply();return out;});
 assert.deepStrictEqual(s.start,[9,12],'3 start + 6 trained');assert.deepStrictEqual(s.queued,[12,12],'queue stops at cap');assert.deepStrictEqual(s.full,[12,12]);
 assert.strictEqual(s.capAfter,22,'12 + 6 + 4');assert.deepStrictEqual(s.afterS,[22,22],'humans also capped');
 // 3. Human one-shot: kills a Chatbot outright from long range, consumed; Unicorn takes heavy damage
 const h=await p.evaluate(()=>{const G=__G(),C=__CFG,out={};G.soldiers=[];G.sq=[];G.enemies=[];
  const k=G.keep,px=k.x+k.pw+20,py=k.y+4,r=C.cannon_range*C.human_range_mult;out.range=r;
  G.soldiers.push({x:px,y:py,post:{x:px,y:py},hp:1});G.enemies.push({x:px+r-4,y:py,hp:50,max:50,next:-1,flash:0,kind:'grunt',ph:0});
  const k0=G.kills;__step(0.02);out.grunt={dead:!G.enemies.length,kills:G.kills-k0,humans:G.soldiers.length};
  G.soldiers.push({x:px,y:py,post:{x:px,y:py},hp:1});G.enemies.push({x:px+r+30,y:py,hp:50,max:50,next:-1,flash:0,kind:'grunt',ph:0});
  __step(0.02);out.outOfRange={humans:G.soldiers.length};G.enemies=[];
  G.enemies.push({x:px+20,y:py,hp:20,max:20,next:-1,flash:0,kind:'tank',ph:0});__step(0.02);
  out.uni={hp:G.enemies[0]&&G.enemies[0].hp,humans:G.soldiers.length};return out;});
 assert(h.grunt.dead&&h.grunt.kills===1&&h.grunt.humans===0,'human one-shots a 50hp chatbot and is consumed');
 assert.strictEqual(h.outOfRange.humans,1,'no shot beyond range');
 assert.strictEqual(h.uni.humans,0);assert.strictEqual(h.uni.hp,20-8,'unicorn takes human_unicorn_dmg');
 assert.deepStrictEqual(errs,[]);console.log('v0.5 test passed',JSON.stringify({queue:q,supply:s,human:h}));await b.close();})().catch(e=>{console.error(e);process.exit(1);});
