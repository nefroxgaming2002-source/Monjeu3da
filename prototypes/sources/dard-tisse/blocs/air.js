// Spores en suspension : le sous-bois respire. Elles derivent lentement, montent un peu, retombent.
const sporesAir = (() => {
  const N = nq(520), pos = new Float32Array(N * 3), ph = new Float32Array(N), r0 = mulberry32(5);
  for (let i = 0; i < N; i++) { pos[i * 3] = -9 + r0() * 21; pos[i * 3 + 1] = r0() * 5; pos[i * 3 + 2] = -9 + r0() * 16; ph[i] = r0() * 6.283; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const disc = document.createElement('canvas'); disc.width = disc.height = 32;
  const dg = disc.getContext('2d'), gr = dg.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); dg.fillStyle = gr; dg.fillRect(0, 0, 32, 32);
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xa99db4, size: 0.028, map: new THREE.CanvasTexture(disc), transparent: true, opacity: 0.5, depthWrite: false })));
  return { update(dt, t) { for (let i = 0; i < N; i++) { const p = ph[i]; pos[i * 3 + 1] += (0.035 + Math.sin(t * 0.6 + p) * 0.06) * dt; pos[i * 3] += Math.sin(t * 0.35 + p * 2.0) * 0.09 * dt; pos[i * 3 + 2] += Math.cos(t * 0.3 + p) * 0.07 * dt; if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] -= 5; } geo.attributes.position.needsUpdate = true; } };
})();
