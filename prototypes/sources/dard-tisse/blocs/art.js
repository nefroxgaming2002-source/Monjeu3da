// ---------------------------------------------------------------- le dard tisse
// Les fils : les cordes de la colonne, le dard, le fil de couture, les liens, les poils et les franges sont tous des tubes
// construits sur la carte graphique. Chaque fil est une ligne de 64 points (position, rayon) recalculee a chaque image ;
// le shader en fait un tube avec une normale transportee le long du fil (aucune torsion parasite), des brins en helice
// (une vraie corde), une chair humide, et une seve qui luit par plaques.
const FILS = (() => {
  const SEG = 64, MAX = 176, RAD = LOW ? 4 : 6;
  const dP = new Float32Array(SEG * MAX * 4), dN = new Float32Array(SEG * MAX * 4), dI = new Float32Array(MAX * 4);
  const mk = (d, w, h) => { const t = new THREE.DataTexture(d, w, h, THREE.RGBAFormat, THREE.FloatType); t.magFilter = t.minFilter = THREE.NearestFilter; t.needsUpdate = true; return t; };
  const tP = mk(dP, SEG, MAX), tN = mk(dN, SEG, MAX), tI = mk(dI, 1, MAX);
  const geo = new THREE.BufferGeometry(), nV = MAX * SEG * (RAD + 1), af = new Float32Array(nV * 3), idx = new Uint32Array(MAX * (SEG - 1) * RAD * 6);
  let v = 0, w = 0;
  for (let r = 0; r < MAX; r++) for (let i = 0; i < SEG; i++) for (let k = 0; k <= RAD; k++) { af[v * 3] = r; af[v * 3 + 1] = i; af[v * 3 + 2] = k / RAD * Math.PI * 2; v++; }
  for (let r = 0; r < MAX; r++) for (let i = 0; i < SEG - 1; i++) for (let k = 0; k < RAD; k++) { const a = (r * SEG + i) * (RAD + 1) + k, b = a + 1, c = a + RAD + 1, d = c + 1; idx.set([a, b, c, b, d, c], w); w += 6; }
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nV * 3), 3));
  geo.setAttribute('aFil', new THREE.BufferAttribute(af, 3)); geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.boundingSphere = new THREE.Sphere(V3(), 60);
  const GLSL_FIL_V = `uniform sampler2D tFilsP, tFilsN, tFilsI; attribute vec3 aFil;
vec3 filPos(out vec3 nrm, out vec3 T, out vec4 inf, out float glow) {
  float v = (aFil.x + 0.5) / ${MAX}.0, x0 = (aFil.y + 0.5) / ${SEG}.0;
  vec4 P = texture2D(tFilsP, vec2(x0, v)), Nn = texture2D(tFilsN, vec2(x0, v));
  vec3 Pa = texture2D(tFilsP, vec2((max(aFil.y - 1.0, 0.0) + 0.5) / ${SEG}.0, v)).xyz, Pb = texture2D(tFilsP, vec2((min(aFil.y + 1.0, ${SEG - 1}.0) + 0.5) / ${SEG}.0, v)).xyz;
  T = Pb - Pa; float lt = length(T); T = lt > 1e-6 ? T / lt : vec3(0.0, 1.0, 0.0);
  vec3 B1 = Nn.xyz - T * dot(Nn.xyz, T); float lb = length(B1); B1 = lb > 1e-5 ? B1 / lb : normalize(cross(T, vec3(0.31, 0.83, 0.46)));
  vec3 B2 = cross(T, B1);
  nrm = cos(aFil.z) * B1 + sin(aFil.z) * B2;
  inf = texture2D(tFilsI, vec2(0.5, v)); glow = Nn.w;
  return P.xyz + nrm * P.w;
}`;
  const uF = { tFilsP: { value: tP }, tFilsN: { value: tN }, tFilsI: { value: tI }, tNoise: { value: noiseTex }, uTime: uSol.uTime };
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.3, envMap, envMapIntensity: 0.6 });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, uF);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\n${GLSL_FIL_V}\nvarying vec3 vFilT; varying vec4 vFilI; varying vec2 vFil; varying float vGlow;`)
      .replace('#include <beginnormal_vertex>', `vec3 filN, filT; vec4 filI; float filG; vec3 filP = filPos(filN, filT, filI, filG);
