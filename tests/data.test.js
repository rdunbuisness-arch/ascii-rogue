// Regression: player builds a Server Farm via L + click, presses K, Intern mines Data.
const {chromium}=require('playwright'),assert=require('assert'),path=require('path');
(async()=>{const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{}),p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+path.resolve(__dirname,'../docs/index.html')+'?auto_waves=0');await p.keyboard.press('x');
 const pos=await p.evaluate(()=>{const G=__G(),{T}=__dims(),L=__layout(),cv=document.querySelector('canvas').getBoundingClientRect();const n=G.nodes.find(n=>n.kind==='K');G.power=500;
  return {x:cv.left+(n.x+8)*L.S,y:cv.top+(L.TOP+n.y+8)*L.S};});
 await p.keyboard.press('l');await p.mouse.move(pos.x,pos.y);await p.mouse.down();await p.mouse.up();
 const placed=await p.evaluate(()=>__G().blds.some(b=>b.type==='library'));assert(placed,'server farm placed by click');
 // real-player flow: press K right away, while the farm is still under construction
 await p.keyboard.press('k');await p.keyboard.press('k');
 const r=await p.evaluate(()=>{const G=__G(),k0=G.know,jobs=G.workers.filter(w=>w.job==='K').length;const seen=new Set();for(let i=0;i<1200;i++){__step(0.05);G.workers.forEach(w=>w.node&&w.node.kind==='K'&&seen.add(w.st));}return{jobs,gain:G.know-k0,seen:[...seen],libs:G.blds.filter(b=>b.type==='library').map(b=>b.done)};});
 console.log(JSON.stringify(r));assert(r.jobs>=2,'K assigns interns');assert(r.gain>0,'Data increases');assert.deepStrictEqual(errs,[]);console.log('data test passed');await b.close();})().catch(e=>{console.error(e);process.exit(1);});
