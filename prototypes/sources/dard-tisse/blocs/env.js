// Reflets : ciel couvert gris olive, horizon brumeux, le soleil malade derriere les nuees.
const envMap = (() => {
  const pm = new THREE.PMREMGenerator(renderer), s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec3 vD; void main(){ vec3 d = normalize(vD);
      vec3 c = mix(vec3(0.06, 0.066, 0.056), vec3(0.03, 0.034, 0.03), smoothstep(0.0, 0.7, d.y));
      c += vec3(0.12, 0.125, 0.1) * exp(-abs(d.y) * 7.0);
      c += vec3(0.02, 0.02, 0.016) * pow(max(-d.y, 0.0), 2.0);
      c += vec3(0.62, 0.57, 0.4) * pow(max(dot(d, normalize(vec3(-0.55, 0.2, -0.81))), 0.0), 24.0) * 0.8;
      gl_FragColor = vec4(c, 1.0); }` })));
  const t = pm.fromScene(s, 0.02).texture; pm.dispose(); return t;
})();