vec3 objectNormal = filN; vFilT = filT; vFilI = filI; vFil = vec2(aFil.y / ${SEG - 1}.0, aFil.z); vGlow = filG;`)
      .replace('#include <begin_vertex>', 'vec3 transformed = filP;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform sampler2D tNoise; uniform float uTime; varying vec3 vFilT; varying vec4 vFilI; varying vec2 vFil; varying float vGlow;
${GLSL_COMMUN}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
float fS = vFil.x * vFilI.x, fFam = vFilI.y, fGr = vFilI.z, fSec = vFilI.w, fAng = vFil.y;
// les brins de la corde, en helice : quatre pour les cordes, trois pour le fil, deux pour les poils et les franges
float fNb = fFam < 0.5 ? 4.0 : fFam < 1.5 ? 3.0 : 2.0, fPas = fFam < 0.5 ? 6.0 : fFam < 1.5 ? 24.0 : 34.0;
float fHel = fract(fAng * 0.15915 * fNb + fS * fPas + fGr);
float fSillon = smoothstep(0.0, 0.24, fHel) * smoothstep(1.0, 0.76, fHel);
float fN1 = texture2D(tNoise, vec2(fS * 0.37 + fGr * 3.1, fGr)).r, fN2 = texture2D(tNoise, vec2(fS * 2.9 + fGr, fAng * 0.4775)).g, fN3 = texture2D(tNoise, vec2(fS * 11.0, fAng * 0.955 + fGr)).a;
vec3 fBase = fFam < 0.5 ? vec3(0.085, 0.018, 0.05) : fFam < 1.5 ? vec3(0.15, 0.07, 0.095) : fFam < 2.5 ? vec3(0.16, 0.14, 0.17) : vec3(0.05, 0.042, 0.033);
vec3 fFibre = fFam < 0.5 ? vec3(0.2, 0.07, 0.1) : fFam < 1.5 ? vec3(0.28, 0.16, 0.19) : fFam < 2.5 ? vec3(0.3, 0.27, 0.31) : vec3(0.09, 0.075, 0.058);
vec3 fAlb = mix(fBase, fFibre, smoothstep(0.5, 0.9, fN3) * fSillon * 0.85) * (0.55 + 0.75 * fN1) * (0.45 + 0.55 * fSillon);
fAlb = mix(fAlb, vec3(0.06, 0.052, 0.045) * (0.7 + 0.5 * fN2), fSec);   // la chair seche : grise et brune
diffuseColor.rgb = fAlb;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
roughnessFactor = fFam < 2.5 ? mix(mix(0.26, 0.62, fN2), 0.92, fSec) : 0.93;`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{ vec3 tv = normalize((viewMatrix * vec4(vFilT, 0.0)).xyz); normal = normalize(normal + tv * sin(fHel * 6.2832) * (fFam < 2.5 ? 0.5 : 0.3)); }`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
material.clearcoat *= step(fFam, 2.5) * (1.0 - fSec);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{ float plaque = smoothstep(0.48, 0.85, texture2D(tNoise, vec2(fS * 0.33 - uTime * 0.18 + fGr, fGr * 1.7)).r);
  float rim = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.0);
  float g = vGlow * (fFam > 0.5 && fFam < 1.5 ? 0.55 + 0.45 * plaque : 0.08 + 0.92 * plaque) * (0.5 + 0.5 * fSillon) * (1.0 - fSec);   // le fil luit d'un bout a l'autre ; les cordes, par plaques
  totalEmissiveRadiance += miasme(g * (0.6 + 0.6 * rim)) + vec3(0.11, 0.025, 0.15) * rim * rim * (0.6 + 0.8 * plaque) * (1.0 - fSec) * step(fFam, 1.5); }`);
  };
  mat.customProgramCacheKey = () => 'fils-miasme';
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  depth.onBeforeCompile = sh => { Object.assign(sh.uniforms, uF); sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_FIL_V).replace('#include <begin_vertex>', 'vec3 filN, filT; vec4 filI; float filG; vec3 transformed = filPos(filN, filT, filI, filG);'); };
  depth.customProgramCacheKey = () => 'fils-ombre';
  const mesh = new THREE.Mesh(geo, mat); mesh.customDepthMaterial = depth; mesh.frustumCulled = false; mesh.castShadow = !LOW; mesh.receiveShadow = true; scene.add(mesh);
  const brins = [];
  function brin(fam, graine) { const b = { row: brins.length, fam, graine: graine ?? rng(), actif: false, f: null, sec: 0, vu: false }; if (b.row < MAX) brins.push(b); return b; }
  const p = V3(), G = { r: 0, g: 0 }, pts = new Float32Array(SEG * 3), N0 = V3(), T0 = V3(), Tn = V3();
  function ecrire() {
    for (const b of brins) {
      const o = b.row * SEG * 4;
      if (!b.actif || !b.f) { if (b.vu) { for (let i = 0; i < SEG; i++) dP[o + i * 4 + 3] = 0; b.vu = false; } continue; }
      b.vu = true; let L = 0;
      for (let i = 0; i < SEG; i++) {
        G.r = 0; G.g = 0; b.f(i / (SEG - 1), p, G);
        pts[i * 3] = p.x; pts[i * 3 + 1] = p.y; pts[i * 3 + 2] = p.z;
        dP[o + i * 4] = p.x; dP[o + i * 4 + 1] = p.y; dP[o + i * 4 + 2] = p.z; dP[o + i * 4 + 3] = Math.max(0, G.r); dN[o + i * 4 + 3] = G.g;
        if (i) L += Math.hypot(p.x - pts[i * 3 - 3], p.y - pts[i * 3 - 2], p.z - pts[i * 3 - 1]);
      }
      // normale transportee le long du fil : chaque anneau garde l'orientation du precedent
      const g = b.graine * 6.283; N0.set(Math.cos(g), 0.37, Math.sin(g));
      for (let i = 0; i < SEG; i++) {
        const a = Math.max(0, i - 1), c = Math.min(SEG - 1, i + 1);
        Tn.set(pts[c * 3] - pts[a * 3], pts[c * 3 + 1] - pts[a * 3 + 1], pts[c * 3 + 2] - pts[a * 3 + 2]);
        const lt = Tn.length(); if (lt > 1e-7) Tn.multiplyScalar(1 / lt); else Tn.set(0, 1, 0);
        N0.addScaledVector(Tn, -N0.dot(Tn)); let ln = N0.length();
        if (ln < 1e-4) { N0.set(0.31, 0.83, 0.46).addScaledVector(Tn, -Tn.dot(T0.set(0.31, 0.83, 0.46))); ln = N0.length(); }
        N0.multiplyScalar(1 / ln);
        dN[o + i * 4] = N0.x; dN[o + i * 4 + 1] = N0.y; dN[o + i * 4 + 2] = N0.z;
      }
      dI[b.row * 4] = L; dI[b.row * 4 + 1] = b.fam; dI[b.row * 4 + 2] = b.graine; dI[b.row * 4 + 3] = b.sec;
    }
    tP.needsUpdate = true; tN.needsUpdate = true; tI.needsUpdate = true;
  }
  return { brin, ecrire, mesh, eteindre() { for (const b of brins) b.actif = false; } };
})();

