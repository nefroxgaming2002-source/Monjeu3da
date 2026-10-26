// Captures de controle a des instants precis de l'Art.
// Usage : node outils/captures.js <page.html> <dossier> "vue:ms[:s][:az,el,dist,cy,cx];..." [largeur] [mobile]
//   vue : cine, jeu, cote, face, dos, dessus, libre, mosaique ; ms : instant depuis le debut de l'Art ;
//   s : capture pendant l'arret sur coup ; az,el,dist,cy,cx : orbite de la vue libre (gros plans).
const fs = require('fs'), path = require('path'), { ouvrir, rejouer, cadre } = require('./commun');
const [,, fichier, dossier, liste, largeur = '1280', mobile] = process.argv;
(async () => {
  fs.mkdirSync(dossier, { recursive: true });
  const { browser, page, logs, hook } = await ouvrir(fichier, { largeur: +largeur, mobile: mobile === 'mobile' });
  if (!hook) { console.log('crochet introuvable\n' + logs.join('\n')); process.exit(1); }
  for (const s of liste.split(';').filter(Boolean)) {
    const [v, ms, st, orb] = s.split(':');
    let o = null; if (orb) { const [az, el, dist, cy, cx] = orb.split(',').map(Number); o = { az, el, dist, cy, cx }; }
    await rejouer(page, hook, v, +ms, st === 's', o);
    const nom = `${v}_${ms}${st === 's' ? '_s' : ''}${o ? '_' + orb.replace(/,/g, '_') : ''}.png`;
    await page.screenshot({ path: path.join(dossier, nom), clip: await cadre(page), fullPage: true, timeout: 180000 });
    console.log('ok', nom);
  }
  if (logs.length) console.log(logs.slice(0, 30).join('\n'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
