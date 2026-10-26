// ================================================================== mise en scene
// Durees supposees (a caler sur arts.json) : anticipation 760 ms (tissage, couture), active 200 ms, recuperation 600 ms.
const T = { tresse: 150, lancer: 520, act: 760, eclot: 760, rec: 960, fin: 1560, tension: 1150, silence: 1240, batt: [1330, 1560], flor: 1900, spores: 2250, coupe: 2900, bout: 3800, points: [630, 695] };
let vue = 'cine', vitesse = 1, boucle = true, run = null;
const IDLE = 500;
// ou en est le dard sur son chemin (abscisse en metres), -1 tant qu'il est dans les mains
function dardS(t) {
  if (t < T.lancer || !CHEMIN.pret) return -1;
  if (t < T.eclot) return CHEMIN.M.C * Math.pow(clamp((t - T.lancer) / (T.eclot - T.lancer)), 1.08);
  return CHEMIN.M.C + (CHEMIN.M.haut - CHEMIN.M.C) * easeOutCubic(clamp((t - T.eclot) / 130));
}
// un chemin provisoire, pour la frise : le vrai part de la main au moment du lancer
CHEMIN.construire(V3(TISSEUSE.x + 0.95, 0.95, 0.15));
T.points = [CHEMIN.M.X1, CHEMIN.M.X2].map(s => Math.round(T.lancer + (T.eclot - T.lancer) * Math.pow(s / CHEMIN.M.C, 1 / 1.08)));
// les poses des mains, dans le repere du buste (devant +x, droite +z) : une suite de cles, chacune part de la precedente
const EPG = V3(0.06, 1.3, -0.25), EPD = V3(0.06, 1.3, 0.25);
function cles(t, depart, liste) {
  const p = depart.clone();
  for (const [t0, t1, cible, ease] of liste) { const k = clamp((t - t0) / (t1 - t0)); if (k <= 0) break; p.lerp(cible, (ease ?? easeInOut)(k)); }
  return p;
}
function mainsLocales(t) {
  const garde = [V3(0.16, 0.88, -0.28), V3(0.16, 0.88, 0.28)];
  if (t < 0) return garde;
  // le tissage : les mains tournent l'une autour de l'autre devant la poitrine, et le cercle se resserre avec la tresse
  const th = t * 0.026, amp = 0.15 - 0.06 * smooth(T.tresse, T.lancer, t), M = V3(0.46, 1.12, 0);
  const tG = M.clone().add(V3(0.03 * Math.sin(th * 2), amp * Math.sin(th), -amp * Math.cos(th) - 0.05)), tD = M.clone().add(V3(-0.03 * Math.sin(th * 2), -amp * Math.sin(th), amp * Math.cos(th) + 0.05));
  const ouvreG = V3(0.32, 1.34, -0.5), ouvreD = V3(0.32, 1.34, 0.5);
  const G = cles(t, garde[0], [[0, 90, tG], [T.lancer, T.lancer + 200, V3(0.12, 1.02, -0.36)], [T.tension, T.tension + 140, V3(0.06, 1.12, -0.38), easeOutCubic],
    [T.flor - 100, T.flor + 500, ouvreG], [T.coupe - 300, T.coupe - 60, V3(0.52, 1.14, -0.02)], [T.coupe + 160, T.coupe + 760, garde[0]]]);
  const D = cles(t, garde[1], [[0, 90, tD], [T.lancer - 40, T.lancer + 50, V3(0.8, 0.6, 0.12), easeOutCubic], [T.lancer + 50, T.lancer + 270, V3(0.62, 0.98, 0.16)],
    [T.tension, T.tension + 140, V3(-0.14, 1.12, 0.3), easeOutCubic], [T.flor - 100, T.flor + 500, ouvreD], [T.coupe - 300, T.coupe - 60, V3(0.52, 1.12, 0.07)], [T.coupe + 160, T.coupe + 760, garde[1]]]);
  return [G, D];
}
let mainsCache = null;
function mainGauche() { return mainsCache ? mainsCache[0].clone() : corpsJ.localToWorld(V3(0.46, 1.12, -0.12)); }
function mainDroite() { return mainsCache ? mainsCache[1].clone() : corpsJ.localToWorld(V3(0.46, 1.12, 0.12)); }
function poserBras(b, epaule, main) {
  const e = corpsJ.localToWorld(epaule.clone()), m = corpsJ.localToWorld(main.clone()), d = m.clone().sub(e), L = d.length();
  b.manche.position.copy(e).addScaledVector(d, 0.5); b.manche.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); b.manche.scale.set(1, L, 1);
  b.main.position.copy(m); b.main.quaternion.copy(b.manche.quaternion);
  return m;
}
function poseJoueur() {
  const t = run.tau;
  const elan = smooth(T.lancer - 40, T.lancer + 60, t) * (1 - smooth(T.lancer + 300, T.fin, t)), tire = smooth(T.tension, T.tension + 140, t) * (1 - smooth(T.flor - 100, T.flor + 400, t));
  const souffle = Math.sin(run.sim * 0.0021) * 0.012;
  joueur.position.set(TISSEUSE.x + 0.24 * elan - 0.14 * tire, SOL_Y + souffle - 0.05 * elan, TISSEUSE.z);
  corpsJ.rotation.set(0, 0.1 * Math.sin(t * 0.026) * (t > 0 && t < T.lancer ? 1 : 0) - 0.18 * elan, -0.08 - 0.2 * elan + 0.2 * tire + 0.08 * smooth(T.flor, T.flor + 500, t) * (1 - smooth(T.coupe, T.coupe + 600, t)));
  joueur.updateMatrixWorld(true);
  const [G, D] = mainsLocales(t);
  mainsCache = [poserBras(brasG, EPG, G), poserBras(brasD, EPD, D)];
}
function poseEnnemis() {
  const t = run.tau;
  ennemis.forEach((e, i) => {
    const dt = t - T.eclot, pris = dt >= 0 ? 1 : 0, choc = pris * Math.exp(-dt / 140) * Math.min(1, dt / 25);
    const genou = smooth(T.flor + 380 + 90 * i, T.flor + 1100 + 90 * i, t) * (1 - smooth(T.bout - 500, T.bout - 60, t));
    const vie = pris ? 0 : Math.sin(t * 0.004 + i * 2.1) * 0.025;   // avant l'eclosion, elles respirent ; prises, elles ne bougent plus
    const serre = smooth(T.tension, T.tension + 200, t) * (1 - smooth(T.flor, T.flor + 300, t));
    e.racine.position.set(e.pos0.x, SOL_Y + 0.07 * choc + 0.04 * pris * (1 - genou) - 0.32 * genou, e.pos0.z);
    e.racine.rotation.y = e.ry + 0.12 * choc * (i - 1);
    e.penche.rotation.z = vie - 0.14 * choc + 0.03 * Math.sin(t * 0.09 + i) * serre - 0.34 * genou;
    e.penche.rotation.x = 0.05 * Math.sin(t * 0.07 + i * 2) * serre;
    e.racine.updateMatrixWorld(true);
    const inf = smooth(T.eclot + 60, T.flor, t) * 0.65 + 0.35 * smooth(T.flor, T.flor + 900, t);
    uInf.value[i].set(e.pos0.x, 1.25, e.pos0.z, inf * (1 - smooth(T.bout - 450, T.bout - 60, t)));
  });
  for (const m of matsEnnemi) { m.emissive.setRGB(0.5, 0.2, 1); m.emissiveIntensity = run.flash * 0.035; }
}
function shake(s) { if (!reduceMotion) run.trauma = Math.min(1, run.trauma + s); }
function hitstop(ms) { run.hitstop = ms; run.stopLabel = ms; }
function centreEcran(p) { const v = p.clone().project(camera); run.centre.set(v.x * 0.5 + 0.5, v.y * 0.5 + 0.5); }
const POUSSIERE = [0.03, 0.031, 0.026];
// les spores : des points violets qui derivent, montent, puis retombent doucement
function spores(p, n, o = {}) {
  for (let i = 0; i < nq(n); i++) {
    const v = V3(rand(-1, 1), rand(-0.2, 1), rand(-1, 1)).multiplyScalar((o.speed ?? 0.8) * rand(0.3, 1)).add(o.v ?? V3()), k = rand(0.9, 2.4) * (o.eclat ?? 1);
    points.spawn({ p: p.clone().add(V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(o.jitter ?? 0.08)), v, c: rand() < 0.2 ? [CORE.x * k, CORE.y * k, CORE.z * k] : [EMBER.x * k, EMBER.y * k, EMBER.z * k], a: 0,
      size: rand(0.008, 0.022) * (o.taille ?? 1), life: rand(1.0, 2.3) * (o.life ?? 1), grav: o.grav ?? -0.04, drag: o.drag ?? 1.3, turb: o.turb ?? 1.4, kind: 0, attract: o.attract, force: o.force });
  }
}
// le nuage de spores : une fumee sombre, lourde et transparente, piquee de points violets
function nuage(p, n, o = {}) {
  for (let i = 0; i < nq(n); i++) sprites.spawn({ p: p.clone().add(V3(rand(-1, 1), rand(-0.4, 1), rand(-1, 1)).multiplyScalar(o.jitter ?? 0.2)), v: (o.v ?? V3()).clone().add(V3(rand(-1, 1), rand(-0.3, 1), rand(-1, 1)).multiplyScalar(o.speed ?? 0.5)),
    size: rand(0.5, 1.0) * (o.size ?? 0.6), grow: o.grow ?? 1.6, life: rand(1.1, 1.8) * (o.life ?? 1), a: o.a ?? 0.6, glow: o.glow ?? 0.5, drag: o.drag ?? 1.6, rise: o.rise ?? 0.1 });
}
// la seve : des gouttes sombres qui volent, retombent et tachent les dalles
function seve(p, dir, n, o = {}) {
  for (let i = 0; i < nq(n); i++) {
    const v = dir.clone().normalize().add(V3(rand(-1, 1), rand(-0.4, 1), rand(-1, 1)).multiplyScalar(o.spread ?? 0.7)).normalize().multiplyScalar((o.speed ?? 4) * rand(0.4, 1.2));
    streaks.spawn({ p: p.clone().add(V3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(o.jitter ?? 0.05)), v, c: [0.02, 0.004, 0.03], a: 0.9, len: 0.035, w: rand(0.008, 0.02), life: rand(0.7, 1.3), grav: 7, drag: 1.1, ink: true });
  }
}
// des filaments de seve lumineuse, courts, qui s'eteignent vite
function filaments(p, dir, n, speed = 7) {
  for (let i = 0; i < nq(n); i++) {
    const v = dir.clone().normalize().add(V3(rand(-1, 1), rand(-0.5, 1), rand(-1, 1)).multiplyScalar(0.7)).normalize().multiplyScalar(speed * rand(0.4, 1.2)), k = rand(1.6, 3.2);
    streaks.spawn({ p, v, c: [EMBER.x * k, EMBER.y * k, EMBER.z * k], a: 0, len: 0.05, w: rand(0.008, 0.016), life: rand(0.2, 0.45), grav: 4, drag: 2.6 });
  }
}
function mottes(p, n, force) { for (let i = 0; i < nq(n); i++) { const a = rand(0, 6.28); debris.spawn({ p: p.clone().add(V3(Math.cos(a) * rand(0, 0.3), rand(0, 0.3), Math.sin(a) * rand(0, 0.3))), v: V3(Math.cos(a) * rand(0.3, 1) * force, rand(1.5, 3.5) * force * 0.6, Math.sin(a) * rand(0.3, 1) * force), s: rand(0.03, 0.06), hot: true, life: 2.2 }); } }
function cailloux(p, n, force) { for (let i = 0; i < nq(n); i++) { const a = rand(0, 6.28); debris.spawn({ p: p.clone().add(V3(Math.cos(a) * rand(0.05, 0.4), SOL_Y + 0.03, Math.sin(a) * rand(0.05, 0.4))), v: V3(Math.cos(a) * rand(0, 1) * force, rand(1.2, 3) * force, Math.sin(a) * rand(0, 1) * force), s: rand(0.018, 0.045), hot: false, life: 1.6 }); } }
function bouffee(p, n, o = {}) { // la poussiere de pierre qui sort des joints
  for (let i = 0; i < nq(n); i++) sprites.spawn({ p: p.clone().add(V3(rand(-1, 1) * (o.jitter ?? 0.2), rand(0.02, 0.12), rand(-1, 1) * (o.jitter ?? 0.2))), v: V3(rand(-0.4, 0.4), rand(0.2, 0.7) * (o.force ?? 1), rand(-0.4, 0.4)), size: rand(0.18, 0.32) * (o.size ?? 1), grow: 1.8, life: rand(0.8, 1.3), kind: 2, col: POUSSIERE, a: o.a ?? 0.3, drag: 2.4, rise: 0.12 });
}
function anneauPoussiere(r0, n, vitesse, o = {}) {
  for (let i = 0; i < nq(n); i++) {
    const a = i / nq(n) * Math.PI * 2 + rand(-0.1, 0.1), d = V3(Math.cos(a), 0, Math.sin(a));
    sprites.spawn({ p: d.clone().multiplyScalar(r0).add(V3(o.centre ? o.centre.x : 0, SOL_Y + rand(0.1, 0.35), o.centre ? o.centre.z : 0)), v: d.multiplyScalar(vitesse * rand(0.7, 1.2)).add(V3(0, rand(0.2, 0.8), 0)), size: rand(0.45, 0.8) * (o.size ?? 1), grow: 1.6, life: rand(0.8, 1.3) * (o.life ?? 1), kind: 2, col: POUSSIERE, a: o.a ?? 0.55, drag: 2.6, rise: 0.15 });
  }
}
const TROU_T = new Array(6).fill(Infinity);
function ouvrirTrou(k, t) { if (TROU_T[k] === Infinity) TROU_T[k] = t; }

