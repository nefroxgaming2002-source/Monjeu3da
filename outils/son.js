// Analyse du son d'un prototype, sans haut-parleur :
// 1. joue l'Art dans la page et note chaque Son.jouer et Son.ambiance a son instant reel (arrets sur coup compris) ;
// 2. fabrique les sons avec la synthese de la page (le code entre « /* <synthese> » et « /* </synthese> */ ») ;
// 3. rend la chaine de la page (compresseur, saturation, limiteur, reverberation, ambiance, baisses) dans un OfflineAudioContext ;
// 4. mesure et juge :
//    - par son : duree, pic, NaN, aigu tenu au-dessus de 1,5 kHz apres 0,5 s ;
//    - le rendu complet : courbe de niveau par 100 ms (brut, et au-dessus de 150 Hz : ce qu'entend un telephone),
//      grains au-dessus de 2 kHz (la « friture »), ecretage, ecart entre le silence et le sommet.
// Usage : node outils/son.js <page.html> [dossier pour sequence.wav et les sons un par un]
// Si la chaine audio de la page change (Son.preparer), reporter le changement dans rendre() ci-dessous.
const fs = require('fs'), path = require('path'), { ouvrir } = require('./commun');
const [,, fichier, dossier] = process.argv;
const SR = 44100;
const src = fs.readFileSync(fichier, 'utf8'), synth = src.slice(src.indexOf('/* <synthese>'), src.indexOf('/* </synthese> */'));
if (!synth) { console.log('ÉCHEC : pas de bloc /* <synthese> */ dans la page'); process.exit(1); }

function hp(x, fc, ordre = 2) { let y = x; for (let k = 0; k < ordre; k++) { const a = Math.exp(-2 * Math.PI * fc / SR), o = new Float32Array(y.length); let y1 = 0, x1 = 0; for (let i = 0; i < y.length; i++) { const v = a * (y1 + y[i] - x1); x1 = y[i]; y1 = v; o[i] = v; } y = o; } return y; }
const db = q => 10 * Math.log10(q + 1e-12);
function wav(chemin, L, R) {
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4); }
  fs.writeFileSync(chemin, b);
}

