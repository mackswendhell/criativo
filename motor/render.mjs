// Renderiza um vídeo feito em código: um HTML com window.__video e window.seek(t) puro.
//   node motor/render.mjs projetos/x/video/giro.html                  todos os formatos declarados → giro-4x5.mp4 …
//   node motor/render.mjs <html> --f 9x16 --sub 4                     um formato, 4 subquadros de motion blur
//   node motor/render.mjs <html> --folha [--passo 1.5]                um quadro por batida (ou a cada N s) → giro-4x5-folha.jpg (revisar antes do vídeo)
//   node motor/render.mjs <html> --folha --de 20 --ate 45 --passo 1    folha só de um trecho
//   node motor/render.mjs <html> --quadro 2.5[,7,12]                  um ou mais quadros → giro-4x5-2.5s.png
//   node motor/render.mjs <html> --gpu                                  3D na placa de vídeo (bem mais rápido)
//   node motor/render.mjs <html> --v 1,2 [--web]                       versões (a página lê ?v=) → loops1/x-16x9.mp4, loops2/… · --web: -web.mp4, -mudo.mp4 e pôster .jpg
// __video = { formatos: {'4x5': [1080,1350], ...}, duracao: 8, fps: 30, bpm: 120, loop: true, lufs: -14,
//             trilha: 'audio/trilha.mp3', sons: [{ t: 1.5, src: 'audio/whoosh.wav', vol: 0.6 }] }   (caminhos relativos ao HTML)
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import os from 'node:os'; import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.json': 'application/json', '.mp4': 'video/mp4' };

const args = process.argv.slice(2); const html = path.resolve(args[0] || '');
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; };
if (!fs.existsSync(html)) { console.log('uso: node motor/render.mjs <arquivo.html> [--f 4x5,9x16] [--sub 4] [--folha] [--quadro t]'); process.exit(1); }
const dir = path.dirname(html), base = path.basename(html, '.html'), rel = path.relative(RAIZ, html);

const srv = http.createServer((req, res) => {
  const p = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(RAIZ) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p).toLowerCase()] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const porta = srv.address().port;
// --gpu: WebGL na placa de vídeo (muito mais rápido no 3D; o quadro pode variar 1 pixel entre renders, então não use em loop que precisa fechar exato)
const webgl = opt('gpu', false) ? ['--use-angle=metal', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'] : ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'];
const browser = await chromium.launch({ channel: 'chrome', args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none', ...webgl] });

async function abrir(f, ver) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error(`[${base}]`, e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error(`[${base}]`, m.text()); });
  await page.goto(`http://127.0.0.1:${porta}/${rel}?${new URLSearchParams({ ...(f && { f }), ...(ver && { v: ver }) })}`);
  await page.waitForFunction(() => window.__pronto === true, null, { timeout: 60000 });
  const v = await page.evaluate(() => window.__video);
  await page.setViewportSize({ width: v.w, height: v.h }); await page.evaluate(() => window.seek(0));
  await page.screenshot({ clip: { x: 0, y: 0, width: v.w, height: v.h } });   // o primeiro screenshot depois do redimensionamento sai com sobra do layout antigo: descarta
  return { page, v };
}
const shot = async (page, v, t, tipo = 'png') => { await page.evaluate((tt) => window.seek(tt), t); return page.screenshot({ type: tipo, clip: { x: 0, y: 0, width: v.w, height: v.h } }); };
const roda = (bin, a) => new Promise((ok, ruim) => { const p = spawn(bin, a); let e = ''; p.stderr.on('data', (d) => (e += d)); p.on('close', (c) => (c ? ruim(new Error(e)) : ok())); });

function audio(v, saida) {
  const ent = [], fil = [];
  if (v.trilha) { ent.push('-i', path.join(dir, v.trilha)); fil.push(`[0:a]atrim=0:${v.duracao},afade=t=out:st=${Math.max(0, v.duracao - 0.6)}:d=0.6[a0]`); }
  (v.sons || []).forEach((s, i) => { const k = ent.length / 2; ent.push('-i', path.join(dir, s.src)); fil.push(`[${k}:a]volume=${s.vol ?? 0.7},adelay=${Math.round(s.t * 1000)}:all=1[a${k}]`); });
  const n = ent.length / 2; if (!n) return null;
  const mix = `${[...Array(n).keys()].map((k) => `[a${k}]`).join('')}amix=inputs=${n}:normalize=0:duration=longest,atrim=0:${v.duracao},${v.lufs === null ? 'alimiter=limit=0.84:level=false' : `loudnorm=I=${v.lufs ?? -14}:TP=-1.5`},aresample=48000[aout]`;
  return roda('ffmpeg', ['-y', '-v', 'error', ...ent, '-filter_complex', [...fil, mix].join(';'), '-map', '[aout]', saida]);
}

