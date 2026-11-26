import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const playwright = require(process.env.COTTONLEAF_PLAYWRIGHT || resolve(process.env.LOCALAPPDATA, 'Temp/cottonleaf-poster-tools/node_modules/playwright-core'));
const dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(dir, '../../..');
const types = {'.html':'text/html; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server = createServer(async (req,res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root + sep)) {res.writeHead(403).end();return;}
    res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch {res.writeHead(404).end();}
});
await new Promise(r => server.listen(0,'127.0.0.1',r));
const url = `http://127.0.0.1:${server.address().port}/output/cartelli-domicilio/v1.1.0/cartelli.html`;
let browser;
try {
  browser = await playwright.chromium.launch({executablePath:process.env.COTTONLEAF_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context = await browser.newContext({viewport:{width:900,height:1250}, deviceScaleFactor:2480/794});
  const page = await context.newPage();
  await page.goto(url); await page.evaluate(() => document.fonts.ready);
  const results = [];
  for (const [index,id] of ['atelier','roma','materia'].entries()) {
    const poster = page.locator('#'+id);
    await poster.screenshot({path:resolve(dir,`cartello-${index+1}-${id}-A4-300dpi.png`)});
    const bounds = await poster.evaluate(el => {
      const box=el.getBoundingClientRect();
      return [...el.querySelectorAll('*')].filter(n=>n.getClientRects().length).map(n=>({tag:n.tagName,cl:n.className,r:n.getBoundingClientRect()})).filter(({r})=>r.x<box.x-.5 || r.y<box.y-.5 || r.right>box.right+.5 || r.bottom>box.bottom+.5).map(n=>({tag:n.tag,cl:n.cl}));
    });
    results.push({id,outOfBounds:bounds});
    await page.addStyleTag({content:'.poster{display:none!important}#'+id+'{display:block!important}'});
    await page.pdf({path:resolve(dir,`cartello-${index+1}-${id}-A4.pdf`),preferCSSPageSize:true,printBackground:true});
    await page.reload();await page.evaluate(()=>document.fonts.ready);
  }
  await page.pdf({path:resolve(dir,'cotton-leaf-tre-cartelli-sito-verticali-A4.pdf'),preferCSSPageSize:true,printBackground:true});
  await writeFile(resolve(dir,'layout-verification.json'),JSON.stringify(results,null,2)+'\n');
  const previewContext = await browser.newContext({viewport:{width:900,height:1250},deviceScaleFactor:0.9});
  const preview=await previewContext.newPage(); await preview.goto(url);await preview.evaluate(()=>document.fonts.ready);
  for(const [index,id] of ['atelier','roma','materia'].entries()) await preview.locator('#'+id).screenshot({path:resolve(dir,`anteprima-${index+1}-${id}.png`)});
  console.log(JSON.stringify(results));
} finally {
  if(browser)await browser.close();
  server.close();
}
