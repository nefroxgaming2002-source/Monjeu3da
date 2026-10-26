// Trois Rouillards groupes au loin, au milieu de la zone, tournes vers la Tisseuse.
const mRouille = flat(0x5b3b2a, { metalness: 0.5, roughness: 0.6 }), mFer = flat(0x2c2a2e, { metalness: 0.6, roughness: 0.5 }), mToileR = flat(0x5e5246);
const matsEnnemi = [mRouille, mFer, mToileR];
for (const m of [mRouille, mFer]) { m.envMap = envMap; m.envMapIntensity = 0.5; }
usure(mRouille, 1, true); usure(mFer, 1, true); usure(mToileR, 0, true);
function rouillard() {
  const racine = new THREE.Group(), penche = new THREE.Group(), corps = new THREE.Group();
  corps.rotation.y = Math.PI; racine.add(penche); penche.add(corps); scene.add(racine);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); corps.add(m); return m; };
  for (const z of [-0.16, 0.16]) { add(new THREE.BoxGeometry(0.22, 0.78, 0.22), mFer, 0, 0.39, z); add(new THREE.BoxGeometry(0.3, 0.14, 0.28), mRouille, -0.03, 0.07, z); }
  add(new THREE.BoxGeometry(0.5, 0.42, 0.6), mToileR, 0, 0.9, 0);
  add(new THREE.BoxGeometry(0.62, 0.7, 0.72), mRouille, 0, 1.36, 0);
  for (const z of [-0.45, 0.45]) {
    add(new THREE.BoxGeometry(0.42, 0.24, 0.36), mFer, 0, 1.7, z, 0, 0, 0.12);
    for (let k = 0; k < 3; k++) add(new THREE.ConeGeometry(0.05, 0.26, 5), mFer, -0.12 + k * 0.12, 1.88, z * 1.05, z > 0 ? -0.3 : 0.3, 0, 0);
    add(new THREE.BoxGeometry(0.17, 0.72, 0.17), mRouille, 0.04, 1.22, z * 1.08);
  }
  add(new THREE.BoxGeometry(0.36, 0.4, 0.36), mFer, 0.02, 2.0, 0);
  for (const z of [-0.14, 0.14]) add(new THREE.ConeGeometry(0.045, 0.32, 5), mFer, 0.02, 2.28, z, z > 0 ? -0.5 : 0.5, 0, 0);
  add(new THREE.BoxGeometry(0.02, 0.045, 0.26), new THREE.MeshBasicMaterial({ color: 0x050505 }), -0.19, 2.02, 0);
  add(new THREE.BoxGeometry(0.09, 0.95, 0.3), mRouille, -0.08, 0.72, 0.56, 0, 0, 0.22);
  return { racine, penche };
}
// autour du centre de la zone, a 0,6 m ; tournes vers la Tisseuse (vers -x)
const ennemis = [[-0.48, -0.36, 0.25], [0.5, -0.32, -0.2], [0.02, 0.6, 0.05]].map(([dx, dz, ry]) => { const e = rouillard(); e.pos0 = V3(C_ZONE.x + dx, SOL_Y, C_ZONE.z + dz); e.ry = Math.PI + ry; e.racine.position.copy(e.pos0); e.racine.rotation.y = e.ry; return e; });
for (const o of [joueur, cape, brasG.g, brasD.g, ...ennemis.map(e => e.racine)]) o.traverse(m => { if (m.isMesh) m.castShadow = true; });

