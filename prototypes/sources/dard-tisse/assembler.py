# Dard Tisse : part du moteur du Trait d'Etoile (rendu, particules, son, interface) et remplace tout ce qui est propre a l'Art.
# Usage : python3 prototypes/sources/dard-tisse/assembler.py prototypes/trait-etoile.html prototypes/dard-tisse.html
import os, sys
D = os.path.dirname(os.path.abspath(__file__))
S = open(sys.argv[1], encoding='utf-8').read()
lire = lambda n: open(os.path.join(D, 'blocs', n), encoding='utf-8').read()

def patch(old, new, n=1):
    global S
    assert S.count(old) == n, (S.count(old), old[:100])
    S = S.replace(old, new)

def entre(debut, fin, new):
    global S
    a = S.index(debut); b = S.index(fin, a)
    S = S[:a] + new + S[b:]

# ---------------------------------------------------------------- la page
patch("<title>Trait d'Étoile</title>", "<title>Dard Tissé</title>")
patch("cold blue accents for the Astrologue.", "violet accents for the Miasme.")
patch("--or: #9db8f2;", "--or: #b897f2;"); patch("--braise: #cfe0ff;", "--braise: #dccbff;"); patch("--or-sombre: #22315e;", "--or-sombre: #3a2556;")
patch("color: #0a1024; background: var(--or);", "color: #170a26; background: var(--or);"); patch(".rejouer:hover { background: #b7cdfa; }", ".rejouer:hover { background: #c9adf6; }")
a = S.index('<header>'); b = S.index('</header>') + len('</header>')
S = S[:a] + """<header>
    <p class="eyebrow">MonJeu3d · Voie du Miasme · Art de zone à distance</p>
    <h1>Dard <span>Tissé</span></h1>
    <p class="lede">La Tisseuse tresse un dard de chair entre ses mains, le plante dans les dalles et le fait courir sous la place, qu'il coud en deux points. <b>Il jaillit au milieu des bêtes et se tisse en colonne</b> autour d'elles. Puis elle tire le fil : la place se fronce, la colonne se serre, et finit par s'ouvrir comme une fleur en expirant ses spores. Change d'angle pendant qu'il tourne, et active le son, au casque de préférence.</p>
  </header>""" + S[b:]
patch('aria-label="L\'Astrologue lance le Trait d\'Étoile à travers trois Rouillards en file"', 'aria-label="La Tisseuse coud le sol jusqu\'à trois Rouillards et les enferme dans une colonne tissée qui fleurit"')
patch("ART&nbsp;&nbsp;TRAIT D'ÉTOILE", "ART&nbsp;&nbsp;DARD TISSÉ")
patch("Anticipation 600 ms (tracé, forge)", "Anticipation 760 ms (tissage, couture)"); patch("Active 140 ms", "Active 200 ms"); patch("Récupération 500 ms", "Récupération 600 ms")
patch("Trois percées · les vaincus reliés · trois extinctions · clôture", "Deux points de couture · éclosion · tension · floraison · clôture")
a = S.index('<ol class="temps">'); b = S.index('</ol>', a) + len('</ol>')
S = S[:a] + """<ol class="temps">
      <li><span class="quand">0 – 520 ms · anticipation</span><h3>Tissage</h3><p>Le ciel se couvre. Des poils de mycélium sortent des joints autour de la Tisseuse et montent vers ses mains, qui tournent l'une autour de l'autre : le dard s'y tresse, sept cordes de chair et une épine de chitine. Au loin, la zone se tache de moisissure.</p></li>
      <li><span class="quand">520 – 760 ms · anticipation</span><h3>Couture</h3><p>Elle plante le dard dans les dalles. Il file sous la place en soulevant une crête de pierre, ressort deux fois en arc et replonge : le fil reste cousu derrière lui.</p></li>
      <li><span class="quand">760 ms · active · arrêt 110 ms</span><h3>Éclosion</h3><p>Le dard jaillit au milieu des bêtes. Les cordes fusent en gerbe puis se tissent en colonne, chacune passant sur l'autre puis dessous ; des liens partent de la paroi et ligotent les bêtes. Les dalles se soulèvent en couronne.</p></li>
      <li><span class="quand">+390 ms</span><h3>Tension</h3><p>La Tisseuse tire le fil. Il se tend, la place se fronce le long de la couture, la colonne se serre, et le monde se tait. Deux battements de sève remontent les cordes.</p></li>
      <li><span class="quand">+1140 ms</span><h3>Floraison</h3><p>Après un appel d'air, la colonne s'ouvre lentement par le haut en six pétales qui se recourbent, et expire un nuage de spores sombres piqué de points violets.</p></li>
      <li><span class="quand">ensuite</span><h3>Infection</h3><p>Les spores retombent, le mycélium gagne les dalles en réseau de veines, les pétales se fanent et sèchent, les bêtes s'affaissent dans leurs liens. La Tisseuse coupe le fil entre deux doigts.</p></li>
    </ol>""" + S[b:]