function start() {
  Son.couper();
  rng = mulberry32(808);
  for (const grp of [fx, distFx]) for (const c of [...grp.children]) { grp.remove(c); c.traverse(o => { if (o.material && o.material.dispose) o.material.dispose(); if (o.isMesh && o.geometry) o.geometry.dispose(); }); }
  panneaux.length = 0;
  points.clear(); streaks.clear(); splats.clear(); sprites.clear(); debris.clear();
  run = { tau: -IDLE, sim: 0, hitstop: 0, stopLabel: 0, trauma: 0, inv: 0, duo: 0, lines: 0, rad: 0, ca: 0, fovPunch: 0, dim: 0, desat: 0, flash: 0, souffle: 0, trouble: 0, fige: 0, light: null, flags: {}, centre: new THREE.Vector2(0.5, 0.5), done: false, wait: 0, fade: 0, lastSeed: -999, lineSeed: 0 };
  FILS.eteindre(); for (const fr of franges) fr.b.actif = true; resetFils();
  TROU_T.fill(Infinity);
  const s = uSol; s.uAnnonce.value = 0; s.uTrousLueur.value = 0; s.uFrontS.value = -1; s.uInfR.value = 0; s.uInfP.value = 0; s.uInfLueur.value = 0; s.uEclot.value = 0; s.uTension.value = 0; s.uSouffle.value = 0; s.uMortier.value = 0; s.uFade.value = 1; s.uTremble.value = 0;
  for (const v of s.uTrous.value) v.z = 0;
  for (const g of uInf.value) g.w = 0;
  epine.visible = false;
  mainsCache = null; poseJoueur(); poseEnnemis();
  drawTimeline();
}