// Le chemin du dard : de la main, il plonge dans les dalles (E0), file dessous, ressort en arc (X1 -> E1, puis X2 -> E2),
// et jaillit au centre de la zone, jusqu'au sommet de la colonne. Abscisse curviligne en metres.
const CHEMIN = (() => {
  const P = [], S = [], M = {}; let L = 0;
  const pousser = q => { if (P.length) L += P[P.length - 1].distanceTo(q); P.push(q.clone()); S.push(L); };
  function construire(depart) {
    P.length = 0; S.length = 0; L = 0;
    const seg = (a, b, n, h) => { for (let k = 1; k <= n; k++) { const l = k / n, q = a.clone().lerp(b, l); q.y = lerp(a.y, b.y, l) + h * Math.sin(Math.PI * l); pousser(q); } };
    pousser(depart);
    seg(depart, COUTURE.E0, 10, 0); M.E0 = L;
    seg(COUTURE.E0, COUTURE.X1, 26, -0.24); M.X1 = L;
    seg(COUTURE.X1, COUTURE.E1, 24, 0.56); M.E1 = L;
    seg(COUTURE.E1, COUTURE.X2, 26, -0.24); M.X2 = L;
    seg(COUTURE.X2, COUTURE.E2, 24, 0.5); M.E2 = L;
    seg(COUTURE.E2, C_ZONE, 26, -0.28); M.C = L;
    seg(C_ZONE, C_ZONE.clone().add(V3(0, H_COL + 0.05, 0)), 26, 0); M.haut = L;
  }
  function at(s, out = V3()) {
    if (!P.length) return out.set(0, 0, 0);
    s = clamp(s, 0, L); let a = 0, b = S.length - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (S[m] <= s) a = m; else b = m; }
    return out.copy(P[a]).lerp(P[b], (s - S[a]) / Math.max(1e-6, S[b] - S[a]));
  }
  const ta = V3(), tb = V3();
  function tangente(s, out = V3()) { at(s - 0.04, ta); at(s + 0.04, tb); return out.copy(tb).sub(ta).normalize(); }
  return { construire, at, tangente, M, get L() { return L; }, get pret() { return P.length > 0; } };
})();
// abscisse sous terre (pour la crete de dalles) a partir de l'abscisse du dard sur le chemin
function sousTerre(s) {
  const M = CHEMIN.M, l0 = SOUS_S[1] - SOUS_S[0], l1 = SOUS_S[2] - SOUS_S[1], l2 = Math.hypot(C_ZONE.x - COUTURE.E2.x, C_ZONE.z - COUTURE.E2.z);
  if (s < M.E0) return -1;
  if (s < M.X1) return SOUS_S[0] + l0 * (s - M.E0) / (M.X1 - M.E0);
  if (s < M.E1) return SOUS_S[0] + l0;
  if (s < M.X2) return SOUS_S[1] + l1 * (s - M.E1) / (M.X2 - M.E1);
  if (s < M.E2) return SOUS_S[1] + l1;
  if (s < M.C) return SOUS_S[2] + l2 * (s - M.E2) / (M.C - M.E2);
  return SOUS_S[2] + l2 + 0.5;
}

