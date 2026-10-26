// ================================================================== personnages
// La Tisseuse : voutee, capuche profonde dont la pointe retombe dans le dos (aucun visage : une ombre), chale dont pendent des fils,
// robe de toile grossiere dont l'ourlet s'effiloche, manches larges, mains bandees. Un fuseau d'os pend a sa ceinture.
const joueur = new THREE.Group(); scene.add(joueur);
const corpsJ = new THREE.Group(); joueur.add(corpsJ);
const lisse = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...o });
const mToile = lisse(0x2b251e, { roughness: 0.93, side: THREE.DoubleSide }), mOs = lisse(0x8a8070, { roughness: 0.5 }), mBande = lisse(0x241e19, { roughness: 0.82 });
const mOmbre = new THREE.MeshBasicMaterial({ color: 0x000000 });
// Infection des betes : point de contact (xyz) et quantite (w), une entree par bete
const uInf = { value: [V4(0, -9, 0, 0), V4(0, -9, 0, 0), V4(0, -9, 0, 0)] };
// usure : le metal et la toile ne sont jamais d'une seule couleur (taches, poli, rouille) ; le mycelium peut les gagner
function usure(mat, rouille = 0, infecte = false) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.tNoise = { value: noiseTex }; sh.uniforms.uInf = uInf; sh.uniforms.uTime = uSol.uTime;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPo, vWe;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvPo = position; vWe = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tNoise; uniform vec4 uInf[3]; uniform float uTime; varying vec3 vPo, vWe;\n' + GLSL_COMMUN)
      .replace('#include <color_fragment>', `#include <color_fragment>
float nA = texture2D(tNoise, vPo.xy * 3.1 + vPo.z * 1.7).r, nB = texture2D(tNoise, vPo.zy * 7.3 + vPo.x).g;
diffuseColor.rgb *= 0.68 + 0.6 * nA;
${rouille ? 'float rl = smoothstep(0.5, 0.78, nB * 0.7 + nA * 0.5); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.055, 0.02), rl * 0.75);' : 'float rl = 0.0;'}
float iv = 0.0, vein = 0.0;
${infecte ? `for (int i = 0; i < 3; i++) iv = max(iv, uInf[i].w * smoothstep(1.3 * uInf[i].w + 0.08, 0.05, distance(vWe, uInf[i].xyz)));
float rid = texture2D(tNoise, vPo.xy * 1.6 + vPo.z * 1.3).b, rid2 = texture2D(tNoise, vPo.zy * 3.9 + vPo.x * 0.7).b;
vein = max(smoothstep(0.6, 0.9, rid), smoothstep(0.68, 0.95, rid2) * 0.75) * smoothstep(0.0, 0.35, iv);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.03, 0.014, 0.03), smoothstep(0.1, 0.8, iv) * 0.45);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.01, 0.003, 0.012), vein * 0.9);` : ''}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(clamp(roughnessFactor + (nB - 0.5) * 0.35 + rl * 0.35, 0.05, 1.0), 0.3, vein);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor *= (1.0 - rl * 0.7) * (1.0 - vein);')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
${infecte ? 'totalEmissiveRadiance += miasme(0.5 * vein * iv * smoothstep(0.42, 0.75, texture2D(tNoise, vWe.xz * 1.1 + vWe.y * 0.4 + vec2(uTime * 0.06, 0.0)).r));' : ''}`);
  };
  mat.customProgramCacheKey = () => 'usure-' + rouille + (infecte ? '-inf' : '') + (mat.flatShading ? '-plat' : '');
}
for (const m of [mToile, mOs, mBande]) usure(m);
(function () {
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = corpsJ) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); parent.add(m); return m; };
  add(new THREE.CylinderGeometry(0.17, 0.24, 0.6, 16), mToile, 0.05, 1.12, 0, 0, 0, -0.24);                                      // buste, voute
  add(new THREE.SphereGeometry(0.25, 20, 12), mToile, -0.05, 1.36, 0).scale.set(1.0, 0.85, 1.22);                                  // le dos rond
  add(new THREE.CylinderGeometry(0.17, 0.41, 0.36, 28, 1, true), mToile, 0.02, 1.28, 0, 0, 0, -0.2);                          // la pelerine, d'ou pendent les franges
  // capuche profonde, ouverte devant ; la pointe retombe dans le dos ; dedans, l'ombre
  add(new THREE.SphereGeometry(0.235, 24, 14, Math.PI + 0.78, Math.PI * 2 - 1.56, 0, Math.PI * 0.82), mToile, 0.1, 1.6, 0, 0, 0, -0.45).scale.set(1.1, 1.2, 1.0);
  add(new THREE.ConeGeometry(0.1, 0.5, 12), mToile, -0.17, 1.72, 0, 0, 0, 2.2);
  add(new THREE.SphereGeometry(0.17, 16, 10), mOmbre, 0.15, 1.56, 0);
  for (let k = 0; k < 11; k++) { const a = -1.1 + k * 0.22; add(new THREE.SphereGeometry(0.019 + 0.008 * (k % 3 === 0), 8, 6), mOs, 0.12 + 0.2 * Math.cos(a), 1.33 - 0.07 * Math.cos(a * 2), 0.21 * Math.sin(a)); }   // perles d'os
  add(new THREE.TorusGeometry(0.25, 0.017, 6, 36), mBande, 0.04, 0.88, 0, Math.PI / 2, 0, 0);                                      // ceinture de corde
  const fuseau = add(new THREE.LatheGeometry([[0, 0], [0.012, 0.02], [0.036, 0.1], [0.03, 0.15], [0.01, 0.22], [0.006, 0.38], [0, 0.4]].map(([r, y]) => new THREE.Vector2(r, y)), 12), mOs, 0.14, 0.52, 0.25, 0.22, 0, 0.18);
  for (let k = 0; k < 5; k++) add(new THREE.TorusGeometry(0.03, 0.006, 4, 12), mBande, 0.14 + 0.02 * k, 0.6 + 0.02 * k, 0.27, Math.PI / 2 + 0.2, 0, 0);   // du fil enroule sur le fuseau
  for (const z of [-0.1, 0.1]) add(new THREE.BoxGeometry(0.2, 0.06, 0.1), mBande, 0.1, 0.03, z, 0, 0, 0, joueur);              // bouts des pieds sous la robe
})();
// les deux bras : une manche large et une main bandee, recalcules a chaque image
function brasJ() {
  const g = new THREE.Group(); scene.add(g);
  const manche = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.105, 1, 14, 1, true), mToile); manche.material.side = THREE.DoubleSide; g.add(manche);
  const main = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 8), mBande); main.scale.set(1, 1.25, 0.8); g.add(main);
  return { g, manche, main };
}
const brasG = brasJ(), brasD = brasJ();
// La robe : maillage recalcule a chaque image dans le repere du personnage, des epaules jusqu'au sol ; son ourlet s'effiloche.
const CAPE_C = 28, CAPE_R = 12;
const capeGeo = new THREE.BufferGeometry();
capeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((CAPE_C + 1) * (CAPE_R + 1) * 3), 3).setUsage(THREE.DynamicDrawUsage));
{ const idx = [], uvs = []; for (let r = 0; r <= CAPE_R; r++) for (let c = 0; c <= CAPE_C; c++) uvs.push(c / CAPE_C, r / CAPE_R);
  for (let r = 0; r < CAPE_R; r++) for (let c = 0; c < CAPE_C; c++) { const a = r * (CAPE_C + 1) + c, b = a + 1, d = a + CAPE_C + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
  capeGeo.setIndex(idx); capeGeo.setAttribute('aRobe', new THREE.Float32BufferAttribute(uvs, 2)); }
const uBrode = { value: 0 };   // la seve qui monte dans les fils de la robe pendant le tissage
const mCape = new THREE.MeshStandardMaterial({ color: 0x29231c, roughness: 0.95, side: THREE.DoubleSide, envMap, envMapIntensity: 0.3 });
mCape.onBeforeCompile = sh => {
  sh.uniforms.tNoise = { value: noiseTex }; sh.uniforms.uBrode = uBrode; sh.uniforms.uTime = uSol.uTime;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aRobe; varying vec2 vRobe;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRobe = aRobe;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tNoise; uniform float uBrode, uTime; varying vec2 vRobe;\n' + GLSL_COMMUN)
    .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
// l'ourlet s'effiloche : des franges de longueur inegale, puis des fils qui pendent
float effil = texture2D(tNoise, vec2(vRobe.x * 3.0, 0.31)).r * 0.7 + texture2D(tNoise, vec2(vRobe.x * 11.0, 0.77)).g * 0.3;
float hem = 0.84 + 0.12 * effil, fil = step(0.8, fract(vRobe.x * 140.0 + texture2D(tNoise, vec2(vRobe.x * 23.0, 0.5)).r * 3.0));
if (vRobe.y > hem + 0.08 * fil * texture2D(tNoise, vec2(vRobe.x * 37.0, 0.2)).r) discard;`)
    .replace('#include <color_fragment>', `#include <color_fragment>
vec2 tr = vRobe * vec2(150.0, 64.0); float trame = 0.5 + 0.5 * sin(tr.x * 6.2832) * sin(tr.y * 6.2832);   // la toile grossiere
float plis = texture2D(tNoise, vRobe * vec2(4.0, 1.2)).g, tache = smoothstep(0.55, 0.85, texture2D(tNoise, vRobe * vec2(2.0, 0.8) + 0.6).r);
diffuseColor.rgb *= (0.68 + 0.5 * plis) * (0.88 + 0.16 * trame);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.05, 0.022, 0.045), tache * 0.55 * smoothstep(0.4, 1.0, vRobe.y));   // la seve a seche dans la toile
`);
};
mCape.customProgramCacheKey = () => 'robe-tisseuse';
const cape = new THREE.Mesh(capeGeo, mCape); cape.frustumCulled = false; scene.add(cape);
const tmpV = V3();
function majCape(souffle, t) {
  const p = capeGeo.attributes.position.array, tw = corpsJ.rotation.y, pz = corpsJ.rotation.z;
  for (let r = 0; r <= CAPE_R; r++) {
    const f = r / CAPE_R, y = lerp(1.36, 0.03, f), e = Math.pow(f, 0.8), rx = lerp(0.22, 0.52, e), rz = lerp(0.27, 0.5, e);
    const avance = (1 - f) * 0.06 - Math.sin(pz) * (1 - f) * 0.5;   // la robe suit le dos voute
    for (let c = 0; c <= CAPE_C; c++) {
      const a = c / CAPE_C * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), dos = clamp(0.6 - ca * 0.6);
      const onde = Math.sin(t * 5 + f * 4 + a * 3) * 0.03 * f * (0.3 + souffle) + Math.sin(a * 11 + f * 2) * 0.014 * f;   // plis
      const x = ca * (rx + onde) + avance - souffle * 0.35 * Math.pow(f, 1.5) * dos, z = sa * (rz + onde), yy = y + souffle * 0.14 * f * f * dos;
      const tf = tw * (1 - f * 0.7);
      tmpV.set(x * Math.cos(tf) + z * Math.sin(tf), yy, -x * Math.sin(tf) + z * Math.cos(tf)); joueur.localToWorld(tmpV);
      p.set([tmpV.x, tmpV.y, tmpV.z], (r * (CAPE_C + 1) + c) * 3);
    }
  }
  capeGeo.attributes.position.needsUpdate = true; capeGeo.computeVertexNormals(); capeGeo.computeBoundingSphere();
}