function step(dtMs) {
  run.sim += dtMs; run.dtLast = dtMs;
  const s = dtMs / 1000;
  run.trauma = Math.max(0, run.trauma - s * 1.6);
  if (run.inv > 0) run.inv -= dtMs; else run.duo = Math.max(0, run.duo - dtMs);
  run.lines = Math.max(0, run.lines - s * 3.2); run.rad *= Math.exp(-s * 7); run.ca *= Math.exp(-s * 6); run.fovPunch *= Math.exp(-s * 6);
  if (run.sim - run.lastSeed > 45) { run.lineSeed = rng() * 100; run.lastSeed = run.sim; }
  if (run.hitstop > 0) { run.hitstop -= dtMs; return; }
  run.stopLabel = 0;
  if (run.done) { run.wait += dtMs; run.fade = Math.min(1, run.wait / 260); if (boucle && run.wait > 320) { start(); run.fade = 1; } return; }
  run.fade = Math.max(0, run.fade - s * 5);
  run.tau += dtMs;
  scenario(run.tau, dtMs);
  poseJoueur(); poseEnnemis();
  majCape(run.souffle, run.sim / 1000);
  points.update(s); streaks.update(s); splats.update(s); sprites.update(s); debris.update(s); sporesAir.update(s, run.sim / 1000);
  for (let i = panneaux.length - 1; i >= 0; i--) { const p = panneaux[i]; p.age += s; const u = clamp(p.age / p.life); p.mat.uniforms.uT.value = u; p.m.scale.setScalar(lerp(p.s0, p.s1, easeOutCubic(u))); if (p.follow) p.m.position.copy(p.follow()); if (p.age > p.life) { p.m.parent.remove(p.m); p.mat.dispose(); p.m.geometry.dispose(); panneaux.splice(i, 1); } }
  const tt = run.sim / 1000;
  for (const grp of [fx, distFx]) for (const o of grp.children) if (o.material && o.material.uniforms && o.material.uniforms.uTime) o.material.uniforms.uTime.value = tt;
  uSol.uTime.value = tt; sky.material.uniforms.uTime.value = tt;
  for (const b of brumes) b.material.uniforms.uTime.value += s;
  if (run.light) { run.light.age += s; impactLight.position.copy(run.light.p); impactLight.intensity = run.light.peak * Math.exp(-run.light.age * (run.light.decay ?? 5)); } else impactLight.intensity = 0;
  if (run.tau > T.bout) run.done = true;
}