a = S.index('<section class="godot"'); b = S.index('</ul>', a) + len('</ul>')
S = S[:a] + """<section class="godot" aria-labelledby="t-godot">
    <h2 id="t-godot">Dans Godot</h2>
    <ul>
      <li>Les fils (cordes, dard, couture, liens, franges, mycélium) : un seul maillage de tubes dont les sommets lisent leur position dans une texture de points (64 par fil), mise à jour à chaque image ; même shader de chair humide, de brins en hélice et de sève. En repli, des <code>Path3D</code> avec <code>CSGPolygon3D</code> ou des <code>ImmediateMesh</code>.</li>
      <li>L'épine : un maillage tourné et courbé, matériau de chitine (vernis, irisation).</li>
      <li>Le sol : le shader des dalles porte l'annonce, les trous, la terre retournée et l'infection (veines de Voronoï qui poussent depuis la zone) ; un décalage de sommets soulève la crête de la couture, la couronne de l'éclosion et le froncement de la tension.</li>
      <li>Spores, nuage, sève, mottes et poussière : <code>GPUParticles3D</code> ; onde de choc, voile et images d'impact : le shader d'écran commun.</li>
      <li>Durées supposées ici (760 / 200 / 600 ms), zone de 1,4 m à 6,4 m : à caler sur <code>arts.json</code>. La couture, la tension, la floraison et l'infection restent du visuel.</li>
    </ul>""" + S[b:]

# ---------------------------------------------------------------- outils, rendu
patch("""// Palette ASTRO (EncreBraise) en lineaire : bleu d'etoile, coeur blanc froid, encre de nuit
const EMBER = V3(0.42, 0.62, 1.0);
const CORE = V3(0.9, 0.95, 1.0);""", """// Palette MIASME (EncreBraise) en lineaire : violet de seve, coeur lilas pale ; la chair des cordes est lie-de-vin
const EMBER = V3(0.62, 0.32, 1.0);
const CORE = V3(0.93, 0.86, 1.0);""")
a = S.index("// la lumiere froide : encre de nuit"); b = S.index("float jag(float y", a)
S = S[:a] + """// la lumiere du Miasme : encre, violet profond, violet de seve, lilas pale au coeur ; l'equivalent du corps noir
vec3 miasme(float T){ T = max(T, 0.0);
  vec3 c = mix(vec3(0.0), vec3(0.09, 0.015, 0.14), smoothstep(0.0, 0.25, T));
  c = mix(c, vec3(0.62, 0.32, 1.0), smoothstep(0.2, 0.62, T));
  c = mix(c, vec3(0.93, 0.86, 1.0), smoothstep(0.62, 1.05, T));
  return c * (T * T * 5.0 + T * 1.2); }
""" + S[b:]
patch("c = mix(c, mix(vec3(l0) * vec3(0.78, 0.86, 1.12), c, vif), uDesat);", "c = mix(c, mix(vec3(l0) * vec3(0.92, 0.98, 0.88), c, vif), uDesat);")
patch("c += vec3(0.004, 0.012, 0.05) * (1.0 - vig) * (1.0 - vig) * uRedVig;", "c += vec3(0.03, 0.005, 0.045) * (1.0 - vig) * (1.0 - vig) * uRedVig;")
patch("m = mix(m, vec3(0.003, 0.005, 0.016), line * uLines * 0.9);", "m = mix(m, vec3(0.012, 0.004, 0.016), line * uLines * 0.9);")
patch("vec3 duo = l > 0.5 ? vec3(0.9, 0.95, 1.0) : (l > 0.045 ? vec3(0.004, 0.006, 0.02) : vec3(0.1, 0.22, 0.62));",
      "vec3 duo = l > 0.5 ? vec3(0.93, 0.86, 1.0) : (l > 0.045 ? vec3(0.012, 0.004, 0.016) : vec3(0.36, 0.11, 0.55));")
patch("  rtCopie.setSize(W, H); uVerre.uRes.value.set(W, H);\n", "")

# ---------------------------------------------------------------- decor
entre("const FOG = new THREE.Color(", "const hemi = ", lire('ciel.js'))
entre("const hemi = ", "const BASE = ", lire('lumieres.js'))
entre("// Reflets : nuit froide", "// Le dallage :", lire('env.js'))
patch("const col = new THREE.Color(), pale = new THREE.Color(0.62, 0.66, 0.78);", "const col = new THREE.Color(), pale = new THREE.Color(0.55, 0.58, 0.5);")
patch("col.setHSL(222 / 360, (8 + r0() * 7) / 100, (22 + r0() * 17) / 100);", "col.setHSL(80 / 360, (6 + r0() * 8) / 100, (19 + r0() * 15) / 100);")
patch("g.fillStyle = '#1c2230';", "g.fillStyle = '#1b1d17';")
patch("'rgba(10,12,18,0.5)' : 'rgba(120,132,160,0.18)'", "'rgba(8,9,6,0.5)' : 'rgba(110,118,96,0.16)'")
patch("gr.addColorStop(0, 'rgba(190,200,225,0.22)'); gr.addColorStop(1, 'rgba(190,200,225,0)');", "gr.addColorStop(0, 'rgba(150,160,130,0.16)'); gr.addColorStop(1, 'rgba(150,160,130,0)');")
entre("// Ce qui marque les dalles", "const flat = ", lire('sol.js'))
patch("pierre = flat(0x171b24), bois = flat(0x1e1a1b);", "pierre = flat(0x1b1e19), bois = flat(0x1d1914);")
patch("flat(0x23262e, { metalness: 0.4 })", "flat(0x24251f, { metalness: 0.4 })"); patch("flat(0x1b2030)); toit", "flat(0x1f2119)); toit")
patch("uCol: { value: V3(0.09, 0.105, 0.15) }", "uCol: { value: V3(0.08, 0.09, 0.075) }")
patch("emissive: 0xffa24d, emissiveIntensity: 2.2", "emissive: 0xffa24d, emissiveIntensity: 0.8")
entre("// Neige", "// ================================================================== personnages", lire('air.js'))

