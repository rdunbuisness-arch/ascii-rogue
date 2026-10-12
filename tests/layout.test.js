// Layout test (Playwright): HUD strips never overlap the map's playable cells, at several window sizes,
// and robots spawn/path through the top and bottom rows. Run: NODE_PATH=<playwright dir> node tests/layout.test.js
const {chromium}=require('playwright'),assert=require('assert'),path=require('path');
const URL='file://'+path.join(__dirname,'../docs/index.html');
const SIZES=[[1280,720],[1920,1080],[1024,768],[800,600],[640,480],[1440,900],[390,844]];
const hit=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
(async()=>{const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});let n=0,rocksTop=0,rocksBot=0;
 for(const [w,h] of SIZES){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL);await p.keyboard.press('Enter');await p.evaluate(()=>{__G().msgT=5;__G().msg='a fairly long toast message to stress the top strip';});await p.waitForTimeout(120);
  const L=await p.evaluate(()=>__layout());
  assert(L.hud.length>10,'hud rects recorded');
  for(const r of L.hud)assert(!hit(r,L.map),`${w}x${h}: HUD '${r.what}' ${JSON.stringify(r)} overlaps map ${JSON.stringify(L.map)}`);
  assert(L.map.y>=L.TOP&&L.map.y+L.map.h<=L.H&&L.map.w<=L.W,'map inside canvas, below top strip');
  assert(L.map.h===L.R*8&&L.R>=8,'map scaled to remaining space');
  const top=L.hud.find(r=>r.what==='topbar'),panel=L.hud.find(r=>r.what==='panel');
  assert(top.y+top.h<=L.map.y&&panel.y>=L.map.y+L.map.h,'strips above/below map');
  const rk=await p.evaluate(()=>{const G=__G(),{C,R}=__dims();let t=0,bt=0;for(let x=0;x<C;x++){if(G.g[x]===1)t++;if(G.g[(R-1)*C+x]===1)bt++;}return[t,bt];});rocksTop+=rk[0];rocksBot+=rk[1];
  // force robots through the top row, then the bottom row
  for(const row of ['top','bot']){const res=await p.evaluate(row=>{const G=__G(),{C,R,T}=__dims(),CORE=__CORE;
    G.enemies=[];G.spawnQ=0;const x=Math.floor(C/2)+2,gap=row==='top'?0:R-1;
    for(let y=0;y<R;y++){const i=y*C+x;G.g[i]=y===gap?CORE.FREE:CORE.ROCK;}
    for(let xx=0;xx<C;xx++){const i=gap*C+xx;if(G.g[i]===CORE.ROCK||G.g[i]===CORE.FIELD)G.g[i]=CORE.FREE;} // keep the gap row walkable
    if(!__recalc())return{ok:false};const thru=G.path.some(i=>i%C===x&&Math.floor(i/C)===gap);
    G.wave=0;G.keep.hp=1e6;G.keep.max=1e6;window.__keyN=1;
    return{ok:true,thru,gap};},row);
   assert(res.ok&&res.thru,`${w}x${h}: path through ${row} row`);
   await p.keyboard.press('n');
   const r2=await p.evaluate(gap=>{const G=__G(),{C,T}=__dims();const x=Math.floor(C/2)+2;let seen=false,hp0=G.keep.hp;
    for(let i=0;i<3000;i++){__step(0.05);for(const e of G.enemies)if(Math.floor(e.x/T)===x&&Math.floor(e.y/T)===gap)seen=true;if(seen&&G.keep.hp<hp0)break;}
    return{seen,hit:G.keep.hp<hp0};},res.gap);
   assert(r2.seen,`${w}x${h}: robot walked the ${row} row`);assert(r2.hit,`${w}x${h}: robot reached the base via ${row} row`);
   await p.evaluate(()=>{const G=__G();G.enemies=[];G.spawnQ=0;});}
  assert.deepStrictEqual(errs,[]);n++;console.log(`ok - ${w}x${h}: ${L.hud.length} HUD rects clear of map ${L.map.w}x${L.map.h} (${L.C}x${L.R} cells); top/bottom-row pathing ok`);await p.close();}
 assert(rocksTop>0&&rocksBot>0,'rocks generated in top and bottom rows');console.log(`layout test passed (${n} sizes; rocks in top row ${rocksTop}, bottom row ${rocksBot})`);await b.close();})().catch(e=>{console.error(e);process.exit(1);});
