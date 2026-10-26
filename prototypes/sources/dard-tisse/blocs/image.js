// ================================================================== image
function applyFrame() {
  const d = run.dim;
  hemi.intensity = BASE.hemi * (1 - 0.75 * d); moon.intensity = BASE.moon * (1 - 0.65 * d); contre.intensity = BASE.contre * (1 - 0.5 * d); lantern.intensity = BASE.lantern * (1 - 0.8 * d);
  scene.fog.color.copy(FOG).multiplyScalar(1 - 0.65 * d); sky.material.uniforms.uDim.value = d; sky.material.uniforms.uTrouble.value = run.trouble;
  for (const b of brumes) b.material.uniforms.uDim.value = d;
  U.uVig.value = Math.min(1, d * 1.1); U.uRedVig.value = d * 0.6; U.uDesat.value = clamp(run.desat);
  U.uInv.value = run.inv > 0 ? 1 : 0; U.uDuo.value = run.inv <= 0 && run.duo > 0 ? 1 : 0;
  const mos = vue === 'mosaique';
  // budget mobile du guide : ni flou radial ni distorsion sur les appareils faibles
  U.uLines.value = reduceMotion || mos ? 0 : run.lines; U.uSeed.value = run.lineSeed; U.uRad.value = mos || LOW ? 0 : run.rad; U.uCA.value = mos || LOW ? 0 : run.ca; U.uCenter.value.copy(run.centre);
  points.mat.uniforms.uScale.value = echellePoints * (mos ? 0.5 : 1);
  U.uFade.value = 1 - run.fade;
  majFils(run.tau);
  points.write(); streaks.write(); sprites.write(); debris.write();
  U.uTime.value = run.sim / 1000;
}
function poserCamera(pose) {
  const tr = run.trauma * run.trauma, s = run.sim / 1000;
  camera.fov = pose.fov + run.fovPunch; camera.updateProjectionMatrix();
  camera.position.copy(pose.p).add(V3(Math.sin(s * 63.1) * 0.1 * tr, Math.sin(s * 71.7 + 1.3) * 0.08 * tr, Math.sin(s * 57.3 + 2.1) * 0.06 * tr));
  if (camera.position.y < 0.22) camera.position.y = 0.22;   // jamais sous les dalles
  camera.lookAt(pose.l); camera.rotateZ(pose.roll + Math.sin(s * 49.9 + 0.7) * 0.03 * tr);
  camera.updateMatrixWorld();
  sky.position.copy(camera.position);
  for (const p of panneaux) p.m.quaternion.copy(camera.quaternion);
}
function renderFrame() {
  const mos = vue === 'mosaique', liste = mos ? MOSAIQUE : [vue];
  for (const rt of [rtScene, rtDist]) { rt.viewport.set(0, 0, rt.width, rt.height); rt.scissorTest = false; }
  renderer.setRenderTarget(rtScene); renderer.setClearColor(0x000000, 1); renderer.clear();
  renderer.setRenderTarget(rtDist); renderer.setClearColor(0x000000, 0); renderer.clear();
  liste.forEach((v, i) => {
    poserCamera(camPose(v));
    for (const rt of [rtScene, rtDist]) {
      if (mos) {
        const hw = Math.floor(rt.width / 2), hh = Math.floor(rt.height / 2), x = (i % 2) * hw, y = (i < 2 ? 1 : 0) * hh, g = rt === rtScene ? 1 : 0;
        rt.viewport.set(x + (x > 0 ? g : 0), y + (y > 0 ? g : 0), hw - g, hh - g); rt.scissor.copy(rt.viewport); rt.scissorTest = true;
      }
      if (rt === rtDist && LOW) continue;
      renderer.setRenderTarget(rt); renderer.render(rt === rtScene ? scene : distScene, camera);
    }
  });
  for (const rt of [rtScene, rtDist]) { rt.viewport.set(0, 0, rt.width, rt.height); rt.scissorTest = false; }
  pass(matBright, rtScene, levels[0], true);
  for (let i = 1; i < levels.length; i++) pass(matDown, levels[i - 1], levels[i], true);
  for (let i = levels.length - 2; i >= 0; i--) pass(matUp, levels[i + 1], levels[i], false);
  quad.material = matFinal; renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(postScene, postCam);
}