# ---------------------------------------------------------------- personnages
entre("// ================================================================== personnages", "// Trois Rouillards", lire('tisseuse.js'))
entre("// Trois Rouillards", "// ================================================================== systemes de particules", lire('rouillards.js'))

# ---------------------------------------------------------------- particules : nuage de spores, seve, mottes
patch("""        vec3 corps = mix(vec3(0.004, 0.006, 0.016), vec3(0.025, 0.04, 0.1), chaud * (1.0 - n2 * 0.6));""",
      """        vec3 corps = mix(vec3(0.012, 0.007, 0.012), vec3(0.055, 0.018, 0.08), chaud * (1.0 - n2 * 0.6));""")
patch("float etoile = step(0.94, pt) * smoothstep(0.35, 0.05, length(fract(cel) - 0.5)) * (1.0 - age);\n        gl_FragColor = vec4(corps * a + vec3(0.75, 0.85, 1.0) * etoile * a * 1.6, a); }`",
      "float etoile = step(0.978, pt) * smoothstep(0.35, 0.05, length(fract(cel) - 0.5)) * (1.0 - age) * (0.6 + 0.4 * sin(age * 30.0 + pt * 50.0));\n        gl_FragColor = vec4(corps * a + vec3(0.62, 0.32, 1.0) * etoile * a * 2.0, a); }`")
patch("gl_FragColor = vec4(vec3(0.03, 0.022, 0.015) * a + corpsNoir(uGlow * 0.85 * (1.15 - r) * (0.6 + 0.6 * n)) * m * uLife, a); }`;",
      "gl_FragColor = vec4(vec3(0.03, 0.008, 0.03) * a + miasme(uGlow * 0.6 * (1.15 - r) * (0.6 + 0.6 * n)) * m * uLife, a); }`;")
patch("const froid = new THREE.InstancedMesh(geo, flat(0x2c313c), N)", "const froid = new THREE.InstancedMesh(geo, flat(0x272a22), N)")
patch("chaud.instanceColor.setXYZ(b, EMBER.x * h, EMBER.y * h + 0.05, EMBER.z * h);", "chaud.instanceColor.setXYZ(b, 0.07 + EMBER.x * h * 0.4, 0.014 + EMBER.y * h * 0.4, 0.045 + EMBER.z * h * 0.4);")
patch("const h = Math.max(0.03, 4 * Math.exp(-d.age * 3.5));", "const h = Math.max(0.0, 2.5 * Math.exp(-d.age * 2.5));")

# ---------------------------------------------------------------- l'Art
entre("// ---------------------------------------------------------------- le trait d'etoile", "// ================================================================== son", lire('art.js') + "\n")

# ---------------------------------------------------------------- son
entre("  // ---------------------------------------------------------------- l'Astrologue : air qui gronde", "    ambiance() { // vent dans les ruines", lire('son.js'))
entre("function toutesLesRecettes(syn) {", "// La reverberation de la place", lire('recettes.js'))

# ---------------------------------------------------------------- mise en scene, camera, image, interface
entre("// ================================================================== mise en scene", "// ================================================================== image", lire('scene.js'))
entre("// ================================================================== image", "// ================================================================== interface", lire('image.js'))
entre("function drawTimeline() {", "function changerVue(v) {", lire('interface.js'))
patch("if (reduceMotion) { let n = 0; while (run.tau < T.plante + 80 && n++ < 400) step(1000 / 60); }", "if (reduceMotion) { let n = 0; while (run.tau < T.flor + 300 && n++ < 400) step(1000 / 60); }")
patch("window.__traitEtoile = { son: Son, T, get sim() { return run.sim; }, get tau() { return run.tau; }, seek(", "window.__dardTisse = { son: Son, T, get sim() { return run.sim; }, get tau() { return run.tau; }, seek(")

script = S.split('<script type="module">')[1]
for mot in ['traitEtoile', 'lance.', 'cristaux', 'faille', 'verreScene', 'froid(', 'ASTROLOGUE', 'astres', 'uGel', 'snow.', 'givre', 'corpsNoir(u']:
    assert mot not in script, ('reste', mot)
open(sys.argv[2], 'w', encoding='utf-8').write(S)
print('assemble :', len(S.splitlines()), 'lignes')