// L'epine du dard : une corne de chitine courbe, annelee, avec trois barbes ; sombre et irisee.
const matChitine = new THREE.MeshPhysicalMaterial({ color: 0x1c1016, roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.14, iridescence: LOW ? 0 : 0.75, iridescenceIOR: 1.45, iridescenceThicknessRange: [220, 560], envMap, envMapIntensity: 1.2 });
const epine = new THREE.Group(); scene.add(epine);
{
  const prof = []; for (let k = 0; k <= 22; k++) { const f = k / 22, r = 0.046 * Math.pow(1 - f, 0.75) * (1 + 0.13 * Math.sin(k * 2.2)) + 0.0006; prof.push(new THREE.Vector2(r, f * 0.32)); }
  const g = new THREE.LatheGeometry(prof, 14), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + 0.75 * y * y); }   // la corne se courbe
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, matChitine); m.castShadow = true; epine.add(m);
  for (let k = 0; k < 3; k++) { const a = k * 2.094, b = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.08, 6), matChitine); b.position.set(Math.cos(a) * 0.04, 0.06, Math.sin(a) * 0.04); b.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(Math.cos(a) * 0.8, -1, Math.sin(a) * 0.8).normalize()); epine.add(b); }   // barbes tournees vers l'arriere
}
epine.visible = false;
const lueurDard = new THREE.PointLight(0xa36cff, 0, 0, 2); scene.add(lueurDard);
const lueurCol = new THREE.PointLight(0xa36cff, 0, 0, 2); scene.add(lueurCol);   // la seve allume la colonne de l'interieur : elle filtre entre les mailles

