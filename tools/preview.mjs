/* Local static preview with Netlify's extensionless page convention.
   ?country=DO is an explicit local test input, never a production geo API. */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import handler from '../netlify/edge-functions/language.js';
const root=resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml',
  '.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml'};
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost:8787');
    if(url.pathname==='/'||url.pathname==='/index.html') {
      const country=url.searchParams.get('country')||'';
      const saved=(req.headers.cookie||'').match(/(?:^|;\s*)adsvio_language=([^;]+)/)?.[1];
      const result=handler(new Request(url,{method:req.method,headers:req.headers}),
        {geo:{country:{code:country}},cookies:{get:()=>saved}});
      if(result){res.writeHead(result.status,Object.fromEntries(result.headers));res.end();return;}
    }
    let pathname=decodeURIComponent(url.pathname);
    let file=resolve(root,'.'+pathname);
    if(!(file===root||file.startsWith(root+sep))) {res.writeHead(403);res.end();return;}
    if(/^\/(?:tools|docs|netlify|node_modules|\.git)\//.test(pathname)) {
      res.writeHead(404);res.end();return;
    }
    for(const candidate of [file,resolve(file,'index.html'),file+'.html']) {
      try {if((await stat(candidate)).isFile()){file=candidate;break;}}catch{}
    }
    try {
      const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
    }catch {
      res.writeHead(404,{'Content-Type':types['.html']});res.end(await readFile(resolve(root,'404.html')));
    }
  }catch{res.writeHead(500);res.end('Preview request failed');}
}).listen(8787,'127.0.0.1',()=>console.log('Local: http://localhost:8787/es/'));