// --som: refaz só o áudio do MP4 que já existe (os quadros não mudam) e as versões web
async function soSom(f, ver) {
  const { page, v } = await abrir(f, ver); await page.close();
  const mp4 = path.join(saiDir(ver), `${base}-${v.f}.mp4`), wav = path.join(os.tmpdir(), `${base}-${v.f}-${ver || ''}-${porta}.wav`), tmp = mp4.replace(/\.mp4$/, '-tmp.mp4');
  const temSom = audio(v, wav); if (!temSom) return; await temSom;
  await roda('ffmpeg', ['-y', '-v', 'error', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(v.duracao), '-movflags', '+faststart', tmp]);
  fs.renameSync(tmp, mp4); fs.rmSync(wav, { force: true }); console.log('ok som', path.relative(RAIZ, mp4)); if (opt('web', false)) await web(mp4, v);
}
const saiDir = (ver) => { const d = ver ? path.join(dir, 'loops' + ver) : dir; fs.mkdirSync(d, { recursive: true }); return d; };
async function video(f, ver) {
  const { page, v } = await abrir(f, ver); const fps = v.fps || 30, sub = +opt('sub', 1), n = Math.round(v.duracao * fps);
  const mp4 = path.join(saiDir(ver), `${base}-${v.f}.mp4`), wav = path.join(os.tmpdir(), `${base}-${v.f}-${ver || ''}-${porta}.wav`);
  const temSom = audio(v, wav); if (temSom) await temSom;
  const vf = [...(sub > 1 ? [`tmix=frames=${sub}`, `select='eq(mod(n\\,${sub})\\,${sub - 1})'`, `setpts=N/(${fps}*TB)`] : []), 'scale=out_color_matrix=bt709:out_range=tv', 'format=yuv420p'].join(',');
  const a = ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps * sub), '-c:v', 'png', '-i', '-'];
  if (temSom) a.push('-i', wav, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k');
  a.push('-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(fps), '-t', String(v.duracao), '-movflags', '+faststart', mp4);
  const ff = spawn('ffmpeg', a); let erro = ''; ff.stderr.on('data', (d) => (erro += d));
  const fim = new Promise((ok, ruim) => ff.on('close', (c) => (c ? ruim(new Error(erro)) : ok())));
  const t0 = Date.now();
  for (let i = 0; i < n * sub; i++) { const buf = await shot(page, v, i / (fps * sub)); if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok)); }
  ff.stdin.end(); await fim;
  let laco = '';
  if (v.loop) { const a0 = await shot(page, v, 0), a1 = await shot(page, v, v.duracao); laco = a0.equals(a1) ? ' · loop fecha' : ' · LOOP NÃO FECHA (quadro final ≠ quadro 0)'; }
  await page.close(); if (temSom) fs.rmSync(wav, { force: true });
  console.log('ok', path.relative(RAIZ, mp4), `${v.w}x${v.h}`, n, 'quadros', ((Date.now() - t0) / 1000).toFixed(0) + 's', temSom ? 'com som' : 'sem som', laco);
  if (opt('web', false)) await web(mp4, v);
}
// versões leves para o site (como o loop.sh): com som, muda e o pôster do quadro do meio
async function web(mp4, v) {
  const x = mp4.replace(/\.mp4$/, ''), vid = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  await roda('ffmpeg', ['-y', '-v', 'error', '-i', mp4, ...vid, '-c:a', 'aac', '-b:a', '96k', x + '-web.mp4']);
  await roda('ffmpeg', ['-y', '-v', 'error', '-i', mp4, ...vid, '-an', x + '-mudo.mp4']);
  await roda('ffmpeg', ['-y', '-v', 'error', '-ss', String(v.duracao / 2), '-i', mp4, '-frames:v', '1', '-q:v', '3', x + '.jpg']);
  const mb = (s) => (fs.statSync(s).size / 1e6).toFixed(1) + ' MB'; console.log('   web', path.relative(RAIZ, x + '-web.mp4'), mb(x + '-web.mp4'), '· mudo', mb(x + '-mudo.mp4'));
}

async function folha(f, ver) {
  const { page, v } = await abrir(f, ver); const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'folha-'));
  const passo = +opt('passo', 60 / (v.bpm || 120)), ts = [], ate = Math.min(v.duracao, +opt('ate', v.duracao)); for (let t = +opt('de', 0); t < ate - 1e-6 && ts.length < 120; t += passo) ts.push(t);
  for (const [i, t] of ts.entries()) fs.writeFileSync(path.join(tmp, `${String(i).padStart(3, '0')}.jpg`), await shot(page, v, t, 'jpeg'));
  await page.close(); const cols = Math.min(8, ts.length), lin = Math.ceil(ts.length / cols), out = path.join(saiDir(ver), `${base}-${v.f}-folha.jpg`);
  await roda('ffmpeg', ['-y', '-v', 'error', '-framerate', '1', '-i', path.join(tmp, '%03d.jpg'), '-vf', `scale=270:-1,tile=${cols}x${lin}:padding=6:color=0x181818`, '-frames:v', '1', '-q:v', '3', out]);
  fs.rmSync(tmp, { recursive: true }); console.log('ok', path.relative(RAIZ, out), ts.length, 'batidas de', passo + 's');
}

try {
  const pg = await browser.newPage(); await pg.goto(`http://127.0.0.1:${porta}/${rel}`);
  await pg.waitForFunction(() => window.__video && window.__video.formatos, null, { timeout: 60000 });
  const todos = Object.keys(await pg.evaluate(() => window.__video.formatos)); await pg.close();
  const fs_ = opt('f', 'all') === 'all' ? todos : String(opt('f')).split(','), vs = opt('v', null) ? String(opt('v')).split(',') : [null];
  if (opt('quadro', null) !== null) {
    for (const f of fs_) for (const ver of vs) { const { page, v } = await abrir(f, ver); for (const t of String(opt('quadro')).split(',').map(Number)) { const out = path.join(saiDir(ver), `${base}-${v.f}-${t}s.png`); fs.writeFileSync(out, await shot(page, v, t)); console.log('ok', path.relative(RAIZ, out)); } await page.close(); }
  } else if (opt('som', false)) { for (const f of fs_) for (const ver of vs) await soSom(f, ver); }
  else if (opt('folha', false)) await Promise.all(fs_.flatMap((f) => vs.map((ver) => folha(f, ver))));
  else await Promise.all(fs_.flatMap((f) => vs.map((ver) => video(f, ver))));
} finally { await browser.close(); srv.close(); }
