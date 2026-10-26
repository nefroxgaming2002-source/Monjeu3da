// Exporte les bruitages du prototype en WAV 44,1 kHz 16 bits stereo, prets pour Godot.
// Usage : node prototypes/sons/export_wav.js prototypes/taille-rouge.html prototypes/sons/taille-rouge
const fs = require('fs');
const [,, page, dossier] = process.argv;
const src = fs.readFileSync(page, 'utf8');
const [creer, recettes] = new Function(src.slice(src.indexOf('/* <synthese>'), src.indexOf('/* </synthese> */')) + '; return [creerBruitages, toutesLesRecettes];')();
const SR = 44100, o = recettes(creer(SR, 4242));
fs.mkdirSync(dossier, { recursive: true });
function wav(nom, s) {
  const n = s.L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s.L[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s.R[i])) * 32767), 46 + i * 4); }
  fs.writeFileSync(`${dossier}/${nom}.wav`, b);
  console.log(nom.padEnd(26), (n / SR).toFixed(2), 's');
}
const noms = { charge660: 'taille_rouge_charge_gel', charge240: 'taille_rouge_charge', lacher: 'taille_rouge_lacher', ruee: 'taille_rouge_ruee', impact: 'taille_rouge_impact',
  battement: 'taille_rouge_battement', aspiration: 'taille_rouge_aspiration', eclat: 'taille_rouge_eclat', chiburi: 'taille_rouge_chiburi', ambiance: 'ambiance_vent_boucle' };
for (const [k, v] of Object.entries(o)) {
  if (k === 'reverb') continue;
  if (Array.isArray(v)) v.forEach((s, i) => wav(`taille_rouge_entaille_${i + 1}`, s)); else wav(noms[k], v);
}