const sA = V3(), sB = V3();
function scenario(t, dt) {
  const F = run.flags, so = uSol, M = CHEMIN.M, haut = V3(C_ZONE.x, SOL_Y + H_COL, C_ZONE.z);
  // ---------------------------------------------------------------- tissage : le mycelium monte vers les mains, le dard se tresse
  if (t >= 0 && !F.tissage) { F.tissage = 1; Son.ambiance('fige'); Son.jouer('tissage', 0.85, 0.45); }
  uBrode.value = smooth(0, 220, t) * (1 - smooth(T.lancer, T.lancer + 400, t)) + 0.6 * smooth(T.tension, T.tension + 200, t) * (1 - smooth(T.flor, T.flor + 500, t));
  const centreMains = mainGauche().add(mainDroite()).multiplyScalar(0.5);
  if (t > 30 && t < T.lancer - 30 && rng() < dt * 0.3) {   // les spores convergent vers les mains
    const a = rand(-1.8, 1.8), r = rand(0.8, 2.3);
    spores(V3(TISSEUSE.x + Math.cos(a) * r, SOL_Y + rand(0.05, 1.6), TISSEUSE.z + Math.sin(a) * r), 1, { speed: 0.1, life: 0.5, attract: centreMains, force: 22, drag: 3, turb: 0.4 });
  }
  if (t > 60 && t < T.lancer && rng() < dt * 0.02) nuage(centreMains, 1, { size: 0.22, a: 0.25, speed: 0.15, life: 0.6, glow: 0.4 });
  so.uAnnonce.value = smooth(260, 640, t) * (1 - smooth(T.eclot + 150, T.eclot + 700, t));
  if (t > 300 && t < T.eclot && rng() < dt * 0.05) { const a = rand(0, 6.28), r = rand(0, 1.3); spores(V3(C_ZONE.x + Math.cos(a) * r, SOL_Y + 0.05, C_ZONE.z + Math.sin(a) * r), 1, { speed: 0.15, v: V3(0, 0.35, 0), life: 0.9 }); }
  // ---------------------------------------------------------------- lancer et couture : le dard plonge, file sous la place, ressort deux fois
  if (t >= T.lancer && !F.lancer) {
    F.lancer = 1; Son.jouer('lancer', 0.9, 0.35);
    const dir = COUTURE.E0.clone().sub(centreMains).normalize();
    CHEMIN.construire(centreMains.clone().addScaledVector(dir, 0.34));
    T.points = [M.X1, M.X2].map(s => Math.round(T.lancer + (T.eclot - T.lancer) * Math.pow(s / M.C, 1 / 1.08))); drawTimeline();
    run.souffle = 0.7; filaments(mainDroite(), dir, 8, 4); seve(mainDroite(), dir, 6, { speed: 3 });
  }
  const sd = dardS(t);
  so.uFrontS.value = sd < 0 ? -1 : sousTerre(sd);
  const passages = [['E0', 0, 1.0], ['X1', 1, 0.8], ['E1', 2, 0.45], ['X2', 3, 0.8], ['E2', 4, 0.45]];
  for (const [nom, k, force] of passages) {
    if (F['p' + nom] || sd < M[nom]) continue;
    F['p' + nom] = 1; ouvrirTrou(k, t);
    const p = TROUS[k], sort = nom[0] === 'X';
    cailloux(p, sort ? 9 : 6, 0.7 * force); bouffee(p, sort ? 5 : 3, { a: 0.5 }); spores(p.clone().setY(SOL_Y + 0.05), 10, { speed: 0.9 * force, v: V3(0, 0.6, 0) });
    if (sort) { Son.jouer('point', 0.75, 0.35, k === 1 ? 0 : 1); seve(p, V3(0.5, 1, 0), 8, { speed: 3.5 }); filaments(p, V3(0.4, 1, 0), 8, 4); shake(0.15); }
    else if (k === 0) { shake(0.25); seve(p, V3(0.3, 1, 0), 6, { speed: 2.5 }); }
    run.light = { p: p.clone().setY(0.7), peak: sort ? 0.5 : 0.3, age: 0 };
  }
  if (sd >= M.E0 && sd < M.C && rng() < dt * 0.6) { const f = CHEMIN.at(sd, sA); if (f.y < SOL_Y) bouffee(V3(f.x, SOL_Y, f.z), 1, { jitter: 0.3, size: 0.6, a: 0.3, force: 1.4 }); }
  if (sd >= M.E0 && sd < M.C && rng() < dt * 0.15) { const f = CHEMIN.at(sd, sA); if (f.y < SOL_Y) cailloux(V3(f.x, 0, f.z), 1, 0.4); }
  if (sd >= 0 && sd < M.C && rng() < dt * 0.25) { const f = CHEMIN.at(sd, sA); if (f.y > SOL_Y) spores(f, 1, { speed: 0.3, life: 0.7 }); }
  so.uTremble.value = smooth(T.lancer, T.lancer + 60, t) * (1 - smooth(T.eclot, T.eclot + 200, t)) * 0.8;
  for (let k = 0; k < 6; k++) so.uTrous.value[k].z = TROU_T[k] === Infinity ? 0 : easeOutCubic(clamp((t - TROU_T[k]) / 120));
  so.uTrousLueur.value = smooth(T.lancer, T.eclot, t) * (1 - smooth(T.flor + 500, T.bout - 300, t)) + 0.6 * Math.exp(-Math.abs(t - T.eclot) / 200);
  // ---------------------------------------------------------------- eclosion : la colonne jaillit et se tisse autour des betes
  if (t >= T.eclot && !F.eclot) {
    F.eclot = 1; ouvrirTrou(5, t);
    hitstop(110); shake(0.85); run.flash = 1; run.fovPunch = 5;
    Son.jouer('eclosion', 1, 0.5, undefined, 0.45);
    const c = C_ZONE.clone();
    spores(c.clone().setY(0.6), 110, { speed: 3.0, v: V3(0, 2.2, 0), eclat: 1.4, life: 1.2, jitter: 0.3 });
    nuage(c.clone().setY(0.5), 8, { size: 0.8, speed: 1.2, a: 0.4, glow: 0.4, jitter: 0.4 });
    seve(c.clone().setY(0.4), UP, 40, { speed: 6, spread: 0.9 }); mottes(c.clone().setY(0.3), 14, 4.2); cailloux(c, 24, 1.7); halo(c.clone().setY(0.4), 2.4, 0.32, 1.1); filaments(c.clone().setY(0.5), UP, 26, 9);
    anneauPoussiere(0.9, 14, 2.6, { centre: C_ZONE, a: 0.25, size: 0.6 });
    panneau(FS_DSHOCK, c.clone().setY(0.9), 0.4, 7, 0.45, { strength: 0.035 });
    run.light = { p: c.clone().setY(1.9), peak: 5, age: 0 };
    centreEcran(c.clone().setY(1.2));
    if (!reduceMotion) { run.inv = 34; run.duo = 45; run.lines = 0.9; run.rad = 0.12; run.ca = 0.012; }
  }
  so.uEclot.value = t >= T.eclot ? easeOutCubic(clamp((t - T.eclot) / 140)) * (1 - 0.4 * smooth(T.eclot + 200, T.eclot + 900, t)) : 0;
  if (t > T.eclot && t < T.flor && rng() < dt * 0.05) seve(V3(C_ZONE.x + rand(-1, 1), SOL_Y + rand(1.5, 4), C_ZONE.z + rand(-1, 1)), V3(0, -1, 0), 1, { speed: 0.5 });
  if (t > T.eclot + 100 && t < T.flor && rng() < dt * 0.08) { const a = rand(0, 6.28); spores(V3(C_ZONE.x + Math.cos(a) * 1.3, SOL_Y + rand(0.3, 3.8), C_ZONE.z + Math.sin(a) * 1.3), 1, { speed: 0.2, life: 1.2 }); }
  // ---------------------------------------------------------------- tension : la Tisseuse tire le fil, la place se fronce, le monde se tait
  if (t >= T.tension && !F.tension) {
    F.tension = 1; Son.jouer('tension', 0.85, 0.4); shake(0.3); run.fovPunch = 1.5;
    for (const [a, b] of SOUS) for (let k = 0; k < 3; k++) bouffee(a.clone().lerp(b, rand(0.1, 0.9)), 1, { size: 0.8, a: 0.4, force: 0.8 });
  }
  if (t >= T.silence && !F.silence) { F.silence = 1; Son.ambiance('silence'); }
  const tens = smooth(T.tension, T.tension + 220, t) * (1 - smooth(T.flor - 60, T.flor + 250, t));
  so.uTension.value = tens;
  T.batt.forEach((tb, k) => {
    if (F['b' + k] || t < tb) return;
    F['b' + k] = 1; Son.jouer('battement', 0.85, 0.3, k); run.fovPunch = 0.9; shake(0.08);
    spores(haut.clone().setY(SOL_Y + H_COL * 0.95), 14, { speed: 0.5, v: V3(0, 0.5, 0), life: 1.2 });
  });
  // ---------------------------------------------------------------- floraison : la colonne s'ouvre lentement et expire ses spores
  if (t >= T.flor - 300 && !F.avant) { F.avant = 1; Son.jouer('avant', 0.9, 0.4); }
  if (t >= T.flor && !F.flor) {
    F.flor = 1; Son.ambiance('normal'); Son.jouer('floraison', 1.25, 0.6, undefined, 0.4);
    shake(0.6); run.fovPunch = 4; run.flash = 0.8;
    const h = haut.clone().setY(SOL_Y + H_COL * 0.8);
    panneau(FS_DSHOCK, h, 0.6, 10, 0.8, { strength: 0.025 }); panneau(FS_DHAZE, h, 3, 6, 1.6, { strength: 0.02 });
    for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; nuage(V3(C_ZONE.x + Math.cos(a) * 0.9, SOL_Y + H_COL * 0.75, C_ZONE.z + Math.sin(a) * 0.9), 1, { size: 0.8, speed: 0.4, v: V3(Math.cos(a) * 0.6, 1.2, Math.sin(a) * 0.6), rise: 0.5, a: 0.3, glow: 0.35, life: 1.8, grow: 2.4, jitter: 0.3 }); }
    run.light = { p: h, peak: 6, age: 0, decay: 1.6 };
    centreEcran(h);
    if (!reduceMotion) { run.duo = 60; run.lines = 0.6; run.rad = 0.08; run.ca = 0.01; }
  }
  if (t > T.flor && t < T.flor + 900) {
    const k = 1 - (t - T.flor) / 900;
    if (rng() < dt * 0.5 * k) { const a = rand(0, 6.28), r = rand(0.4, 1.9); spores(V3(C_ZONE.x + Math.cos(a) * r, SOL_Y + rand(2.4, 4.4), C_ZONE.z + Math.sin(a) * r), 1, { speed: 1.2, v: V3(Math.cos(a) * 1.0, rand(1.2, 2.6), Math.sin(a) * 1.0), life: 2.2, grav: 0.12, taille: 0.8 }); }
    if (rng() < dt * 0.04 * k) { const a = rand(0, 6.28), r = rand(0, 0.6); nuage(V3(C_ZONE.x + Math.cos(a) * r, SOL_Y + H_COL * 0.5, C_ZONE.z + Math.sin(a) * r), 1, { size: 0.6, rise: 0.8, speed: 0.3, v: V3(0, 1.6, 0), a: 0.3, glow: 0.5, life: 1.7, grow: 2.6 }); }
    if (rng() < dt * 0.04 * k) { const a = rand(0, 6.28); seve(V3(C_ZONE.x + Math.cos(a) * 2.0, SOL_Y + rand(2.0, 3.2), C_ZONE.z + Math.sin(a) * 2.0), V3(0, -1, 0), 1, { speed: 0.6 }); }
  }
  if (t > T.flor + 300 && t < T.bout - 500 && rng() < dt * 0.06) { const a = rand(0, 6.28), r = rand(0, 4); spores(V3(C_ZONE.x + Math.cos(a) * r, SOL_Y + rand(1.5, 4), C_ZONE.z + Math.sin(a) * r), 1, { speed: 0.15, v: V3(0, -0.15, 0), life: 1.6, grav: 0.05 }); }
  if (t >= T.spores && !F.spores) { F.spores = 1; Son.jouer('spores', 0.6, 0.6); }
  // ---------------------------------------------------------------- l'infection gagne les dalles
  so.uInfR.value = 1.5 * smooth(T.eclot, T.flor, t) + 3.0 * smooth(T.flor + 100, T.flor + 1500, t);
  so.uInfP.value = smooth(T.lancer + 100, T.eclot + 700, t) + 0.6 * smooth(T.flor, T.flor + 1200, t);
  so.uInfLueur.value = 0.25 + T.batt.reduce((a, tb) => a + (t > tb ? 1.2 * Math.exp(-(t - tb) / 220) : 0), 0) + (t > T.flor ? 1.0 * Math.exp(-(t - T.flor) / 700) : 0);
  so.uMortier.value = smooth(T.lancer, T.eclot, t) * (1 - smooth(T.flor + 600, T.bout - 300, t)) * 0.9;
  so.uSouffle.value = t > T.flor ? Math.sin(clamp((t - T.flor) / 700) * Math.PI) : 0;
  // ---------------------------------------------------------------- cloture : la Tisseuse coupe le fil
  if (!F.cloture && t >= T.coupe) { F.cloture = 1; Son.jouer('cloture', 0.7, 0.3); spores(mainDroite(), 8, { speed: 0.3 }); filaments(mainDroite(), V3(0, -1, 0), 4, 1.5); }
  // ---------------------------------------------------------------- le monde s'assombrit, le Miasme gagne le ciel, puis tout revient
  run.flash *= Math.exp(-dt / 160);
  run.souffle = Math.max(0.25 * smooth(0, 300, t) * (1 - smooth(T.lancer, T.lancer + 300, t)), run.souffle * Math.exp(-dt / 350), t > T.flor ? 0.5 * Math.exp(-(t - T.flor) / 600) : 0);
  run.dim = 0.38 * smooth(0, 380, t) * (1 - smooth(T.flor + 900, T.bout - 200, t));
  run.desat = 0.42 * smooth(0, 300, t) * (1 - smooth(T.flor + 600, T.flor + 1600, t)) + 0.15 * tens;
  run.trouble = 0.7 * smooth(T.eclot, T.flor, t) * (1 - smooth(T.flor + 1200, T.bout, t));
  so.uFade.value = 1 - smooth(T.bout - 450, T.bout - 60, t);
}

