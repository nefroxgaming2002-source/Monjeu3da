// Socle commun des outils de verification des prototypes.
// - un Chromium sans ecran, rendu WebGL logiciel (SwiftShader) : lent, mais identique d'une session a l'autre ;
// - la page ouverte depuis le disque, sans reseau : three.js est servi depuis un cache local (outils/.cache) ;
// - le crochet de la page : window.__<art> = { seek(vue, ms, pendantArret, orbite), son, T, sim, tau }.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const CACHE = path.join(__dirname, '.cache'), THREE_VER = '0.160.0', THREE_LOCAL = path.join(CACHE, `three-${THREE_VER}.module.min.js`);
function threeLocal() {
  if (fs.existsSync(THREE_LOCAL)) return THREE_LOCAL;
  fs.mkdirSync(CACHE, { recursive: true });
  try {
    execSync(`npm pack three@${THREE_VER} --silent`, { cwd: CACHE, stdio: 'pipe' });
    execSync(`tar -xzf three-${THREE_VER}.tgz package/build/three.module.min.js`, { cwd: CACHE });
    fs.renameSync(path.join(CACHE, 'package/build/three.module.min.js'), THREE_LOCAL);
  } catch (e) {
    execSync(`curl -sSfL https://cdn.jsdelivr.net/npm/three@${THREE_VER}/build/three.module.min.js -o "${THREE_LOCAL}"`);
  }
  return THREE_LOCAL;
}
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
// ouvre une page ; o.largeur, o.hauteur, o.mobile (palier BAS du prototype)
async function ouvrir(fichier, o = {}) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: o.largeur ?? 1280, height: o.hauteur ?? 1400 }, deviceScaleFactor: 1, ...(o.mobile ? { userAgent: MOBILE_UA } : {}) });
  const logs = [];
  page.on('console', m => { if (!/Failed to load resource/.test(m.text())) logs.push(`[${m.type()}] ${m.text().slice(0, 2000)}`); });
  page.on('pageerror', e => logs.push(`[exception] ${e.message}`));
  const three = threeLocal();
  await page.route('**/*', r => {
    const u = r.request().url();
    if (u.includes(`three@${THREE_VER}/build/three.module.min.js`)) return r.fulfill({ path: three, contentType: 'text/javascript' });
    if (u.startsWith('file:')) return r.continue();
    return r.abort();   // polices et le reste : coupes, la page doit vivre sans
  });
  await page.goto('file://' + path.resolve(fichier));
  const hook = await page.waitForFunction(() => Object.keys(window).find(k => k.startsWith('__') && window[k] && typeof window[k].seek === 'function'), null, { timeout: 180000 })
    .then(h => h.jsonValue()).catch(() => null);
  return { browser, page, logs, hook };
}
// rejoue l'Art jusqu'a l'instant ms (depuis le debut de l'Art), dans une vue ; orbite = { az, el, dist, cy, cx } pour la vue libre
async function rejouer(page, hook, vue, ms, pendantArret = false, orbite = null) {
  await page.evaluate(([h, v, ms, st, o]) => window[h].seek(v, ms, st, o), [hook, vue, ms, pendantArret, orbite]);
}
async function cadre(page) {
  return page.evaluate(() => { const r = document.getElementById('viewport').getBoundingClientRect(); return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height }; });
}
module.exports = { ouvrir, rejouer, cadre, threeLocal };