(async () => {
  const { browser, page, logs, hook } = await ouvrir(fichier, { largeur: 640, hauteur: 600 });
  if (!hook) { console.log('ÉCHEC crochet introuvable\n' + logs.join('\n')); process.exit(1); }
  const res = await page.evaluate(async ({ hook, synth, SR }) => {
    // 1. les evenements sonores, a leur instant reel
    const h = window[hook], ev = [];
    h.son.jouer = (nom, g = 1, envoi = 0.3, idx, baisse) => ev.push({ t: h.sim / 1000, f: 'jouer', nom, g, envoi, idx, baisse });
    h.son.ambiance = etat => ev.push({ t: h.sim / 1000, f: 'amb', etat });
    h.son.couper = () => {};
    h.seek('jeu', h.T.bout + 50);
    const tau0 = 0.5;   // l'Art commence apres 500 ms de garde
    // 2. la synthese
    const [creer, recettes] = new Function(synth + '; return [creerBruitages, toutesLesRecettes];')();
    const t0 = performance.now(), S = recettes(creer(SR, 4242)), tSynth = performance.now() - t0;
    const stats = [];
    const hpf = (x, fc) => { let y = x; for (let k = 0; k < 2; k++) { const a = Math.exp(-2 * Math.PI * fc / SR), o = new Float32Array(y.length); let y1 = 0, x1 = 0; for (let i = 0; i < y.length; i++) { const v = a * (y1 + y[i] - x1); x1 = y[i]; y1 = v; o[i] = v; } y = o; } return y; };
    for (const [k, v] of Object.entries(S)) (Array.isArray(v) ? v : [v]).forEach((s, i) => {
      if (k === 'reverb') return;
      let pk = 0, nan = 0, sq = 0; for (const c of [s.L, s.R]) for (let j = 0; j < c.length; j++) { const x = c[j]; if (!Number.isFinite(x)) nan++; else { pk = Math.max(pk, Math.abs(x)); sq += x * x; } }
      const hf = hpf(s.L, 1500), d = Math.round(0.5 * SR); let e = 0, tot = 0; for (let j = d; j < s.L.length; j++) { e += hf[j] * hf[j]; tot += s.L[j] * s.L[j]; }
      stats.push({ nom: Array.isArray(v) ? `${k}[${i}]` : k, dur: s.L.length / SR, pic: pk, rms: Math.sqrt(sq / (2 * s.L.length)), nan, aigu: tot > 1e-9 && s.L.length > d ? 10 * Math.log10(e / tot + 1e-12) : -99 });
    });
    // 3. la chaine de Son.preparer, hors ligne
    const D = Math.max(...ev.map(e => e.t)) + 4, ctx = new OfflineAudioContext(2, Math.round(D * SR), SR);
    const enBuffer = s => { const b = ctx.createBuffer(2, s.L.length, SR); b.copyToChannel(s.L, 0); b.copyToChannel(s.R, 1); return b; };
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -24; comp.knee.value = 6; comp.ratio.value = 5; comp.attack.value = 0.002; comp.release.value = 0.3;
    const chaleur = ctx.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) cv[i] = Math.tanh((i / 511.5 - 1) * 1.6) / Math.tanh(1.6); chaleur.curve = cv; chaleur.oversample = '2x';
    const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -1.5; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.12;
    const sortie = ctx.createGain(); sortie.gain.value = 0.95;
    const bus = ctx.createGain(); bus.connect(comp); comp.connect(chaleur); chaleur.connect(lim); lim.connect(sortie); sortie.connect(ctx.destination);
    const verb = ctx.createConvolver(); verb.buffer = enBuffer(S.reverb);
    const envoi = ctx.createGain(), retour = ctx.createGain(); retour.gain.value = 0.6; envoi.connect(verb); verb.connect(retour); retour.connect(bus);
    const B = {}; for (const [k, r] of Object.entries(S)) if (k !== 'reverb') B[k] = Array.isArray(r) ? r.map(enBuffer) : enBuffer(r);
    const ambF = ctx.createBiquadFilter(); ambF.type = 'lowpass'; ambF.frequency.value = 18000; const ambG = ctx.createGain(); ambG.gain.value = 0.22;
    if (B.ambiance) { const amb = ctx.createBufferSource(); amb.buffer = B.ambiance; amb.loop = true; amb.connect(ambF); ambF.connect(ambG); ambG.connect(bus); amb.start(0); }
    const actifs = [];
    for (const e of ev) {
      const t = e.t, vivants = actifs.filter(a => t < a.fin);
      if (e.f === 'amb') {
        const [g, f, tc] = e.etat === 'fige' ? [0.3, 380, 0.04] : e.etat === 'silence' ? [0, 300, 0.05] : [1, 18000, 0.35];
        ambG.gain.setTargetAtTime(g * 0.22, t, tc); ambF.frequency.setTargetAtTime(f, t, 0.05);
        if (e.etat === 'silence') for (const a of vivants) a.gn.gain.setTargetAtTime(a.g0 * 0.12, t, 0.06);
        retour.gain.setTargetAtTime(e.etat === 'silence' ? 0.12 : 0.6, t, e.etat === 'silence' ? 0.06 : 0.2);
        continue;
      }
      let b = B[e.nom]; if (!b) continue; if (Array.isArray(b)) b = b[e.idx ?? 0];
      if (e.baisse) for (const a of vivants) { a.niv *= e.baisse; a.gn.gain.setTargetAtTime(a.g0 * a.niv, t, 0.04); }
      const s = ctx.createBufferSource(); s.buffer = b; const gn = ctx.createGain(); gn.gain.value = e.g; s.connect(gn); gn.connect(bus); const se = ctx.createGain(); se.gain.value = e.envoi; gn.connect(se); se.connect(envoi);
      s.start(t); actifs.push({ gn, g0: e.g, niv: 1, fin: t + b.duration });
    }
    const r = await ctx.startRendering(), out = [];
    for (let c = 0; c < 2; c++) { const d = r.getChannelData(c), u = new Uint8Array(d.buffer.slice(0)); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); out.push(btoa(s)); }
    let cues = null;
    if (true) { cues = {}; for (const [k, v] of Object.entries(S)) if (k !== 'reverb') (Array.isArray(v) ? v : [v]).forEach((s, i) => { const enc = a => { const u = new Uint8Array(a.buffer.slice(0)); let z = ''; for (let j = 0; j < u.length; j += 8192) z += String.fromCharCode.apply(null, u.subarray(j, j + 8192)); return btoa(z); }; cues[Array.isArray(v) ? `${k}_${i + 1}` : k] = [enc(s.L), enc(s.R)]; }); }
    return { ev: ev.map(e => ({ ...e, t: e.t - tau0 })), stats, tSynth, out, cues, tau0 };
  }, { hook, synth, SR });
  await browser.close();
  const dec = s => { const u = Buffer.from(s, 'base64'); return new Float32Array(u.buffer, u.byteOffset, u.length / 4); };
  const L = dec(res.out[0]), R = dec(res.out[1]), n = L.length, m = new Float32Array(n); for (let i = 0; i < n; i++) m[i] = (L[i] + R[i]) / 2;
  // par son
  console.log(`synthèse : ${Math.round(res.tSynth)} ms\n\nSons (pic, NaN, aigu tenu au-dessus de 1,5 kHz après 0,5 s) :`);
  for (const s of res.stats) console.log(`  ${s.nom.padEnd(16)} ${s.dur.toFixed(2)} s  pic ${s.pic.toFixed(2)}  rms ${s.rms.toFixed(3)}  NaN ${s.nan}  aigu ${s.aigu.toFixed(0)} dB`);
  console.log('\nÉvénements (temps réel depuis le début de l\'Art, arrêts sur coup compris) :');
  for (const e of res.ev) console.log(e.f === 'amb' ? `  ${String(Math.round(e.t * 1000)).padStart(6)} ms  ambiance ${e.etat}` : `  ${String(Math.round(e.t * 1000)).padStart(6)} ms  ${e.nom}${e.idx !== undefined ? '[' + e.idx + ']' : ''}  volume ${e.g}  envoi ${e.envoi}${e.baisse ? '  baisse les autres à ' + e.baisse : ''}`);
  // le rendu complet
  const h150 = hp(m, 150), h2k = hp(m, 2000, 3), W = Math.round(0.1 * SR), nw = Math.floor(n / W), lv = [], l150 = [];
  for (let k = 0; k < nw; k++) { let a = 0, b = 0; for (let i = k * W; i < (k + 1) * W; i++) { a += m[i] * m[i]; b += h150[i] * h150[i]; } lv.push(db(a / W)); l150.push(db(b / W)); }
  // grains : trames de 1 ms au-dessus de 2 kHz qui depassent de 9 dB la mediane des 40 ms autour, et -50 dB
  const w1 = 44, n1 = Math.floor(n / w1), e1 = new Float32Array(n1); for (let k = 0; k < n1; k++) { let q = 0; for (let i = k * w1; i < (k + 1) * w1; i++) q += h2k[i] * h2k[i]; e1[k] = q / w1 + 1e-14; }
  const grains = new Array(nw).fill(0); let gTot = 0;
  for (let k = 20; k < n1 - 20; k++) { const v = Array.from(e1.subarray(k - 20, k + 20)).sort((a, b) => a - b); if (e1[k] > 8 * v[20] && e1[k] >= e1[k - 1] && e1[k] >= e1[k + 1] && e1[k] > 1e-5) { grains[Math.min(nw - 1, Math.floor(k * w1 / W))]++; gTot++; } }
  let ecr = 0; for (let i = 0; i < n; i++) if (Math.abs(L[i]) >= 1 || Math.abs(R[i]) >= 1) ecr++;
  const off = res.tau0, marque = k => res.ev.filter(e => e.f === 'jouer' && Math.floor((e.t + off) * 10) === k).map(e => e.nom + (e.idx !== undefined ? e.idx + 1 : '')).join(' ');
  console.log('\nRendu complet (temps depuis le début de l\'Art ; niveau brut / au-dessus de 150 Hz ; grains de friture) :');
  for (let k = 0; k < nw; k++) { const t = Math.round((k / 10 - off) * 1000); console.log(`${String(t).padStart(6)} ms ${lv[k].toFixed(0).padStart(4)} /${l150[k].toFixed(0).padStart(4)} dB ${'#'.repeat(Math.max(0, Math.round((l150[k] + 50) / 2))).padEnd(24)} ${grains[k] ? 'grains ' + grains[k] : ''}  ${marque(k)}`); }
  // verdicts
  const v = [];
  const nan = res.stats.reduce((a, s) => a + s.nan, 0); v.push(`${nan ? 'ÉCHEC' : 'ok'} NaN : ${nan}`);
  v.push(`${ecr ? 'ÉCHEC' : 'ok'} écrêtage en sortie : ${ecr} échantillons`);
  const gMax = Math.max(...grains); v.push(`${gMax > 4 || gTot > 20 ? 'ÉCHEC' : 'ok'} friture : ${gTot} grains en tout, ${gMax} au plus par 100 ms (un impact en donne 1 ou 2)`);
  const ambs = res.ev.filter(e => e.f === 'amb');
  const sil = ambs.findIndex(e => e.etat === 'silence');
  const sommet = Math.max(...l150);
  if (sil >= 0) {
    const a = Math.ceil((ambs[sil].t + off + 0.15) * 10), fin = ambs.slice(sil + 1).find(e => e.etat !== 'silence'), b = Math.floor(((fin ? fin.t : res.ev[res.ev.length - 1].t) + off - 0.35) * 10);
    const fen = l150.slice(a, Math.max(a + 1, b)).sort((x, y) => x - y), med = fen[Math.floor(fen.length / 2)];
    v.push(`${sommet - med >= 12 ? 'ok' : 'ÉCHEC'} silence : ${(sommet - med).toFixed(0)} dB sous le sommet (au moins 12 ; viser 15 et plus)`);
  }
  const top = l150.map((x, k) => [x, k]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([x, k]) => `${Math.round((k / 10 - off) * 1000)} ms (${x.toFixed(0)} dB)`);
  v.push(`   les trois fenêtres les plus fortes : ${top.join(', ')}`);
  const aigus = res.stats.filter(s => s.aigu > -12 && s.nom !== 'ambiance'); v.push(`${aigus.length ? 'attention' : 'ok'} aigu tenu : ${aigus.length ? aigus.map(s => s.nom + ' ' + s.aigu.toFixed(0) + ' dB').join(', ') : 'aucun son au-dessus de -12 dB'}`);
  console.log('\nVerdict :\n' + v.join('\n'));
  if (dossier) {
    fs.mkdirSync(dossier, { recursive: true }); wav(path.join(dossier, 'sequence.wav'), L, R);
    for (const [k, [a, b]] of Object.entries(res.cues)) wav(path.join(dossier, k + '.wav'), dec(a), dec(b));
    console.log(`\nWAV écrits dans ${dossier}`);
  }
  if (logs.some(l => /\[(error|exception)\]/.test(l))) console.log('\nConsole :\n' + logs.filter(l => /\[(error|exception)\]/.test(l)).join('\n'));
  process.exit(v.some(l => l.startsWith('ÉCHEC')) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
