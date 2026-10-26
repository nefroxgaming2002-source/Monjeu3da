# Le moteur des prototypes : anatomie d'une page

Chaque prototype d'Art est **une seule page HTML**, sans dépendance hormis three.js 0.160 (jsDelivr). Les quatre pages partagent le même moteur ; seul ce qui est propre à l'Art change. Pour un nouvel Art, on part de la page la plus récente (`prototypes/dard-tisse.html`) et on remplace les sections propres à l'Art.

La bonne façon de faire est un **assembleur**. Un script Python lit la page de base, remplace chaque section entre deux repères par un bloc écrit à part, vérifie qu'il ne reste rien de l'ancien Art, puis écrit la nouvelle page. Exemple complet : `prototypes/sources/dard-tisse/` (`assembler.py` et `blocs/`).

## Les sections, dans l'ordre de la page

| Section (repère dans le code) | Contenu | Générique ou propre à l'Art |
|---|---|---|
| `<style>` | Mise en page : scène 16/9, frise des phases, boutons, découpage en six temps, notes Godot. Couleurs de la voie dans `:root` (`--or`, `--braise`, `--or-sombre`). | Générique, sauf les trois couleurs |
| `<header>`, `.temps`, `.godot` | Textes : sur-titre, titre, chapeau, les six temps, ce qu'il faut faire dans Godot. | Propre à l'Art |
| `// === outils` | `rand`, `clamp`, `lerp`, `smooth`, les courbes d'accélération, `V3`, `LOW` (palier mobile), `nq()` (budget de particules). **La palette** `EMBER` (accent de la voie) et `CORE` (cœur). `noiseTex` : bruit tuilable, avec du fbm grave en `.r`, du fbm aigu en `.g`, des crêtes en `.b` et un fbm décalé en `.a`. `GLSL_COMMUN` : les hachages, `corpsNoir()`, `voroBord()`, `jag()` et **la rampe de lumière de la voie** (`froid()`, `miasme()`…). | Générique, sauf la palette et la rampe |
| `// === rendu` | Le rendu dans une cible HalfFloat avec MSAA 4×, une passe de distorsion et un halo à cinq niveaux. Le shader final `FS_FINAL` ajoute le flou radial, l'aberration, la désaturation sélective, la vignette, les lignes de vitesse à l'encre, le négatif et le duo, et le grain. Les couleurs du duo, de la vignette et des lignes sont propres à la voie. | Générique, sauf ces couleurs |
| `// === decor` | Le brouillard et le ciel, les lumières (`hemi`, `moon`, `contre`, `lantern`, `impactLight`, `BASE`), `envMap` (les reflets). `dallageGeo()` : des dalles chanfreinées en vrai volume, avec `aCentre` et `aSeed` par dalle. Le shader des dalles, avec les marques au sol (`GLSL_SOL`, `marquesSol()`) et le décalage de sommets. Le lit de mortier, les ruines, la brume basse, l'ambiance (neige, spores…). | Ciel, lumières, marques et ambiance propres à l'Art |
| `// === personnages` | Le lanceur : un groupe `joueur` > `corpsJ`, une robe recalculée à chaque image (`majCape`), des bras (`brasJ`, `poserBras`) et l'usure des matériaux (`usure()`). Puis les trois Rouillards : `rouillard()`, `ennemis[]` avec `racine` et `penche`. | Le lanceur est propre à l'Art ; les Rouillards se réutilisent |
| `// === systemes de particules` | `points` : spores, braises, poudre (couleur HDR en additif, ou cendre qui assombrit, avec attraction possible). `streaks` : étincelles et gouttes étirées ; avec `ink`, elles tachent le sol. `sprites` : fumée qui se déchire (genre 0), halo (genre 1), poussière en volume (genre 2). `debris` : éclats froids et chauds. `splats` : taches au sol. | Générique ; adapter les couleurs du genre 0 et de `FS_SPLAT` |
| `// === pieces d'effet` | `panneau()` pour les panneaux face caméra : étoile d'impact, onde de choc `FS_DSHOCK` et voile de chaleur `FS_DHAZE` (ces deux-là dans `distScene`). `halo()`. | Générique |
| L'Art (après `halo()`) | Tout ce qui fait la forme principale : géométries, shaders, systèmes propres (fils, verre, cloche…). | Propre à l'Art |
| `// === son` | `/* <synthese>` … `/* </synthese> */` : la synthèse en JavaScript pur, sans DOM, exécutée dans un worker. On y trouve les briques communes (bruits, filtres, `coup`, `grave`, `claque`, `montee`, `aspire`, `souffle`, `explosion`…), puis les briques et **les recettes** de l'Art (un objet `{ nom() { … } }`), l'ambiance, la réverbération et `toutesLesRecettes()`, puis `reverberer()` (commune : elle calcule d'avance la réverbération de chaque son, par FFT, dans le worker, qui envoie d'abord les sons secs puis leur réverbération). Ensuite `Son` : le bus (coupe à 35 Hz, compresseur, saturation, limiteur à −3 dB ; pas de `ConvolverNode` : la réverbération de chaque son est un second tampon, « humide », envoyé au retour) et `jouer(nom, gain, envoi, idx, baisse)`, `ambiance('fige' / 'silence' / 'normal')`, `couper()`. | Briques et recettes propres à l'Art ; `Son` est générique |
| `// === mise en scene` | Les temps `T` (en ms depuis le début de l'Art), les poses du lanceur et des bêtes, les petits émetteurs (spores, sève, poussière…), `start()` (tout remettre à zéro), `step()` (une image de simulation : arrêt sur coup, gel…), `scenario(t, dt)` (le déroulé : chaque événement une seule fois, grâce à `run.flags`). | Propre à l'Art (sauf `step`, presque générique) |
| `// === camera` | Les vues fixes (`VUES`, `MOSAIQUE`), l'orbite libre et `poseCine()` : le plan cinéma, plan par plan. | Propre à l'Art |
| `// === image` | `applyFrame()` : lumières, voile et uniformes de l'écran, puis l'écriture des particules (et des fils). `poserCamera()`, avec la secousse et la caméra jamais sous le sol. `renderFrame()`, avec la mosaïque et le palier mobile sans distorsion. | Presque générique |
| `// === interface` | La frise (`drawTimeline`, avec un trait par moment fort), l'affichage de la phase (`updateHud`), les vues, l'orbite à la souris et au doigt, le ralenti, la boucle et le son. | Presque générique |
| Le crochet | `window.__<art> = { son: Son, T, get sim(), get tau(), seek(vue, ms, pendantArret, orbite) }`. Il sert aux outils de `outils/`. | À garder tel quel |

## Ce qu'il faut garder d'une page à l'autre

- **Le budget mobile.** Si `LOW` est vrai : pas de distorsion, pas de flou radial, pas d'ombres, particules réduites de 40 %, géométrie allégée.
- **`reduceMotion`** : pas de boucle, pas de secousse, pas d'images d'impact.
- **Le son.** Il ne se prépare qu'au clic sur « Son » (la synthèse prend 1 à 2 s dans un worker). Chaque relance coupe les sons en cours.
- **Le texte de la page.** Il est en français, et décrit ce qu'on voit, temps par temps.
- **La fin de boucle.** `uFade` efface les marques au sol juste avant de relancer, pour ne jamais voir de saut.