// ================================================================== camera
function lerpPose(a, b, k) { return { p: a.p.clone().lerp(b.p, k), l: a.l.clone().lerp(b.l, k), fov: lerp(a.fov, b.fov, k), roll: lerp(a.roll, b.roll, k) }; }
const CAM_JEU = V3(-1.4, 5.4, 9.0), LOOK_JEU = V3(0.4, 1.2, 0);
const VUES = {
  jeu: { p: CAM_JEU, l: LOOK_JEU, fov: 52 },
  cote: { p: V3(0, 2.2, 10.8), l: V3(0, 1.6, 0), fov: 50 },
  face: { p: V3(9.6, 2.8, 2.6), l: V3(-0.2, 1.6, 0), fov: 48 },
  dos: { p: V3(-8.8, 2.7, 1.3), l: V3(1.5, 1.6, 0), fov: 46 },
  dessus: { p: V3(0, 14.5, 4.0), l: V3(0, 0, 0), fov: 50 }
};
const MOSAIQUE = ['jeu', 'cote', 'face', 'dessus'];
const orbite = { az: -0.1, el: 0.3, dist: 10.5, cible: V3(0.3, 1.5, 0), dernier: -1e9 };
function camPose(v) {
  const t = run.tau;
  if (v === 'cine' && t >= 0) return poseCine();
  if (v === 'libre') { const c = Math.cos(orbite.el); return { p: orbite.cible.clone().add(V3(Math.sin(orbite.az) * c, Math.sin(orbite.el), Math.cos(orbite.az) * c).multiplyScalar(orbite.dist)), l: orbite.cible.clone(), fov: 48, roll: 0 }; }
  const f = VUES[v] ?? VUES.jeu;
  return { p: f.p.clone(), l: f.l.clone(), fov: f.fov, roll: 0 };
}
const cA = V3();
function poseCine() {
  const t = run.tau, mains = V3(TISSEUSE.x + 0.45, 1.12, 0);
  // tissage : de trois quarts face, bas, sur les mains qui tissent
  const tisse = { p: V3(TISSEUSE.x + 2.5, 1.45, 1.9).lerp(V3(TISSEUSE.x + 2.1, 1.35, 1.55), smooth(0, T.lancer, t)), l: mains, fov: 38, roll: 2 * DEG };
  if (t < T.lancer - 30) return tisse;
  // couture : au ras des dalles, la camera suit le dard sous la place
  const sd = dardS(t), f = sd >= 0 ? CHEMIN.at(Math.min(sd, CHEMIN.M.C - 0.4), cA) : COUTURE.E0;
  const ras = { p: V3(f.x - 0.75, 0.42, f.z + 1.45), l: V3(f.x + 0.75, 0.2, f.z - 0.05), fov: 58, roll: -1.5 * DEG };
  if (t < T.eclot) return lerpPose(tisse, ras, easeOutCubic(clamp((t - T.lancer + 30) / 90)));
  // eclosion : coupe au pied de la zone, puis la camera leve la tete avec la colonne
  const pied = { p: V3(C_ZONE.x - 3.0, 0.55, C_ZONE.z + 3.2), l: V3(C_ZONE.x, 1.3, C_ZONE.z), fov: 62, roll: 0 };
  const leve = { p: V3(C_ZONE.x - 3.7, 1.3, C_ZONE.z + 4.1), l: V3(C_ZONE.x, 3.0, C_ZONE.z), fov: 62, roll: 0 };
  const ecl = lerpPose(pied, leve, easeInOut(clamp((t - T.eclot) / 520)));
  // tension : plan large de cote, le fil tendu de la main a la colonne
  const large = { p: V3(-0.2, 2.4, 9.0).lerp(V3(-0.1, 2.2, 8.0), smooth(T.tension, T.flor, t)), l: V3(0.1, 1.75, 0), fov: 52, roll: 0 };
  if (t < T.flor - 220) return lerpPose(ecl, large, easeInOut(clamp((t - T.tension + 80) / 260)));
  // floraison : plongee au-dessus de la colonne qui s'ouvre
  const plonge = { p: V3(C_ZONE.x - 1.9, 6.7, C_ZONE.z + 2.7).lerp(V3(C_ZONE.x - 2.5, 7.6, C_ZONE.z + 3.6), smooth(T.flor, T.flor + 1400, t)), l: V3(C_ZONE.x, 2.7, C_ZONE.z), fov: 52, roll: 0 };
  if (t < T.flor + 1300) return lerpPose(large, plonge, easeInOut(clamp((t - T.flor + 220) / 420)));
  // fin : plan haut derriere la Tisseuse
  const fin = { p: V3(-7.6, 4.3, 4.4), l: V3(0.8, 1.0, 0), fov: 50, roll: 0 };
  return lerpPose(plonge, fin, easeInOut(clamp((t - T.flor - 1300) / 1100)));
}

