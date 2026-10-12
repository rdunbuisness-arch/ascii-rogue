// Node unit tests for Superhumanity grid pathfinding. Run: node tests/path.test.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'../docs/index.html'),'utf8');
const src=html.slice(html.indexOf('// CORE-BEGIN'),html.indexOf('// CORE-END'));
const CORE=new Function('module',src+';return CORE;')(undefined);
const {FREE,ROCK,FIELD,GOAL,bfs,canBlock,next}=CORE;
let seed=12345;const rand=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
function mkGrid(C,R){const g=new Uint8Array(C*R);for(let y=R/2-2|0;y<(R/2|0)+2;y++)for(let x=1;x<4;x++)g[y*C+x]=GOAL;
 for(let i=0;i<C*R;i++)if(g[i]===FREE&&i%C>5&&i%C<C-3&&rand()<0.15)g[i]=ROCK;return g;}
let tests=0,accepted=0,rejected=0;
function check(name,fn){fn();tests++;console.log('ok -',name);}
check('sealing corridor is rejected',()=>{const C=10,R=3,g=new Uint8Array(C*R);g[0]=g[C]=g[2*C]=GOAL;
 // wall off column 5 except row 1, then try to block row 1
 g[5]=ROCK;g[2*C+5]=ROCK;const spawn=C+9;assert(bfs(g,C,R)[spawn]>=0);
 assert.strictEqual(canBlock(g,C,R,[C+5],[spawn]),false);
 assert.strictEqual(canBlock(g,C,R,[C+7],[spawn]),true);});
check('blocking a must cell itself is rejected',()=>{const C=5,R=1,g=new Uint8Array(C);g[0]=GOAL;assert.strictEqual(canBlock(g,C,R,[4],[4]),false);});
check('random mazes: accepted placements never seal; rejected ones would have sealed',()=>{
 for(let trial=0;trial<300;trial++){const C=20+Math.floor(rand()*30),R=10+Math.floor(rand()*15),g=mkGrid(C,R),spawn=Math.floor(R/2)*C+C-1;g[spawn]=FREE;
  if(bfs(g,C,R)[spawn]<0)continue;
  for(let k=0;k<60;k++){const x=Math.floor(rand()*C),y=Math.floor(rand()*R),len=1+Math.floor(rand()*8),hz=rand()<.5,cells=[];
   for(let s=0;s<len;s++){const xx=x+(hz?s:0),yy=y+(hz?0:s);if(xx<C&&yy<R)cells.push(yy*C+xx);}
   const allFree=cells.every(i=>g[i]===FREE);const ok=canBlock(g,C,R,cells,[spawn]);
   if(ok){cells.forEach(i=>g[i]=FIELD);accepted++;}
   else if(allFree&&!cells.includes(spawn)){const h=g.slice();cells.forEach(i=>h[i]=FIELD);assert(bfs(h,C,R)[spawn]<0,'rejected a non-sealing placement');rejected++;}
   const d=bfs(g,C,R);assert(d[spawn]>=0,'path lost');
   // following the flow field from spawn always reaches a goal
   let i=spawn,n=0;while(g[i]!==GOAL){i=next(d,g,C,R,i);assert(i>=0,'dead end');assert(++n<C*R,'loop');}}}});
console.log(`${tests} tests passed (${accepted} placements accepted, ${rejected} sealing placements rejected)`);