// ---------------------------------------------------------------- les brins et leurs formes
const UP = V3(0, 1, 0), AXE_Z = V3(0, 0, 1);
const fA = V3(), fB = V3(), fC = V3(), fD = V3(), fE = V3(), fT = V3(), fN = V3(), fBn = V3();
const bout = (u, a = 0.05, b = 0.05) => smooth(0, a, u) * smooth(1, 1 - b, u);   // les fils s'amincissent aux deux bouts
function bez(p0, p1, p2, p3, u, out) { const a = 1 - u, k0 = a * a * a, k1 = 3 * a * a * u, k2 = 3 * a * u * u, k3 = u * u * u; return out.set(k0 * p0.x + k1 * p1.x + k2 * p2.x + k3 * p3.x, k0 * p0.y + k1 * p1.y + k2 * p2.y + k3 * p3.y, k0 * p0.z + k1 * p1.z + k2 * p2.z + k3 * p3.z); }
// l'etat du moment, calcule une fois par image avant les fils
const E = { t: 0, tension: 0, ouvre: 0, coupe: 0, fane: 0, us: 1, dardS: -1, sous: -1, tete: V3(), dir: V3(1, 0, 0), coupeP: V3(), main: V3(), cheveuxC: V3() };
// la colonne : profil d'un cocon, plus large au pied, une taille, un ventre, puis elle se referme au-dessus des betes
function rayonCol(u) { return 1.24 + 0.32 * Math.exp(-u * 7) + 0.16 * Math.exp(-Math.pow((u - 0.64) / 0.16, 2)) - 0.82 * smooth(0.78, 1.0, u); }
const NCORDE = 48, MCORDE = 24;
const cordes = Array.from({ length: NCORDE }, (_, c) => { const dir = c % 2 ? -1 : 1, k = c >> 1; return { b: FILS.brin(0), dir, phi0: 2 * Math.PI * k / MCORDE + (dir < 0 ? Math.PI / MCORDE : 0) + 0.2, ep: 0.036 + 0.016 * ((k * 7 + c) % 5) / 4 }; });
function angleCol(cd, u) { return cd.phi0 + cd.dir * 1.15 * Math.PI * (1 + 0.22 * E.tension) * u; }
function pointColonne(cd, u, out) {
  const phi = angleCol(cd, u);
  // armure : a chaque croisement, une corde passe dessus et l'autre dessous (decalage de pi/M entre les deux sens)
  const r = rayonCol(u) * (1 - 0.1 * E.tension) + 0.04 * cd.dir * Math.sin(MCORDE * phi) + 0.025 * Math.sin(u * 23 + cd.phi0 * 5);
  const ferme = smooth(0.9, 1.0, u);   // le haut se referme en cocon sur l'epine
  return out.set(C_ZONE.x + Math.cos(phi) * r * (1 - 0.7 * ferme), SOL_Y + u * H_COL + ferme * 0.12, C_ZONE.z + Math.sin(phi) * r * (1 - 0.7 * ferme));
}
function lueurBrin(u, t, base) {
  let g = base;
  if (t > T.eclot) g += 1.5 * Math.exp(-(t - T.eclot) / 230) * smooth(0, 0.15, u);   // l'eclosion : la seve monte dans les cordes, puis s'eteint
  for (const tb of T.batt) if (t > tb && t < tb + 700) g += 0.85 * Math.exp(-Math.pow((u - (t - tb) / 430) / 0.08, 2));   // un battement de seve remonte les cordes
  return g;
}
function formeCorde(cd) {
  return (u, out, G) => {
    const t = E.t, te = t - T.eclot, g = easeOutCubic(clamp(te / 170)), uu = u * g;
    pointColonne(cd, uu, fA);
    const k = easeInOut(clamp((te - 40) / 340));
    if (k < 1) {   // la gerbe : les cordes fusent du centre en fontaine, puis se tissent
      const a = cd.phi0 + Math.sin(cd.phi0 * 3 + uu * 4) * 0.25, rr = 0.1 + 1.0 * Math.pow(uu, 1.6);
      fB.set(C_ZONE.x + Math.cos(a) * rr, SOL_Y + uu * H_COL * 1.12, C_ZONE.z + Math.sin(a) * rr);
      fA.lerp(fB, 1 - k);
    }
    if (E.ouvre > 0 && uu > E.us) {   // la floraison : au-dessus de la fente, la corde se recourbe en petale
      pointColonne(cd, E.us, fC);
      // six petales : les cordes se rassemblent autour de l'angle du petale ; chacun est etroit au bout, large au milieu
      const phs = angleCol(cd, E.us), pas = Math.PI / 3, php = Math.round((phs - 0.1) / pas) * pas + 0.1, d = phs - php, rS = rayonCol(E.us);
      const th = 2.7 * E.ouvre + 0.8 * E.fane, Lp = (1 - E.us) * H_COL * 1.3, v = (uu - E.us) / (1 - E.us);
      fD.set(Math.cos(php), 0, Math.sin(php));
      const A = th > 0.01 ? Lp / th * Math.sin(th * v) : Lp * v, B = th > 0.01 ? Lp / th * (1 - Math.cos(th * v)) : 0;
      const larg = d * rS * ((1 - 0.8 * smooth(0, 0.2, v)) + 1.0 * Math.sin(Math.PI * Math.pow(v, 0.8)));
      fE.copy(fC).addScaledVector(UP, A).addScaledVector(fD, B).addScaledVector(fN.set(-Math.sin(php), 0, Math.cos(php)), (larg - d * rS) * E.ouvre);
      fE.y -= 0.45 * E.fane * v * v;
      fA.lerp(fE, smooth(0, 0.3, E.ouvre));
    }
    out.copy(fA);
    G.r = cd.ep * (0.7 + 0.3 * Math.sin(u * 17 + cd.phi0 * 3)) * (1 - 0.35 * E.fane) * bout(u, 0.03, 0.03 + (1 - g) * 0.15);
    G.g = lueurBrin(uu, t, 0.07 + 0.12 * E.tension) * (1 - E.fane) + (E.ouvre > 0 ? 1.4 * Math.exp(-(t - T.flor) / 600) * smooth(E.us - 0.3, E.us, uu) : 0);
  };
}
cordes.forEach(cd => { cd.b.f = formeCorde(cd); });
// les liens : des cordes partent de la paroi et ligotent chaque bete, bras compris
const liens = [];
ennemis.forEach((e, i) => { for (let j = 0; j < 5; j++) liens.push({ b: FILS.brin(0), e, i, j, h0: 1.62 - 0.11 * j, tours: 1.25 + 0.12 * j, r0: 0.56 + 0.05 * ((j * 3) % 4) / 3, ph: j * 1.9 + i }); });
const locL = V3();
function formeLien(l) {
  return (u, out, G) => {
    const t = E.t, te = t - T.eclot - 50 - 35 * l.j, g = easeOutCubic(clamp(te / 280)), uu = u * g, k0 = 0.24;
    const phiE = Math.atan2(l.e.pos0.z - C_ZONE.z, l.e.pos0.x - C_ZONE.x) + (l.j - 2) * 0.14, hA = 0.75 + 0.28 * l.j;
    const rw = rayonCol(hA / H_COL) * (1 - 0.1 * E.tension);
    fA.set(C_ZONE.x + Math.cos(phiE) * rw, SOL_Y + hA, C_ZONE.z + Math.sin(phiE) * rw);
    const r = l.r0 * (1 - 0.1 * E.tension);
    const spirale = (v, o) => { const th = l.ph + v * Math.PI * 2 * l.tours; locL.set(Math.cos(th) * r * (1 + 0.08 * Math.sin(v * 13)), l.h0 - v * 0.62, Math.sin(th) * r); return l.e.penche.localToWorld(o.copy(locL)); };
    if (uu < k0) { const v = uu / k0; spirale(0, fB); out.copy(fA).lerp(fB, v); out.y -= 0.1 * Math.sin(Math.PI * v) * (1 - E.tension); }
    else spirale((uu - k0) / (1 - k0), out);
    G.r = 0.015 * (1 - 0.3 * E.fane) * bout(u, 0.04, 0.04 + (1 - g) * 0.12);
    G.g = lueurBrin(uu, t, 0.06 + 0.1 * E.tension) * 0.8 * (1 - E.fane);
  };
}
liens.forEach(l => { l.b.f = formeLien(l); });
// le dard : sept cordes tressees en fuseau, de la queue (u = 0) vers l'epine (u = 1)
const DARD_L = 0.85;
const tresse = Array.from({ length: 8 }, (_, j) => ({ b: FILS.brin(0, 0.1 + j * 0.11), j }));
function axeDard(u, out, tg) {   // centre du dard et sa tangente au point u
  if (E.dardS < 0) { out.copy(E.tete).addScaledVector(E.dir, -(1 - u) * DARD_L); tg.copy(E.dir); }
  else { const s = E.dardS - (1 - u) * DARD_L; CHEMIN.at(s, out); CHEMIN.tangente(s, tg); }
  return out;
}
function formeTresse(tr) {
  return (u, out, G) => {
    const t = E.t, g = clamp((t - T.tresse) / (T.lancer - T.tresse - 50)), uu = u * g, serre = smooth(T.tresse, T.lancer - 30, t);
    axeDard(uu, fA, fT);
    fN.crossVectors(fT, AXE_Z); if (fN.lengthSq() < 1e-4) fN.crossVectors(fT, UP); fN.normalize(); fBn.crossVectors(fT, fN);
    const th = tr.j / 7 * Math.PI * 2 + uu * Math.PI * 6, sp = Math.sin(Math.PI * Math.min(1, uu * 1.04));
    const rho = tr.j === 7 ? 0 : (0.04 * Math.pow(Math.max(sp, 0), 0.7) * serre + (1 - serre) * 0.17 * sp) * (1 + 0.15 * Math.sin(uu * 28 + tr.j * Math.PI));
    out.copy(fA).addScaledVector(fN, Math.cos(th) * rho).addScaledVector(fBn, Math.sin(th) * rho);
    G.r = (tr.j === 7 ? 0.03 : 0.019) * (0.5 + 0.5 * sp) * bout(u, 0.04, 0.04);
    G.g = 0.12 + 0.35 * Math.max(0, Math.sin(uu * 9 - t * 0.02)) * (t < T.eclot ? 1 : 0.4);
  };
}
tresse.forEach(tr => { tr.b.f = formeTresse(tr); });
// le fil de couture : de la main droite au talon du dard, a travers la place
const filC = FILS.brin(1, 0.37);
filC.f = (u, out, G) => {
  const t = E.t, M = CHEMIN.M, sT = Math.min(Math.max(0, E.dardS - DARD_L), M.C + 0.25), s = u * sT;   // le fil s'arrete au pied de la colonne : il ne monte pas dans son axe
  if (s < M.E0) {
    const l = s / M.E0, depart = E.coupe > 0 ? E.coupeP : E.main;
    out.copy(depart).lerp(COUTURE.E0, l);
    out.y -= 0.14 * Math.sin(Math.PI * l) * (1 - E.tension);
    if (E.coupe > 0) { const ch = 4.9 * E.coupe * E.coupe; out.y = Math.max(SOL_Y + 0.014 + 0.01 * Math.sin(l * 9), out.y - ch * Math.pow(1 - l, 0.6)); }
  } else {
    CHEMIN.at(s, out);
    if (out.y > SOL_Y + 0.005 && s < M.C) out.y = SOL_Y + (out.y - SOL_Y) * (1 - 0.38 * E.tension);
  }
  if (t > T.tension && E.coupe <= 0) out.z += 0.03 * Math.sin((t - T.tension) * 0.06 + s * 6) * Math.exp(-(t - T.tension) / 280) * smooth(0, 0.3, s);   // le fil vibre quand il se tend
  G.r = 0.022 * bout(u, 0.01, 0.01);
  let gl = 0.05 + 1.1 * E.tension;   // tendu, le fil s'allume d'un bout a l'autre : c'est lui qu'on doit lire
  for (const tb of T.batt) if (t > tb && t < tb + 900) gl += 1.1 * Math.exp(-Math.pow((s - (t - tb) * 0.011) / 0.5, 2));   // la seve file de la main vers la colonne
  G.g = gl * (E.coupe > 0 ? Math.max(0, 1 - E.coupe * 3) : 1);
};
// les poils de mycelium qui montent des joints vers les mains pendant le tissage
const cheveux = Array.from({ length: 20 }, (_, j) => {
  const a = -1.7 + 3.4 * ((j * 7) % 20) / 19 + Math.sin(j * 3.7) * 0.1, r = 0.65 + 0.9 * ((j * 11) % 20) / 19;
  return { b: FILS.brin(2), j, sol: V3(TISSEUSE.x + Math.cos(a) * r, SOL_Y + 0.004, TISSEUSE.z + Math.sin(a) * r), ph: j * 1.3 };
});
function formeCheveu(c) {
  return (u, out, G) => {
    const t = E.t, g = easeOutCubic(clamp((t - 20 - 11 * c.j) / 280)), s0 = easeInOut(clamp((t - 330 - 7 * c.j) / 170)), uu = s0 + u * (g - s0);
    fA.copy(c.sol).addScaledVector(UP, 0.75 + 0.2 * Math.sin(c.ph)); fB.copy(E.cheveuxC).sub(c.sol).normalize();
    fC.copy(E.cheveuxC).addScaledVector(fB, -0.4).addScaledVector(UP, 0.25);
    bez(c.sol, fA, fC, E.cheveuxC, uu, out);
    out.x += 0.05 * Math.sin(uu * 9 + t * 0.012 + c.ph) * Math.sin(Math.PI * uu); out.z += 0.05 * Math.cos(uu * 8 + t * 0.01 + c.ph) * Math.sin(Math.PI * uu);
    G.r = 0.0055 * (1 - 0.45 * uu) * bout(u, 0.03, 0.08);
    G.g = 0.08 + 0.6 * smooth(0.75, 1, uu) + 0.35 * Math.max(0, Math.sin(uu * 14 - t * 0.03));
  };
}
cheveux.forEach(c => { c.b.f = formeCheveu(c); });
// les franges du chale et des manches : elles pendent, se balancent, suivent le corps avec un peu de retard
const franges = Array.from({ length: LOW ? 12 : 26 }, (_, j) => {
  if (j < (LOW ? 8 : 18)) { const n = LOW ? 8 : 18, a = -2.7 + 5.4 * j / (n - 1); return { b: FILS.brin(3), j, loc: V3(0.02 + Math.cos(a) * 0.4, 1.1 - 0.075 * Math.cos(a), Math.sin(a) * 0.41), L: 0.28 + 0.3 * ((j * 7) % 5) / 4, a }; }
  return { b: FILS.brin(3), j, main: j % 2, L: 0.16 + 0.12 * (j % 3) / 2, dec: V3(Math.sin(j * 2.1) * 0.03, -0.03, Math.cos(j * 1.7) * 0.03) };
});
function formeFrange(fr) {
  return (u, out, G) => {
    const t = E.t * 0.001;
    if (fr.loc) { corpsJ.localToWorld(fA.copy(fr.loc)); fB.set(Math.cos(fr.a), 0, Math.sin(fr.a)).applyQuaternion(joueur.quaternion); }
    else { fA.copy(fr.main ? mainDroite() : mainGauche()).add(fr.dec); fB.set(0, 0, 0); }
    const sw = Math.sin(t * 2.3 + fr.j) * 0.035 + run.souffle * 0.12;
    out.copy(fA).addScaledVector(fB, 0.07 * u).addScaledVector(UP, -fr.L * u);
    out.x += (sw - 0.05 * run.souffle) * u * u; out.z += Math.cos(t * 1.9 + fr.j * 1.7) * 0.03 * u * u;
    G.r = 0.0045 * (1 - 0.4 * u) * bout(u, 0.0, 0.06); G.g = 0;
  };
}
franges.forEach(fr => { fr.b.f = formeFrange(fr); fr.b.actif = true; });
// le mycelium qui sort des joints, le long de la couture et autour de la zone
const poils = LOW ? [] : Array.from({ length: 24 }, (_, j) => {
  const r0 = mulberry32(400 + j);
  if (j < 12) { const k = j % 3, [a, b] = SOUS[k], l = 0.1 + 0.8 * r0(), q = a.clone().lerp(b, l), d = V3(-(b.z - a.z), 0, b.x - a.x).normalize().multiplyScalar((r0() - 0.5) * 0.6); q.add(d); q.y = SOL_Y + 0.004; return { b: FILS.brin(2), j, sol: q, s: SOUS_S[k] + l * Math.hypot(b.x - a.x, b.z - a.z), L: 0.08 + 0.16 * r0(), ph: r0() * 6.28, ta: Infinity }; }
  const a = r0() * 6.283, r = 1.45 + 0.9 * r0();
  return { b: FILS.brin(2), j, sol: V3(C_ZONE.x + Math.cos(a) * r, SOL_Y + 0.004, C_ZONE.z + Math.sin(a) * r), L: 0.1 + 0.2 * r0(), ph: r0() * 6.28, taD: 120 + 450 * r0(), ta: Infinity };
});
function formePoil(po) {
  return (u, out, G) => {
    const t = E.t, g = easeOutCubic(clamp((t - po.ta) / 450)), L = po.L * g, a = po.ph + u * 4.5;
    out.copy(po.sol).addScaledVector(UP, L * u * (1 - 0.6 * E.fane * u)).add(fA.set(Math.cos(a) * 0.035 * u, 0, Math.sin(a) * 0.035 * u));
    out.x += 0.06 * E.fane * u * u * Math.cos(po.ph);
    G.r = 0.004 * (1 - 0.6 * u) * bout(u, 0.0, 0.1); G.g = (0.2 + 1.0 * smooth(0.7, 1, u)) * (1 - 0.8 * E.fane);
  };
}
poils.forEach(po => { po.b.f = formePoil(po); });
// les racines : a l'eclosion, des cordes rampent sur les dalles depuis le pied de la colonne et s'y agrippent
const racines = Array.from({ length: 10 }, (_, j) => ({ b: FILS.brin(0), j, a: j / 10 * Math.PI * 2 + 0.31 * Math.sin(j * 5.1), L: 1.0 + 0.9 * ((j * 7) % 10) / 9, ph: j * 2.3 }));
function formeRacine(ra) {
  return (u, out, G) => {
    const t = E.t, g = easeOutCubic(clamp((t - T.eclot - 30 - 18 * ra.j) / 320)), uu = u * g, a = ra.a + 0.35 * Math.sin(uu * 3 + ra.ph);
    const r = rayonCol(0) * 0.85 + ra.L * uu;
    out.set(C_ZONE.x + Math.cos(a) * r, SOL_Y + 0.028 + 0.16 * Math.sin(Math.PI * Math.min(1, uu * 1.6)) * (1 - uu) + 0.03 * Math.max(0, Math.sin(uu * 13 + ra.ph)), C_ZONE.z + Math.sin(a) * r);
    G.r = 0.032 * (1 - 0.8 * uu) * (1 - 0.3 * E.fane) * bout(u, 0.0, 0.05 + (1 - g) * 0.1);
    G.g = lueurBrin(uu * 0.5, t, 0.05) * (1 - E.fane) * 0.5;
  };
}
racines.forEach(ra => { ra.b.f = formeRacine(ra); });

