// Controle d'une page de prototype, avant de la livrer :
// 1. aucune erreur ni avertissement en console, sur tout le deroule de l'Art (une image toutes les 400 ms) ;
// 2. la mise en page tient a 390 px (telephone, palier BAS) et a 1280 px : pas de defilement horizontal, la scene est visible ;
// 3. le son s'active (synthese dans un worker), puis se coupe.
// Usage : node outils/controle.js <page.html> [dossier pour les captures de page]
const fs = require('fs'), path = require('path'), { ouvrir, rejouer } = require('./commun');
const [,, fichier, dossier] = process.argv;
(async () => {
  const bilan = [];
  // 1. tout le deroule, vue cinema puis vue de jeu
  {
    const { browser, page, logs, hook } = await ouvrir(fichier, { largeur: 960, hauteur: 900 });
    if (!hook) { console.log('ÉCHEC crochet introuvable\n' + logs.join('\n')); process.exit(1); }
    const bout = await page.evaluate(h => window[h].T.bout, hook);
    // chaque appel rend une image (lent sous SwiftShader) : un instant toutes les 400 ms en cinema, trois en vue de jeu
    for (let ms = 0; ms <= bout; ms += 400) await rejouer(page, hook, 'cine', ms);
    for (const ms of [bout * 0.25, bout * 0.5, bout * 0.75]) await rejouer(page, hook, 'jeu', Math.round(ms));
    const err = logs.filter(l => /\[(error|warning|exception)\]/.test(l));
    bilan.push(`${err.length ? 'ÉCHEC' : 'ok'} console sur ${Math.round(bout)} ms, vues cinéma et jeu${err.length ? '\n  ' + err.slice(0, 15).join('\n  ') : ''}`);
    await browser.close();
  }
  // 2. mise en page
  for (const [largeur, mobile] of [[390, true], [1280, false]]) {
    const { browser, page, logs } = await ouvrir(fichier, { largeur, hauteur: 900, mobile });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => { const v = document.getElementById('viewport').getBoundingClientRect(); return { deborde: document.documentElement.scrollWidth - window.innerWidth, vw: Math.round(v.width), vh: Math.round(v.height), x: Math.round(v.x) }; });
    const ok = m.deborde <= 0 && m.vw > 300 && m.x >= 12;
    bilan.push(`${ok ? 'ok' : 'ÉCHEC'} mise en page ${largeur} px : débordement ${m.deborde} px, scène ${m.vw}×${m.vh}, marge ${m.x} px`);
    if (dossier) { fs.mkdirSync(dossier, { recursive: true }); await page.screenshot({ path: path.join(dossier, `page_${largeur}.png`), fullPage: true, timeout: 180000 }); }
    const err = logs.filter(l => /\[(error|exception)\]/.test(l)); if (err.length) bilan.push('  ' + err.slice(0, 5).join('\n  '));
    await browser.close();
  }
  // 3. le son
  {
    const { browser, page, logs } = await ouvrir(fichier, { largeur: 1280, hauteur: 900 });
    const t0 = Date.now(); await page.click('#son');
    const pret = await page.waitForFunction(() => document.getElementById('son').textContent === 'Son activé', null, { timeout: 90000 }).then(() => true).catch(() => false);
    const via = await page.evaluate(() => window.__sonVia);
    await page.waitForTimeout(3000); await page.click('#son'); await page.waitForTimeout(300);
    const coupe = await page.textContent('#son');
    const err = logs.filter(l => /\[(error|exception)\]/.test(l));
    bilan.push(`${pret && via === 'worker' && coupe === 'Son coupé' && !err.length ? 'ok' : 'ÉCHEC'} son : prêt en ${Date.now() - t0} ms via ${via}, puis « ${coupe} »${err.length ? '\n  ' + err.join('\n  ') : ''}`);
    await browser.close();
  }
  console.log(bilan.join('\n'));
  process.exit(bilan.some(l => l.startsWith('ÉCHEC')) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
