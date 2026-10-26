# Guide des effets, sons et mises en scène des Arts

À lire **avant** de toucher aux effets, aux sons, aux animations ou à la caméra d'un Art de MonJeu3d.

La Taille Rouge (`prototypes/taille-rouge.html`) est **la barre de qualité**, pas un modèle à recopier. Chaque Art doit atteindre le même niveau de beauté, de densité, de rythme et de son, avec **sa propre identité** : sa forme, sa matière, son rythme, son geste, son son. Ne reprends jamais le croissant, les entailles retardées ou le chiburi pour un autre Art. Reprends seulement les techniques et l'exigence.

---

## 1. Ce que veut le développeur

- **Son ambition** : « beaucoup plus beau, cinématique, original tout en restant cohérent ». Chaque Art doit impressionner, à la hauteur des grandes attaques spéciales.
- **Ce qu'il a refusé** : « ça fait enfantin » (formes pastel, cercles peints), « trop simple », « je m'attends à quelque chose de beaucoup plus impressionnant ».
- **Ce qu'il a validé** : la Taille Rouge en version Art majeur (« Ok, là c'est beau »).
- **Style choisi** : *Encre et braise*. C'est un mélange de ses références d'effets :
  - Elden Ring : Frenzied Flame (braises, rémanence de cendre), Bloodflame et Rivers of Blood, sorts astraux ;
  - des effets d'encre sous Unreal 5 ;
  - le burst de Raiden (Genshin).
- **Références sonores** : les attaques spéciales d'anime, par exemple Benimaru contre son double (Fire Force) ou Milim Nava (Moi, quand je me réincarne en Slime). Il faut **ressentir** la flamme et la lame qui frappe, tout en restant original.
- **Trois lois du jeu** :
  - pas de musique ;
  - aucun visage visible ;
  - aucun vocabulaire de divinité ou de religion.
- **Plateforme** : le jeu est pensé d'abord pour mobile, puis enrichi sur PC. Chaque Art a un budget allégé pour les appareils faibles.
- **Façon de travailler** :
  - ne pas raconter chaque étape (« tu gaspilles des tokens »), seulement un point bref quand c'est utile ;
  - demander avant chaque commit ;
  - ne jamais pousser le dépôt du jeu ;
  - ne rien toucher hors du dossier du projet sur son ordinateur de cours.

## 2. Erreurs déjà faites : ne pas les refaire

| Erreur | Ce qu'il faut faire |
|---|---|
| Proposer des variantes timides et simples, puis enrichir petit à petit (v1 à v4, puis trois variantes : « extrêmement simple ») | Viser tout de suite la version la plus riche, en couches, puis retirer ce qui nuit à la lecture. |
| Cœur de l'effet blanc et saturé, aspect « sabre laser » ; rouge qui vire au saumon ou au rose (le tonemapping ACES remonte le vert et le bleu des rouges très lumineux) | Corps de couleur **profond et peu lumineux** (sang : `0.42, 0.008, 0.016` en linéaire), blanc réservé à un **tranchant fin**, halo seulement sur les bords. |
| Effet au maximum pendant la récupération | Le pic est à l'impact. Ensuite l'effet **refroidit** (chaud → couleur → charbon) et **s'effrite** en cendre et en braises. |
| Désaturer tout l'écran, ce qui grise aussi les effets | Désaturation **sélective** : les couleurs saturées (effets, cape) restent, le monde passe au gris-bleu. |
| Fumée en « coton rose » | Fumée d'encre **sombre** avec une **lisière** de braise fine. |
| Éclats chauds trop gros et à plat ; dissolution en blocs qui fait des tirets | Petits éclats qui refroidissent vite ; dissolution par bruit continu. |
| Rubans ou filets d'encre qui ressortent blancs | Les éléments d'encre restent sombres, avec une lueur sur les bords. |
| Tout désaturer et assombrir pendant le gel au point de ne plus rien lire | Assombrir modérément ; choisir un plan de caméra qui montre le sol et la lame. |
| Bips synthétiques (« son bizarre ») ; résonance aiguë qui traîne à la fin (« son aigu inutile ») | Son en **couches**, beaucoup de grave, **aucun son aigu tenu**, et un **silence** avant le climax. |
| Effets qui s'empilent jusqu'à l'illisible | **Une seule forme principale par temps** ; le reste l'accompagne. |
| Images d'impact trop longues ou trop fréquentes | Deux images au plus (négatif puis couleur de voie), seulement sur les vrais pics, coupées si l'option « réduction des flashs » est active. |
| Juger depuis un seul angle | Toujours regarder sous plusieurs angles (jeu, côté, face, dessus) et au ralenti. |
| Croire qu'une bande vers 700-800 Hz sur `showspectrumpic` en échelle log est un vrai son | C'est un **défaut d'affichage** de ffmpeg : il apparaît aussi sur un bruit rose de référence. |

