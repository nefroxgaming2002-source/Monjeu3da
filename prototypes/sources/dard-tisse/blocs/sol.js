// La zone, a distance, et le chemin du dard sous la place : il plonge en E0, ressort en X1, replonge en E1, ressort en X2,
// replonge en E2 et jaillit au centre de la zone. Sous terre, il souleve une crete de dalles.
const TISSEUSE = V3(-3.4, 0, 0);
const C_ZONE = V3(3.0, SOL_Y, 0.15), H_COL = 4.3;
const COUTURE = { E0: V3(-1.95, SOL_Y, 0.1), X1: V3(-0.6, SOL_Y, -0.06), E1: V3(0.15, SOL_Y, -0.1), X2: V3(1.2, SOL_Y, 0.05), E2: V3(1.9, SOL_Y, 0.12) };
const SOUS = [[COUTURE.E0, COUTURE.X1], [COUTURE.E1, COUTURE.X2], [COUTURE.E2, C_ZONE]];
const SOUS_S = []; { let acc = 0; for (const [a, b] of SOUS) { SOUS_S.push(acc); acc += Math.hypot(b.x - a.x, b.z - a.z); } }
const TROUS = [COUTURE.E0, COUTURE.X1, COUTURE.E1, COUTURE.X2, COUTURE.E2, C_ZONE];
// Ce qui marque les dalles : l'annonce (des taches de moisissure ou la zone va eclore), les trous de la couture, la terre retournee,
// et l'infection : un reseau de veines de mycelium qui gagne la pierre, humide et sombre, avec une seve qui luit par plaques.
const GLSL_SOL = `
float trou(vec2 P, vec4 T, float grand, out float bord) {
  bord = 0.0; if (T.z <= 0.001) return 0.0;   // trou pas encore ouvert : rayon nul, et smoothstep a bornes egales est indefini
  vec2 q = P - T.xy; float r = length(q), an = atan(q.y, q.x);
  float n = texture2D(tNoise, vec2(an * 0.4775 + T.x, T.y * 0.3 + 0.2)).r;   // 3 periodes par tour : pas de couture
  float R = (0.065 + 0.07 * n) * T.z * grand;
  bord = smoothstep(R * 2.8, R * 1.05, r + (texture2D(tNoise, vec2(an * 0.955, r * 3.0)).g - 0.5) * R * 0.8) * T.z;
  return smoothstep(R, R * 0.6, r);
}
float veines(vec2 P) {
  vec2 w = (texture2D(tNoise, P * 0.21).rg - 0.5) * 1.4;
  float b1 = voroBord(P * 2.3 + w, 1e4), b2 = voroBord(P * 6.1 + w * 2.0 + 3.1, 1e4);
  float l1 = smoothstep(0.07, 0.0, b1 + (texture2D(tNoise, P * 1.7).b - 0.5) * 0.05), l2 = smoothstep(0.04, 0.0, b2) * 0.65;
  return max(l1, l2);
}
void cheminSous(vec2 P, out float dP, out float passe) {
  dP = 9.0; passe = 0.0;
  for (int k = 0; k < 3; k++) {
    vec2 a = uSegA[k].xy, b = uSegA[k].zw, ab = b - a; float L = length(ab); vec2 dir = ab / L;
    float lam = dot(P - a, dir), lc = clamp(lam, 0.0, L), d = length(P - a - dir * lc);
    if (d < dP) { dP = d; passe = smoothstep(uSegB[k] + lc - 0.02, uSegB[k] + lc + 0.1, uFrontS); }
  }
}
void marquesSol(vec2 P, float seed, inout vec3 alb, inout float mouille, inout vec3 emis) {
  float n1 = texture2D(tNoise, P * 0.23).r, n2 = texture2D(tNoise, P * 0.9 + seed).g, n3 = texture2D(tNoise, P * 3.1).a;
  alb *= 0.62 + 0.5 * n1 + 0.35 * (n3 - 0.5) + 0.15 * (n2 - 0.5);
  float mousse = smoothstep(0.58, 0.82, texture2D(tNoise, P * 0.6 + 1.3).r * 0.7 + n3 * 0.4);
  alb = mix(alb, vec3(0.035, 0.045, 0.028), mousse * 0.6);
  mouille = mousse * 0.25;
  vec2 rz = P - uZone.xz; float r = length(rz);
  // l'annonce : la zone se tache de moisissure avant l'eclosion, en points qui s'allument
  if (uAnnonce > 0.0) {
    float nz = texture2D(tNoise, P * 0.8 + 4.7).r;
    float zone = smoothstep(1.6, 1.05, r + (nz - 0.5) * 0.8);
    float taches = smoothstep(0.6, 0.8, texture2D(tNoise, P * 2.7 + 0.4).r * 0.8 + nz * 0.3) * zone * uAnnonce;
    alb = mix(alb, vec3(0.022, 0.012, 0.022), taches * 0.8);
    float pts = step(0.82, h21(floor(P * 30.0))) * taches;
    emis += miasme(0.4 * pts * (0.65 + 0.35 * sin(uTime * 5.0 + P.x * 13.0 + P.y * 7.0))) * uFade;
    mouille = max(mouille, taches * 0.8);
  }
  // la couture : trous dechires et terre retournee
  float bordT = 0.0, troux = 0.0;
  for (int k = 0; k < 6; k++) { float b; troux = max(troux, trou(P, uTrous[k], k == 5 ? 2.6 : 1.0, b)); bordT = max(bordT, b); }
  alb = mix(alb, vec3(0.03, 0.022, 0.018) * (0.7 + 0.6 * n3), bordT * 0.75);
  alb = mix(alb, vec3(0.004, 0.002, 0.004), troux);
  emis += miasme(0.32 * troux * uTrousLueur * (0.6 + 0.4 * n2)) * uFade;
  // l'infection : le mycelium gagne la pierre depuis la zone et le long de la couture
  if (uInfR > 0.0 || uInfP > 0.0) {
    float dP, passe; cheminSous(P, dP, passe);
    float nn = texture2D(tNoise, P * 0.5 + 2.2).g;
    float mz = smoothstep(uInfR, uInfR - 0.9, r + (nn - 0.5) * 1.5);
    float mp = smoothstep(max(uInfP * 0.8, 0.002), 0.0, dP + (nn - 0.5) * 0.35) * passe * step(0.001, uInfP);   // jamais de bornes egales
    float m = max(mz, mp);
    if (m > 0.001) {
      float v = veines(P);
      float tache = smoothstep(0.15, 0.8, m * (0.55 + 0.6 * nn));
      alb = mix(alb, vec3(0.022, 0.014, 0.022), tache * 0.6);
      alb = mix(alb, vec3(0.012, 0.004, 0.014), v * smoothstep(0.0, 0.3, m) * 0.92);
      mouille = max(mouille, max(tache * 0.8, v * m));
      float front = smoothstep(0.0, 0.25, m) * (1.0 - smoothstep(0.35, 0.95, m));   // la lueur suit le front de croissance
      float plaque = smoothstep(0.5, 0.8, texture2D(tNoise, P * 0.9 - vec2(uTime * 0.03, 0.0)).r);
      float large = smoothstep(0.14, 0.0, voroBord(P * 2.3 + (texture2D(tNoise, P * 0.21).rg - 0.5) * 1.4, 1e4));   // la lueur suit les grosses veines, jamais les fines (elles scintillent)
      emis += miasme((0.32 * front + 0.2 * uInfLueur * plaque) * large * smoothstep(0.0, 0.2, m)) * uFade;
    }
  }
}
`;
const V4 = (x, y, z, w) => new THREE.Vector4(x, y, z, w);
const uSol = { tNoise: { value: noiseTex }, uTime: { value: 0 }, uTremble: { value: 0 }, uFade: { value: 1 }, uEmber: { value: EMBER },
  uZone: { value: C_ZONE.clone() }, uAnnonce: { value: 0 }, uTrous: { value: TROUS.map(p => V4(p.x, p.z, 0, 0)) }, uTrousLueur: { value: 0 },
  uSegA: { value: SOUS.map(([a, b]) => V4(a.x, a.z, b.x, b.z)) }, uSegB: { value: V3(...SOUS_S) }, uFrontS: { value: -1 },
  uInfR: { value: 0 }, uInfP: { value: 0 }, uInfLueur: { value: 0 }, uEclot: { value: 0 }, uTension: { value: 0 }, uSouffle: { value: 0 }, uMortier: { value: 0 } };
