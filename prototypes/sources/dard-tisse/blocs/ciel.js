const FOG = new THREE.Color('#2b302a');
scene.fog = new THREE.FogExp2(FOG.clone(), 0.05);
// Le ciel couvert du sous-bois : des nuees basses et lourdes, un soleil malade derriere elles.
// Pendant l'Art, le ciel s'assombrit et le Miasme le teinte, par-dessus la zone.
const SOLEIL = V3(-0.55, 0.2, -0.81).normalize();
const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 48, 24), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { tNoise: { value: noiseTex }, uTop: { value: new THREE.Color('#0c0e0b') }, uHorizon: { value: FOG.clone() }, uDim: { value: 0 }, uTime: { value: 0 }, uSoleil: { value: SOLEIL }, uTrouble: { value: 0 } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tNoise; uniform vec3 uTop, uHorizon, uSoleil; uniform float uDim, uTime, uTrouble; varying vec3 vDir;
  void main(){ vec3 d = normalize(vDir); float y = clamp(d.y * 1.5 + 0.04, 0.0, 1.0);
    vec3 c = mix(uHorizon, uTop, pow(y, 0.55));
    float a = atan(d.z, d.x) * 0.15915;   // un tour vaut 1 : les nuees se lisent avec des multiples entiers, sans couture
    vec2 q = vec2(a, d.y * 0.7 + 0.1);
    float n1 = texture2D(tNoise, q * vec2(3.0, 2.0) + vec2(uTime * 0.004, 0.0)).r, n2 = texture2D(tNoise, q * vec2(8.0, 5.0) + vec2(uTime * 0.009, 0.3)).g, n3 = texture2D(tNoise, q * vec2(19.0, 11.0) - vec2(uTime * 0.012, 0.0)).a;
    float dens = smoothstep(0.32, 0.74, n1 * 0.62 + n2 * 0.3 + n3 * 0.15) * smoothstep(-0.04, 0.22, d.y);
    float sd = max(dot(d, uSoleil), 0.0);
    vec3 lueur = vec3(0.62, 0.58, 0.4) * (pow(sd, 6.0) * 0.22 + pow(sd, 40.0) * 0.45);
    vec3 nuage = mix(vec3(0.026, 0.03, 0.026), vec3(0.1, 0.1, 0.078), pow(sd, 3.0) * (1.0 - n2 * 0.6)) * (0.8 + 0.4 * n3);
    c = mix(c + lueur, nuage + lueur * 0.3 * (1.0 - dens), dens * 0.85);
    float zone = smoothstep(0.55, 0.95, dot(d, normalize(vec3(0.35, 0.55, -0.75))));
    c = mix(c, c * vec3(0.85, 0.6, 1.05) + vec3(0.012, 0.0, 0.02) * dens, uTrouble * (0.4 + 0.6 * zone) * smoothstep(0.0, 0.4, d.y));   // le Miasme gagne le ciel
    gl_FragColor = vec4(c * (1.0 - 0.55 * uDim), 1.0); }`
}));
scene.add(sky);