// Tout ce qui bouge dans les fils, a l'instant t : appele une fois par image, avant d'ecrire les textures.
function majFils(t) {
  E.t = t;
  E.tension = smooth(T.tension, T.tension + 220, t) * (1 - smooth(T.flor - 60, T.flor + 250, t));
  E.ouvre = t >= T.flor ? easeOutCubic(clamp((t - T.flor) / 760)) : 0;
  E.us = 1 - 0.5 * E.ouvre;
  E.fane = smooth(T.flor + 650, T.bout - 250, t);
  E.coupe = t >= T.coupe ? Math.min(0.45, (t - T.coupe) / 1000) : 0;
  E.main.copy(mainDroite());
  if (t < T.coupe) E.coupeP.copy(E.main);
  // le dard : dans les mains, puis sur le chemin
  const mG = mainGauche(), mD = E.main;
  E.cheveuxC.copy(mG).add(mD).multiplyScalar(0.5);
  E.dardS = dardS(t);
  if (E.dardS < 0) { E.dir.copy(COUTURE.E0).sub(E.cheveuxC).normalize(); E.tete.copy(E.cheveuxC).addScaledVector(E.dir, 0.34); }
  E.sous = E.dardS < 0 ? -1 : sousTerre(E.dardS);
  if (E.dardS >= 0) { CHEMIN.at(E.dardS, E.tete); CHEMIN.tangente(E.dardS, E.dir); }
  // qui est visible
  const avantFlor = t < T.flor + 120;
  for (const tr of tresse) tr.b.actif = t >= T.tresse && avantFlor;
  for (const tr of tresse) tr.b.sec = 0;
  filC.actif = t >= T.lancer && CHEMIN.pret;
  for (const c of cheveux) c.b.actif = t >= 0 && t < T.lancer + 40;
  for (const cd of cordes) { cd.b.actif = t >= T.eclot; cd.b.sec = E.fane * 0.92; }
  for (const l of liens) { l.b.actif = t >= T.eclot + 50; l.b.sec = E.fane * 0.85; }
  for (const ra of racines) { ra.b.actif = t >= T.eclot; ra.b.sec = E.fane * 0.8; }
  for (const po of poils) { if (po.j < 12 && po.ta === Infinity && E.sous >= po.s) po.ta = t + 60; po.b.actif = t >= po.ta; po.b.sec = E.fane * 0.7; }
  // l'epine : au bout du dard, puis elle tombe dans la colonne quand elle s'ouvre, et se plante
  epine.visible = t >= T.lancer - 120;
  if (t < T.flor + 80) {
    fT.copy(E.dir); epine.position.copy(E.tete); epine.quaternion.setFromUnitVectors(UP, fT);
    epine.scale.setScalar(t < T.lancer ? smooth(T.lancer - 120, T.lancer - 40, t) : 1);
  } else {
    const dt = (t - T.flor - 80) / 1000, y = SOL_Y + H_COL + 0.05 - 4.9 * dt * dt;
    epine.position.set(C_ZONE.x + 0.12 * dt, Math.max(SOL_Y + 0.12, y), C_ZONE.z);
    epine.quaternion.setFromUnitVectors(UP, fT.set(0.3 * Math.min(1, dt * 2), -1, 0.15).normalize());
  }
  lueurDard.position.copy(E.dardS < 0 ? E.cheveuxC : E.tete); lueurDard.intensity = 0.55 * smooth(T.tresse, T.lancer - 100, t) * (1 - smooth(T.lancer, T.lancer + 80, t));
  let lc = t > T.eclot ? (0.9 + 2.4 * Math.exp(-(t - T.eclot) / 300)) * smooth(T.eclot, T.eclot + 40, t) : 0;
  for (const tb of T.batt) if (t > tb) lc += 0.9 * Math.exp(-(t - tb) / 180);
  if (t > T.flor) lc += 3.0 * Math.exp(-(t - T.flor) / 500);
  lueurCol.intensity = lc * (1 - E.fane) * (1 + 0.3 * E.tension); lueurCol.position.set(C_ZONE.x, SOL_Y + 1.5 + 2.0 * E.ouvre, C_ZONE.z);
  FILS.ecrire();
}
// a chaque relance : les poils de la couture attendent le passage du dard, ceux de la zone l'eclosion
function resetFils() { for (const po of poils) po.ta = po.j < 12 ? Infinity : T.eclot + po.taD; }
