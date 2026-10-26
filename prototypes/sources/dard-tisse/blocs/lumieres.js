const hemi = new THREE.HemisphereLight(0x8a9482, 0x15130f, 1.05);
const moon = new THREE.DirectionalLight(0xcdbd96, 1.15); moon.position.set(-5.5, 6.2, -8);   // le soleil bas, derriere les nuees
const contre = new THREE.DirectionalLight(0x7d8b84, 0.55); contre.position.set(6, 5, 7);
scene.add(hemi, moon, contre);
moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 40 }); moon.shadow.camera.updateProjectionMatrix(); moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.02;
const LANTERNE = V3(-5.3, 1.85, 1.5);
const lantern = new THREE.PointLight(0xffa14a, 6, 0, 2); lantern.position.copy(LANTERNE); scene.add(lantern);
const impactLight = new THREE.PointLight(0xa36cff, 0, 0, 2); scene.add(impactLight);