## 3. La barre de qualité : ce que chaque Art doit avoir

### 3.1 Une structure en temps

Chaque Art suit ces temps, avec des durées propres, calées sur ses fenêtres de jeu (`anticipation / active / récupération` dans `arts.json`) :

1. **Charge** : la puissance monte et le monde réagit (assombrissement, matière de la voie qui converge). Un Art majeur peut ouvrir sur un **gel** : monde figé et désaturé, caméra de coupe (`ArretSurCoup.figer()` et `CoupeArt`).
2. **Départ** : le geste part, avec sa forme principale. Le corps bouge vraiment (pose d'armement profonde, déplacement, rémanences).
3. **Impact** : arrêt sur coup de 70 à 120 ms, onde de choc qui déforme l'image, flou radial, gerbe de particules, lumière, secousse et coup de focale.
4. **Contrepoint** : un **second temps** qui surprend, **propre à l'Art**. Ce peut être un silence suivi d'un éclatement, une réplique, un écho, une chute, une floraison retardée… Jamais le même d'un Art à l'autre.
5. **Après** : l'effet refroidit et se défait. Des traces restent au sol (taches, fissures, brûlures) et le monde revient.
6. **Clôture** : un geste final du personnage, propre à l'arme ou à la voie.

### 3.2 Des couches visuelles

Au minimum, chaque temps fort combine :

- **une forme principale** lisible (le croissant de la Taille Rouge, la cloche de la Cloche fêlée…) ;
- **une couche d'encre** pour le contraste sombre ;
- **une couche de lumière** : tranchant, cœur, filament ;
- **trois tailles de particules** : étincelles fines étirées, braises ou spores moyennes, gouttes ou éclats lourds qui retombent et marquent le sol ;
- **un volume** : fumée, brume ou poussière qui se déchire avec l'âge ;
- **le sol** : tache, fissure, brûlure ou tourbillon ;
- **une lumière dynamique** : éclair d'impact, lueur de l'arme ;
- **un passage d'écran** : onde de choc, flou radial, lignes de vitesse à l'encre, images d'impact, voile ;
- **la caméra** : secousse, coup de focale, et un plan cinéma pour les Arts majeurs ;
- **le corps** : pose, élan, rémanences, cape et écharpe qui réagissent.

### 3.3 Des couleurs

- **Trois valeurs au plus par Art** : l'encre (presque noire), le corps de la couleur de voie en version **profonde**, et un accent lumineux.
- **Palettes `EncreBraise.palette`** (braise, en linéaire) :
  - Sang `1, 0.13, 0.06` ;
  - Astro `0.42, 0.62, 1` ;
  - Airain `1, 0.5, 0.12` ;
  - Miasme `0.62, 0.32, 1`.
- **Contraste** : le monde s'assombrit **avant** le pic, pour que la lumière éclate.
- **Lumière dans `ALBEDO`** : avec `render_mode unshaded`, `EMISSION` n'est pas ajoutée. Il faut mettre des valeurs > 1 pour que le halo les attrape (seuil du halo 0,85).

### 3.4 Le son

Le son se pense **par couches**, comme l'image. Rien de tonal et aigu ne doit être tenu.

- **Charge** : montée de puissance (accord grave qui grimpe, s'ouvre et vibre de plus en plus vite), plus la matière de l'Art (feu, métal, spores, verre…), plus un souffle inversé jusqu'au départ.
- **Gel** : le son du monde est aspiré vers le grave, et le vent se coupe.
- **Départ** : souffle ou « zan » court, plus la matière.
- **Impact** :
  - claquement ;
  - coup saturé ;
  - grave de 60 à 22 Hz ;
  - corps d'explosion qui gronde plusieurs secondes ;
  - matière de l'Art ;
  - débris et gouttes.
- **Contrepoint** : silence (on baisse tout, réverbération comprise), un battement sourd, puis le climax plus fort que l'impact.
- **Clôture** : un son court et propre, sans longue résonance.
- **Bus** :
  - réverbération longue et sombre (environ 3,4 s) ;
  - compresseur (seuil −24 dB, ratio 5) ;
  - légère saturation, puis limiteur à −1,5 dB ;
  - ambiance baissée pendant le gel et le silence.
- **Mesure de contrôle** : environ 15 dB d'écart entre l'impact et le silence. Le climax est au niveau de l'impact ou au-dessus.
- **Pour le jeu final**, de vrais enregistrements superposés selon la même recette donneront mieux que la synthèse. La synthèse sert au prototype.

### 3.5 La lisibilité et le budget

- La forme principale dit **où ça touche**. Les effets ne cachent jamais la cible plus d'un instant.
- Les entailles retardées, les chutes à genou et les autres effets de ce genre sont du **visuel**. La vue n'écrit jamais l'état du combat : la règle du projet est que la vue ne fait que lire.
- **Mobile** (`ProfilMateriel`, palier BAS) : pas de distorsion, pas de flou radial, pas de fumée, particules réduites de 40 %, mêmes temps et même son.

## 4. L'identité de chaque voie : ce qui doit changer d'un Art à l'autre

| Voie | Matière | Verbes | Pistes de son |
|---|---|---|---|
| **Sang** | encre rouge, feu, cendre | trancher, saigner, embraser | feu qui rugit, lame, giclées |
| **Astro** | lumière froide, étoiles, verre, nuit | tracer, relier, figer | cristal, souffle d'air glacé, silence, grave lointain |
| **Airain** | bronze, or fondu, poussière, cloche | frapper, sonner, fondre | cloches graves et fêlées, métal qui se tord, sol qui se fend |
| **Miasme** | spores, fils, brume violette, chair végétale | éclore, tisser, infecter | souffles organiques, craquements humides, essaims |

Pour chaque Art, change **au moins** :
- la forme principale ;
- la trajectoire (ce qui **voyage** au lieu d'apparaître) ;
- le contrepoint ;
- le mouvement de caméra ;
- le geste de clôture ;
- le son de la matière.

## 5. La méthode, Art par Art

1. **Lire** ces sources :
   - `donnees/combat/arts.json` : id, voie, forme, valeurs, fenêtres de jeu ;
   - `scripts/rendu/mise_en_scene_arts.gd` et `scripts/rendu/encre_braise.gd` ;
   - `docs/00_decisions/ADR-027` (§ 18) et `ADR-028` ;
   - ce guide et la fiche de l'Art (section 7).
2. **Écrire la fiche de l'Art** en une page, avant tout code :
   - le verbe et la matière ;
   - la forme principale ;
   - les six temps avec leurs durées en ms ;
   - les couches de chaque temps ;
   - le son, couche par couche ;
   - le contrepoint ;
   - ce qui le distingue des Arts déjà faits ;
   - le budget mobile.

   La faire valider par le développeur en quelques lignes.
3. **Prototype navigateur**, recommandé pour aller vite. Partir du moteur de `prototypes/taille-rouge.html` :
   - rendu avec halo ;
   - image retravaillée : distorsion, flou radial, lignes de vitesse, images d'impact, désaturation sélective ;
   - particules et fumée ;
   - caméras (cinéma, jeu, côté, face, dos, dessus, libre, 4 angles) ;
   - son synthétisé ;
   - ralenti et frise des phases.

   Garder ce socle, réécrire la scène de l'Art, publier, et attendre le retour avant Godot.
4. **Porter dans Godot** (section 6), sans changer les dégâts ni les durées, sauf demande.
5. **Vérifier** :
   - captures fixes sur une campagne dédiée (sur le modèle de `--reference-encre`) ;
   - film Movie Maker. Au 25 octobre, il s'arrêtait encore parfois après une image, sans message d'erreur. Écrire l'AVI dans le dossier temporaire a aidé sans tout régler : c'est à éclaircir en premier ;
   - plusieurs angles ;
   - palier mobile ;
   - spectrogramme et courbe de niveau du son.
6. **Livrer** :
   - un lien ou une vidéo ;
   - trois lignes : ce qui a changé, ce qui reste, la question ouverte ;
   - demander avant de commiter.

## 6. Du prototype à Godot

| Prototype (`prototypes/taille-rouge.html`) | Godot (projet MonJeu3d) |
|---|---|
| Shader du trait : révélation, embrasement qui suit la lame, chaleur récente, refroidissement, brûlure en cendre | `scripts/rendu/trait_encre.gdshader` et `EncreBraise.entaille()` |
| Composition finale : distorsion, flou radial, aberration, lignes de vitesse, négatif puis duo, désaturation sélective, voile | un shader d'écran sur un `ColorRect` (suite de `onde_choc.gdshader`, `voile_ecran.gdshader`, `impact_frame.gd`) |
| Tourbillon, fissure, taches | plans avec shader posés au sol (comme `zone_peinte`) ; les `Decal` n'acceptent pas de shader |
| Filets d'encre, écharpe | rubans `ImmediateMesh` recalculés face caméra |
| Braises, étincelles, gouttes étirées | `GPUParticles3D` avec `etincelle.gdshader` et `goutte.gdshader` |
| Fumée d'encre | `GPUParticles3D` en quads avec bruit et dissolution |
| Éclats de pierre | `GPUParticles3D` avec maillage et collision au sol |
| Rémanences | `EncreBraise.remanence()` (`bake_mesh_from_current_skeleton_pose`) |
| Gel, arrêts sur coup, caméra | `ArretSurCoup.figer()`, `CoupeArt`, `CameraVive` |
| Chorégraphie | `MiseEnSceneArts` et `donnees/rendu/corps.json` |
| Sons | WAV dans le dossier audio, `donnees/audio/sons.json`, `bande_son.gd`. Les nouveaux moments (silence, éclatement, clôture) doivent être autorisés dans la validation de `depot.gd`. |

Les sons de la Taille Rouge sont déjà exportés dans `prototypes/sons/taille-rouge/`, avec la fiche des moments, volumes et réglages du bus. Le script `prototypes/sons/export_wav.js` les régénère.

## 7. Les autres Arts connus

D'après le code de `mise_en_scene_arts.gd` et les notes de la session du 25 octobre. Les fiches complètes (forme, valeurs, fenêtres) sont dans `donnees/combat/arts.json` : **à relire avant de commencer**. La voie est déduite des couleurs et des noms quand elle n'est pas écrite.

| Art | Voie | Ce qui existe ou est prévu |
|---|---|---|
| `TAILLE_ROUGE` | Sang | **Fait** en prototype : la barre de qualité. Son niveau en forme ONDE, « la Roue », fait tourner l'entaille autour du corps. |
| Ruée du Sang | Sang | Là où le corps est passé, une ligne d'épines de verre de sang jaillit derrière lui (`VagueEpines`). |
| `CLOCHE_FELEE` | Airain | Une cloche spectrale tombe du ciel pendant l'anticipation et sonne à l'ouverture. En repli : poussière en cercle et fissures. |
| `COUP_DE_BELIER` | Airain | Forme ONDE : la masse frappe le sol, il se fend, la poussière s'ouvre en cercle. Sinon : la poussière file devant le bouclier, le sol se fend au bout. |
| `TRAIT_D_ETOILE` | Astro | « La lance d'étoile tracée par une constellation ». |
| `NUIT_LUE` | Astro | Une constellation se lève dans le ciel (environ 6 s). |
| `INSTANT_FIGE` | à confirmer | Fissures au sol pour l'instant. |
| `FLORAISON` | Miasme | « La fleur de spores qui s'ouvre » : cercle et colonne. |
| `SOUFFLE_DE_SPORES` | Miasme | Cône de spores. |
| `DARD_TISSE` | Miasme | En forme ZONE : une colonne à distance. |
| `COEUR_OUVERT` | à confirmer | Fissures au sol, sur 3,2 m. |
| Arts d'arme (ADR-028) | toutes | Lame, hampe, masse, crochet : des Arts sur une troisième touche, dans la matière de la voie. |

## 8. Fichiers de référence

- `prototypes/taille-rouge.html` : la barre de qualité, avec image, son, caméras et ralenti.
- `prototypes/sons/taille-rouge/LISEZMOI.md` : la fiche son.
- Dans le projet du jeu :
  - `docs/REPRISE_SESSION.md` ;
  - `docs/00_decisions/ADR-027-le-poids-des-combats.md` § 9 à 18 ;
  - `docs/00_decisions/ADR-028-les-arts-d-arme.md` ;
  - `docs/art_direction/VISAGES_D_ECLAT.md`.