const matDalles = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 });
matDalles.onBeforeCompile = sh => {
  Object.assign(sh.uniforms, uSol);
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', `#include <common>
attribute vec2 aCentre; attribute float aSeed; uniform float uTremble, uTime, uFrontS, uEclot, uTension, uSouffle; uniform vec4 uSegA[3]; uniform vec3 uSegB, uZone;
varying vec3 vWp; varying float vSeedD;`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>
{ float haut = step(0.01, position.y), lift = 0.0; vec2 tilt = vec2(0.0);
  // la crete : le dard passe sous la dalle, la souleve, et elle reste un peu levee ; quand le fil se tend, la place se fronce
  for (int k = 0; k < 3; k++) {
    vec2 a = uSegA[k].xy, b = uSegA[k].zw, ab = b - a; float L = length(ab); vec2 dir = ab / L, perp = vec2(-dir.y, dir.x);
    float lam = dot(aCentre - a, dir), d = dot(aCentre - a, perp), sHere = uSegB[k] + clamp(lam, 0.0, L);
    float dedans = smoothstep(-0.25, 0.05, lam) * smoothstep(L + 0.25, L - 0.05, lam);
    float prox = exp(-pow(d / 0.4, 2.0)) * dedans;
    float passe = smoothstep(sHere - 0.02, sHere + 0.14, uFrontS), front = exp(-pow((uFrontS - sHere) / 0.28, 2.0)) * step(-0.3, uFrontS - sHere);
    lift += prox * (0.15 * front + 0.03 * passe + 0.045 * uTension * passe) * (0.7 + 0.6 * aSeed);
    tilt += perp * sign(d) * prox * passe * (0.1 + 0.32 * uTension) * smoothstep(0.03, 0.18, abs(d));
  }
  // l'eclosion : les dalles de la zone se soulevent en couronne, celles du centre basculent
  vec2 rz = aCentre - uZone.xz; float r = length(rz);
  float couronne = exp(-pow((r - 0.95) / 0.55, 2.0)) * uEclot, coeur = exp(-pow(r / 0.55, 2.0)) * uEclot;
  lift += couronne * (0.06 + 0.06 * aSeed) + coeur * (0.11 + 0.1 * aSeed) + uSouffle * 0.025 * exp(-r * r / 5.0);
  tilt += (r > 1e-3 ? rz / r : vec2(0.0)) * (couronne * 0.32 - coeur * 0.3 * (aSeed - 0.5));
  transformed.y += haut * (lift + dot(position.xz - aCentre, tilt) + sin(uTime * 61.0 + aSeed * 40.0) * 0.004 * uTremble * aSeed);
  vSeedD = aSeed; vWp = (modelMatrix * vec4(transformed, 1.0)).xyz; }`);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', `#include <common>
