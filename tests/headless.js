// Loads docs/index.html's game script into a node vm with DOM stubs (no rendering) for fast sims.
const fs=require('fs'),path=require('path'),vm=require('vm');
const html=fs.readFileSync(path.join(__dirname,'../docs/index.html'),'utf8');
const src=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
function load(query){const noop=()=>{},ctx2d=new Proxy({},{get:(t,k)=>k==='measureText'?(()=>({width:10})):k in t?t[k]:noop,set:(t,k,v)=>(t[k]=v,true)});
 const canvas={getContext:()=>ctx2d,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:noop,style:{},width:0,height:0};
 const store={};const win={innerWidth:1280,innerHeight:720,devicePixelRatio:1,location:{search:query||''},addEventListener:noop,
  document:{getElementById:()=>canvas},performance:{now:()=>0},requestAnimationFrame:noop,setTimeout:noop,
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=String(v)},URLSearchParams,Math,console,confirm:()=>true};
 win.window=win;win.self=win;vm.createContext(win);vm.runInContext(src,win);return win;}
module.exports={load};
