// Audio hookup test (Playwright). Run: NODE_PATH=<playwright dir> node tests/audio.test.js
const {chromium}=require('playwright'),assert=require('assert'),path=require('path');
const URL='file://'+path.join(__dirname,'../docs/index.html');
(async()=>{const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});const p=await b.newPage({viewport:{width:1280,height:720}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL+'?auto_waves=0');assert(await p.evaluate(()=>!!window.GameAudio),'GameAudio loaded');
 await p.evaluate(()=>{const A=GameAudio;window.__calls=[];const o=A.sfx.bind(A),s=A.start.bind(A);A.sfx=n=>{__calls.push(n);o(n);};A.start=()=>{__calls.push('START');s();};if(A.setState){const ss=A.setState.bind(A);A.setState=st=>{__calls.push('STATE:'+st);ss(st);};}});
 await p.keyboard.press('Enter');
 const m0=await p.evaluate(()=>__isMuted());await p.keyboard.press('m');const m1=await p.evaluate(()=>[__isMuted(),localStorage.getItem('ascii-rogue-muted')||Object.entries(localStorage)]);
 assert.notStrictEqual(m0,m1[0],'M toggles mute');
 await p.evaluate(()=>{const G=__G(),{C,R}=__dims(),CORE=__CORE;G.power=1e5;G.know=1e3;
  for(let k=0;k<G.path.length;k+=3){const i=G.path[k];for(const j of CORE.nbrs(i,C,R))if(G.g[j]===CORE.FREE&&__place('cannon',j%C,(j/C)|0))break;}G.place=null;
  for(let y=1;y<R&&!G.blds.some(b=>b.type==='barracks');y++)for(let x=8;x<C-6;x++)if(__place('barracks',x,y))break;
  const r=[];for(let i=0;i<C*R;i++)if(G.g[i]===CORE.ROCK)r.push(i);outer:for(const a of r)for(const b2 of r)if(b2>a&&b2-a<5&&((a/C)|0)===((b2/C)|0)&&__field(a,b2))break outer;G.place=null;});
 await p.keyboard.press('w');
 await p.evaluate(()=>{const G=__G();G.know=500;});await p.keyboard.press('1');
 await p.evaluate(()=>{const G=__G();G.p0=G.power;G.power=0;});await p.keyboard.press('w');await p.evaluate(()=>{const G=__G();G.power=G.p0;for(let i=0;i<200;i++)__step(0.1);G.sq.push(0.1,0.1,0.1);});
 await p.keyboard.press('n');
 await p.evaluate(()=>{for(let i=0;i<600;i++)__step(0.1);const G=__G();G.keep.hp=1;G.keep.max=1;G.wave=0;});await p.keyboard.press('n');
 await p.evaluate(()=>{const G=__G();G.blds=G.blds.filter(b=>b.type!=='cannon');for(let i=0;i<2000&&!G.over;i++)__step(0.1);});
 const calls=await p.evaluate(()=>__calls);const need=['START','STATE:build','STATE:wave','human_strike','upgrade_done','not_enough_compute','button_click','robot_spawn','disruptor_shot','robot_die','paywall_place','build_done','intern_trained','base_hit','wave_start','defeat'];
 for(const n of need)assert(calls.includes(n),'sfx fired: '+n);
 await p.keyboard.press('r');await p.goto(URL+'?win_waves=10&auto_waves=0');await p.evaluate(()=>{window.__calls=[];const o=GameAudio.sfx.bind(GameAudio);GameAudio.sfx=n=>{__calls.push(n);o(n);};});
 assert.strictEqual(await p.evaluate(()=>__isMuted()),m1[0],'mute persisted across reload');
 await p.evaluate(()=>{if(GameAudio.setState){const ss=GameAudio.setState.bind(GameAudio);GameAudio.setState=st=>{__calls.push('STATE:'+st);ss(st);};}});await p.keyboard.press('Enter');await p.evaluate(()=>{const G=__G();G.keep.hp=G.keep.max=1e6;G.wave=9;});await p.keyboard.press('n');await p.evaluate(()=>{const G=__G();for(let i=0;i<6000&&!G.over;i++)__step(0.1);});
 {const c=await p.evaluate(()=>__calls);for(const n of ['victory','boss','STATE:boss'])assert(c.includes(n),'fired: '+n);}
 await p.keyboard.press('r');assert((await p.evaluate(()=>__G().started&&!__G().over)),'restart after victory');
 // safe to call any SFX anytime, plus fallback page without GameAudio
 await p.evaluate(()=>['human_strike','unicorn_hit','wave_warning','supply_blocked','not_enough_compute','upgrade_done','paywall_blocked','button_click','robot_spawn','boss','disruptor_shot','robot_die','paywall_place','build_done','intern_trained','base_hit','wave_start','victory','defeat','nonsense'].forEach(n=>GameAudio.sfx(n)));
 await p.route('**/audio.js',r=>r.abort());await p.goto(URL);await p.keyboard.press('Enter');await p.keyboard.press('m');
 assert.strictEqual(await p.evaluate(()=>!!window.GameAudio),false);await p.evaluate(()=>{for(let i=0;i<200;i++)__step(0.1);});
 assert.deepStrictEqual(errs,[]);console.log('audio test passed: '+need.concat('victory','boss','STATE:boss').join(', ')+'; mute toggles + persists; fallback w/o audio.js ok');await b.close();})().catch(e=>{console.error(e);process.exit(1);});