uniform sampler2D tNoise; uniform float uTime, uFade, uAnnonce, uTrousLueur, uFrontS, uInfR, uInfP, uInfLueur; uniform vec3 uEmber, uZone, uSegB; uniform vec4 uTrous[6], uSegA[3];
varying vec3 vWp; varying float vSeedD;
${GLSL_COMMUN}
${GLSL_SOL}`)
    .replace('#include <color_fragment>', `#include <color_fragment>
float mouilleS = 0.0; vec3 emisS = vec3(0.0), albS = diffuseColor.rgb;
marquesSol(vWp.xz, vSeedD, albS, mouilleS, emisS); diffuseColor.rgb = albS;`)
    .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.32, mouilleS);`)
    .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += emisS;`);
};
matDalles.customProgramCacheKey = () => 'dalles-miasme';
const dalles = new THREE.Mesh(dallageGeo(), matDalles); dalles.receiveShadow = true; dalles.castShadow = !LOW; dalles.frustumCulled = false; scene.add(dalles);
// Le lit de mortier, visible seulement entre les dalles : la seve y luit par plaques, le long de la couture et sous la zone.
const mortier = new THREE.Mesh(new THREE.CircleGeometry(6.26, 120), new THREE.ShaderMaterial({ uniforms: uSol,
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform sampler2D tNoise; uniform float uMortier, uFade, uTime, uFrontS; uniform vec3 uZone, uSegB; uniform vec4 uSegA[3]; varying vec3 vW;
  ${GLSL_COMMUN}
  void main(){ float dP = 9.0, passe = 0.0, sh = -9.0;
    for (int k = 0; k < 3; k++) { vec2 a = uSegA[k].xy, b = uSegA[k].zw, ab = b - a; float L = length(ab); vec2 dir = ab / L; float lc = clamp(dot(vW.xz - a, dir), 0.0, L), d = length(vW.xz - a - dir * lc);
      if (d < dP) { dP = d; sh = uSegB[k] + lc; passe = smoothstep(sh, sh + 0.1, uFrontS); } }
    float front = exp(-pow((uFrontS - sh) / 0.35, 2.0)) * step(-0.2, uFrontS - sh);   // la seve qui suit le dard sous la place
    float g = uMortier * (exp(-dP * dP / 0.08) * passe * 0.7 + exp(-dot(vW.xz - uZone.xz, vW.xz - uZone.xz) / 1.4)) + 1.6 * exp(-dP * dP / 0.05) * front;
    g *= smoothstep(0.4, 0.8, texture2D(tNoise, vW.xz * 0.45 + vec2(uTime * 0.03, 0.0)).r);   // par plaques, jamais en ligne continue
    gl_FragColor = vec4(vec3(0.006, 0.005, 0.006) + miasme(min(g, 0.4) * uFade) * 0.35, 1.0); }` }));
mortier.rotation.x = -Math.PI / 2; mortier.position.y = 0.004; scene.add(mortier);

