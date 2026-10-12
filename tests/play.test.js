// Headless browser test (Playwright). Run: NODE_PATH=<dir with playwright> node tests/play.test.js [screenshot.png]
const {chromium}=require('playwright'),assert=require('assert'),path=require('path');
const URL='file://'+path.join(__dirname,'../docs/index.html');
(async()=>{const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
 const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 // auto_waves on: timer launches waves
 await p.goto(URL+'?auto_waves=1&wave_first=2');await p.keyboard.press('Enter');
 const auto=await p.evaluate(()=>{for(let i=0;i<30;i++)__step(0.1);return __G().wave;});assert.strictEqual(auto,1,'auto wave fired');
 await p.goto(URL+'?win_waves=2');await p.waitForTimeout(300);
 assert.strictEqual(await p.evaluate(()=>__G().started),false);await p.keyboard.press('Enter');
 assert.strictEqual(await p.evaluate(()=>__G().started),true);
 const r=await p.evaluate(()=>{const G=__G(),{C,R}=__dims(),CORE=__CORE;G.power=1e5;G.know=1e3;const out={};
  // barracks + library placement on a valid spot
  const tryAll=t=>{for(let y=1;y<R;y++)for(let x=8;x<C-6;x++)if(__place(t,x,y))return true;return false;};
  out.barracks=tryAll('barracks');
  const kn=G.nodes.find(n=>n.kind==='K');out.library=__place('library',kn.cx+1,kn.cy+1);
  // spam random pylons + fields; path must always survive
  let fields=0;for(let k=0;k<400;k++){const x=8+Math.floor(Math.random()*(C-14)),y=Math.floor(Math.random()*R);__place('pylon',x,y);}
  const anchors=[];for(let i=0;i<C*R;i++)if(G.g[i]===CORE.ROCK||(G.cellB[i]&&G.cellB[i].type==='pylon'))anchors.push(i);
  for(let k=0;k<3000;k++){const a=anchors[Math.floor(Math.random()*anchors.length)],b=anchors[Math.floor(Math.random()*anchors.length)];__field(a,b);}
  out.fields=G.fields.length;out.pathOk=CORE.bfs(G.g,C,R)[G.spawn]>=0;out.pathLen=G.path.length;
  // cannons along the robot path
  G.place=null;let cannons=0;for(let k=0;k<G.path.length&&cannons<6;k+=4){const i=G.path[k];for(const j of CORE.nbrs(i,C,R)){if(G.g[j]===CORE.FREE&&__place('cannon',j%C,Math.floor(j/C))){cannons++;break;}}}
  G.place=null;out.cannons=cannons;
  for(let i=0;i<300;i++)__step(0.1);out.waveBeforeSend=G.wave;
  return out;});
 assert.strictEqual(r.waveBeforeSend,0,'no timer waves by default');
 await p.keyboard.press('n');
 r.afterN=await p.evaluate(()=>{for(let i=0;i<60;i++)__step(0.1);return {wave:__G().wave,enemies:__G().enemies.length};});
 assert.strictEqual(r.afterN.wave,1,'N sends a wave');
 await p.evaluate(()=>{for(let i=0;i<400;i++)__step(0.1);});await p.keyboard.press('n');
 await p.evaluate(()=>{for(let i=0;i<40;i++)__step(0.1);});
 await p.waitForTimeout(150);await p.screenshot({path:process.argv[2]||'/tmp/sh.png'});
 const r2=await p.evaluate(()=>{const G=__G();for(let i=0;i<3000&&!G.over;i++)__step(0.1);return{kills:G.kills,soldiers:G.soldiers.length,hp:G.keep.hp,won:G.won,over:G.over};});
 await p.keyboard.press('r');const r3=await p.evaluate(()=>[__G().over,__G().t]);
 console.log(JSON.stringify({...r,...r2,restart:r3}));
 assert(r.barracks,'barracks placed');assert(r.library,'library placed');assert(r.pathOk,'path exists after maze spam');assert(r.fields>0);
 assert(r.cannons>0);assert(r2.kills>0&&r2.soldiers===0,'cannons killed robots');assert(r2.over);assert(!r3[0]&&r3[1]<1,'restart');
 assert.deepStrictEqual(errs,[]);console.log('play test passed');await b.close();})().catch(e=>{console.error(e);process.exit(1);});
