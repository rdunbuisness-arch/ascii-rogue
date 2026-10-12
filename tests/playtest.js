// Scripted headless playtest: 3 strategies + passive control, several seeds, full 10 waves. Run: node tests/playtest.js [seeds] [query]
const {load}=require('./headless');
const SEEDS=+(process.argv[2]||4),Q=process.argv[3]||'';
function seedRand(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
function cannonSpots(w){const G=w.__G(),{C,R}=w.__dims(),CORE=w.__CORE,spots=[];const L=G.path.length;
 // spread along the second half of the route (closest to the base last)
 for(let k=Math.floor(L*0.15);k<L;k+=3){const i=G.path[k];for(const j of CORE.nbrs(i,C,R))if(G.g[j]===CORE.FREE&&!spots.includes(j))spots.push(j);}return spots;}
function tryCannon(w){const G=w.__G(),{C}=w.__dims();if(G.power<w.__CFG.cannon_cost)return false;const sp=cannonSpots(w);
 // prefer spots covering the most path cells
 const r=w.__CFG.cannon_range;let best=null,bv=-1;for(const j of sp.slice(0,200)){const x=(j%C)*8+4,y=Math.floor(j/C)*8+4;let v=0;for(const i of G.path){const px=(i%C)*8+4,py=Math.floor(i/C)*8+4;if(Math.hypot(px-x,py-y)<=r)v++;}
  for(const b of G.blds)if(b.type==='cannon'&&Math.hypot(b.x+4-x,b.y+4-y)<r)v-=4;if(v>bv){bv=v;best=j;}}
 if(best==null)return false;const ok=w.__place('cannon',best%C,Math.floor(best/C));G.place=null;return ok;}
function build(w,type){const G=w.__G(),{C,R}=w.__dims();if(type==='library'){const n=G.nodes.find(n=>n.kind==='K'&&!n.lib);if(!n)return false;const ok=w.__place('library',n.cx+1,n.cy+1);G.place=null;return ok;}
 for(let x=7;x<C-8;x++)for(let y=1;y<R-3;y+=2)if(w.__place(type,x,y)){G.place=null;return true;}G.place=null;return false;}
function count(G,t){return G.blds.filter(b=>b.type===t).length;}
const STRATS={
 greedyLate:(w,G,C)=>{if(G.wave>=1&&!G.spawnQ&&!G.enemies.length)G.lateOk=1;if(!G.lateOk){const ints=G.workers.length+G.wq.length,[u,cap]=w.__supply();if(!G.wq.length&&u<cap)w.__act('worker');if(ints>=8&&count(G,'library')<1&&G.power>=C.library_cost)build(w,'library');if(count(G,'library')&&G.workers.filter(x=>x.job==='K').length<3)w.__assign('K');return;}STRATS.economy(w,G,C);},
 passive:(w,G,C)=>{if(G.workers.length+G.wq.length<10&&!G.wq.length)w.__act('worker');},
 economy:(w,G,C)=>{const ints=G.workers.length+G.wq.length,[u,cap]=w.__supply();
  if(!G.wq.length&&u<cap&&ints<(G.t<150?12:22))w.__act('worker');
  if(ints>=8&&count(G,'library')<1&&G.power>=C.library_cost)build(w,'library');
  if(count(G,'library')&&G.workers.filter(x=>x.job==='K').length<3)w.__assign('K');
  if(u>=cap-1&&count(G,'library')<2&&G.power>=C.library_cost)build(w,'library');
  if(G.t>55||G.wave>0){if(count(G,'cannon')<2+G.wave*1.6)tryCannon(w);}
  if(G.know>=C.dmg_k&&G.power>=C.dmg_p+20)w.__act('dmg');if(G.up.dmg&&G.know>=C.range_k&&G.power>=C.range_p+20)w.__act('range');
  if(G.up.range&&G.know>=C.walls_k&&G.power>=C.walls_p+40)w.__act('walls');
  if(G.power>300)tryCannon(w);},
 disruptor:(w,G,C)=>{const ints=G.workers.length+G.wq.length,[u,cap]=w.__supply();
  if(count(G,'cannon')<2)tryCannon(w);
  if(!G.wq.length&&u<cap&&ints<16&&G.power>=C.worker_cost+(count(G,'cannon')<3?40:0))w.__act('worker');
  if(ints>=7&&count(G,'library')<1&&G.power>=C.library_cost)build(w,'library');
  if(count(G,'library')&&G.workers.filter(x=>x.job==='K').length<3)w.__assign('K');
  if(G.know>=C.dmg_k)w.__act('dmg');if(G.up.dmg&&G.know>=C.range_k)w.__act('range');
  if(G.power>=C.cannon_cost)tryCannon(w);},
 human:(w,G,C)=>{const ints=G.workers.length+G.wq.length,[u,cap]=w.__supply(),nb=count(G,'barracks');
  if(!G.wq.length&&u<cap&&ints<(nb?14:6))w.__act('worker');
  if(ints>=6&&nb<1&&G.power>=C.barracks_cost)build(w,'barracks');
  if(nb&&count(G,'library')<1&&G.power>=C.library_cost)build(w,'library');
  if(count(G,'library')&&G.workers.filter(x=>x.job==='K').length<2)w.__assign('K');
  if(G.know>=C.spears_k&&G.power>=C.spears_p)w.__act('spears');
  if(count(G,'cannon')<Math.min(6,1+Math.floor(G.wave*0.6))&&G.t>50)tryCannon(w);
  if(nb<1&&G.t>45&&ints>=6&&G.power>=C.barracks_cost){build(w,'barracks');if(!count(G,'barracks'))tryCannon(w);}
  if(u>=cap-1&&G.power>=C.barracks_cost+50&&nb<4)build(w,'barracks');
  if(u>=cap-1&&count(G,'library')<2&&G.power>=C.library_cost)build(w,'library');
  if(nb&&G.sq.length<2*nb&&u<cap)w.__act('soldier');
  if(G.power>400)tryCannon(w);}};
module.exports={STRATS,helpers:[cannonSpots,tryCannon,build,count]};
function play(strat,seed){const r0=Math.random;Math.random=seedRand(seed*7919+13);const w=load(Q);w.Math.random=Math.random;w.__newGame();const G=w.__G(),C=w.__CFG;
 let t=0;while(!G.over&&G.t<1500){for(let k=0;k<5;k++)w.__step(0.1);STRATS[strat](w,G,C);}
 Math.random=r0;return{strat,seed,win:G.won,len:G.t,hp:G.keep.hp,max:G.keep.max,dmg:G.dmgW||{},wave:G.wave,leak:G.firstLeak||'-',half:G.halfWave||'-',kills:G.kills};}
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
if(require.main===module){const rows=[];for(const st of (process.env.STRATS||'economy,greedyLate,disruptor,human,passive').split(','))for(let s=1;s<=SEEDS;s++)rows.push(play(st,s));
if(!process.env.QUIET){console.log('| strategy | seed | result | length | Market HP | waves | first leak | damage by wave |');console.log('|---|---|---|---|---|---|---|---|');
for(const r of rows)console.log(`| ${r.strat} | ${r.seed} | ${r.win?'WIN':'loss'} | ${fmt(r.len)} | ${r.hp} | ${r.wave} | ${r.leak} | ${Object.entries(r.dmg).map(([k,v])=>'w'+k+':'+v).join(' ')||'-'} |`);}
const sum={};for(const r of rows){const s=sum[r.strat]=sum[r.strat]||{w:0,n:0,len:0,hp:0,dw:{}};s.n++;s.w+=r.win;s.len+=r.len;if(r.win)s.hp+=r.hp/r.max;for(const k in r.dmg)s.dw[k]=(s.dw[k]||0)+r.dmg[k]/1;}
console.log('\nsummary: '+Object.entries(sum).map(([k,v])=>`${k} ${v.w}/${v.n} wins avg ${fmt(v.len/v.n)} winHP ${v.w?Math.round(100*v.hp/v.w):0}% dmg/wave ${Object.entries(v.dw).map(([a,b])=>a+':'+Math.round(b/v.n)).join(' ')}`).join('\n'));
if(process.env.STRICT){const bad=['economy','disruptor','human'].filter(k=>sum[k].w<sum[k].n*0.75);if(bad.length||sum.passive.w)process.exit(1);}}
