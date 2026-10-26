# Guide des effets, sons et mises en scène des Arts

À lire **avant** de toucher aux effets, aux sons, aux animations ou à la caméra d'un Art de MonJeu3d.

La Taille Rouge (`prototypes/taille-rouge.html`) est **la barre de qualité**, pas un modèle à recopier. Chaque Art doit atteindre le même niveau de beauté, de densité, de rythme et de son, avec **sa propre identité** : sa forme, sa matière, son rythme, son geste, son son. Ne reprends jamais le croissant, les entailles retardées ou le chiburi pour un autre Art. Reprends seulement les techniques et l'exigence.

---

## 1. Ce que veut le développeur

- **Son ambition** : « beaucoup plus beau, cinématique, original tout en restant cohérent ». Chaque Art doit impressionner, à la hauteur des grandes attaques spéciales.
- **Ce qu'il a refusé** :
  - « ça fait enfantin » (formes pastel, cercles peints) ;
  - « trop simple », « je m'attends à quelque chose de beaucoup plus impressionnant » ;
  - sur la première Cloche fêlée : « C'est trop simple encore une fois. Les traits sont simples, la cloche est simple, tout est simple, ça redonne l'effet dessin animé. » Voir la section 3.6 : c'est **le** défaut à ne plus jamais livrer.
- **Ce qu'il a validé** :
  - la Taille Rouge en version Art majeur (« Ok, là c'est beau ») ;
  - la Cloche fêlée refaite en vraie matière (« c'est pas mal »).
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
| Fumée en « coton rose » | Fumée d'encre **sombre**. Pour le Sang seulement, une lisière de braise fine ; ailleurs, une chaleur douce par-dessous (voir la ligne sur les liserés). |
| Cloche fêlée v1 : cloche lisse et translucide, anneaux d'or parfaits pour montrer le son, ciel en disque lumineux, fissures en traits fins (« ça redonne l'effet dessin animé ») | Appliquer la section 3.6 : une vraie matière, du détail à trois échelles, aucune primitive propre, et l'énergie montrée par son effet sur le monde. |
| Liseré fin et brillant sur la fumée ou au bord des fragments : on croit voir des éclairs dans l'air ou des contours au néon | Fumée sombre, éclairée doucement par en dessous. Bords chauds larges, plus orange que blancs, qui refroidissent vite. |
| Fissures et fêlures en traits fins, blancs, en zigzag : ce sont des éclairs | Une fente : bords sombres et charbonneux, largeur irrégulière, tracé sinueux, lueur orange au fond et par endroits seulement. |
| Encre brillante (rugosité basse) sous une lumière forte : le reflet efface le trait | Encre mate (rugosité vers 0,85). |
| Image négative vide : forme principale sombre dans une scène sombre | Faire flamber la forme principale à l'impact, puis vérifier le négatif en vue cinéma **et** en vue de jeu. |
| Lueur « carrée » à l'explosion : un halo dessiné sur un quad n'était pas nul au bord, et le quad se voyait | Tout dégradé posé sur un quad doit tomber à zéro **avant** le bord (soustraire la valeur au bord, puis fondre vers 1). Vérifier chaque halo, éclat et étoile sur fond sombre. |
| Lumière d'impact et flash émissif froids trop forts : les bêtes deviennent des blocs blancs | Lumières d'impact faibles près des corps (3 à 9) et flash émissif très bas (environ 0,04). Vérifier une capture pendant l'arrêt sur coup. |
| Lance fine et lumineuse sur toute sa longueur : un sabre laser | Un objet en verre lisible (épaisseur, facettes, réfraction), et la lumière concentrée en un point : l'étoile à la pointe. |
| Marque de visée au sol en ligne droite et claire : encore un trait propre | Laisser la forme principale porter la visée (la constellation). Au sol, seulement des marques irrégulières, après le coup. |
| Vapeur claire et opaque : du coton | Vapeur sombre, très transparente, qui tombe. |
| Couture dans le ciel : une texture lue avec un angle multiplié par un nombre non entier | Multiplier l'angle par des entiers, pour retomber sur la période de la texture. |
| Joints du dallage éclairés le long d'une ligne : des anneaux propres réapparaissent | Pas de lumière continue dans des joints concentriques. Si on en met, par plaques et faible. |
| Erreur de shader silencieuse : `smoothstep` avec deux bornes égales (largeur nulle) a rendu tout le haut de la cloche blanc | Multiplier par `step(ε, largeur)` partout où une largeur peut tomber à zéro. |
| Éclats chauds trop gros et à plat ; dissolution en blocs qui fait des tirets | Petits éclats qui refroidissent vite ; dissolution par bruit continu. |
| Rubans ou filets d'encre qui ressortent blancs | Les éléments d'encre restent sombres, avec une lueur sur les bords. |
| Tout désaturer et assombrir pendant le gel au point de ne plus rien lire | Assombrir modérément ; choisir un plan de caméra qui montre le sol et la lame. |
| Pluie de petits éclats aigus de verre, de bronze ou de pierre (« bruits de pièces inutiles ») | Aucun tintement. La matière passe par des craquements graves, du bruit filtré et quelques chocs sourds. Le style vient des montées, des appels d'air inversés, des déchirements d'air et des impacts graves. |
| Petits clics partout, « comme si le son buguait » : crépitements à attaque instantanée et aigus, lanterne qui claque dans l'ambiance, fêlure de cloche hachée, dents de scie graves | Appliquer la règle « aucune friture » de la section 3.4, puis compter les grains au-dessus de 2 kHz dans le rendu complet (compresseur et réverbération compris) : un impact en donne un ou deux, une friture des dizaines. |
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

- **une forme principale** lisible et **en vraie matière** (le croissant de la Taille Rouge, la cloche de bronze de la Cloche fêlée…), selon la section 3.6 ;
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

Le modèle est le son d'une attaque spéciale d'anime ou d'une bande-annonce : une montée qui serre, un appel d'air joué à l'envers qui arrive **pile** sur le coup, l'air qui se déchire d'une oreille à l'autre, puis un impact énorme et grave. **Aucun tintement, aucun cliquetis** : une pluie de petits éclats aigus (verre, bronze, cailloux) sonne comme des pièces de monnaie. La matière se dit par des craquements graves et saturés, du bruit filtré et des chocs sourds, en petit nombre.

- **Charge** : montée de puissance (accord grave qui grimpe, s'ouvre et vibre de plus en plus vite), plus la matière de l'Art (feu, métal, spores, verre…), plus un souffle inversé jusqu'au départ.
- **Gel** : le son du monde est aspiré vers le grave, et le vent se coupe.
- **Départ** : souffle ou « zan » court, plus la matière.
- **Impact** :
  - claquement ;
  - coup saturé ;
  - grave de 60 à 22 Hz ;
  - corps d'explosion qui gronde plusieurs secondes ;
  - matière de l'Art, en craquements graves ;
  - quelques débris lourds et sourds (jamais une pluie d'éclats aigus).
- **Contrepoint** : silence (on baisse tout, réverbération comprise), un battement sourd, puis le climax plus fort que l'impact. Chaque coup du contrepoint est précédé d'un appel d'air inversé (0,2 à 0,3 s) qui finit exactement sur lui.
- **Clôture** : un son court et propre, sans longue résonance.
- **Bus** :
  - réverbération longue et sombre (environ 3,4 s) ;
  - compresseur (seuil −24 dB, ratio 5) ;
  - légère saturation, puis limiteur à −1,5 dB ;
  - ambiance baissée pendant le gel et le silence.
- **Mesure de contrôle** : environ 15 dB d'écart entre l'impact et le silence. Le climax est au niveau de l'impact ou au-dessus.
- **Aucune friture** : tout ce qui fait de petits clics réguliers ou au hasard donne l'impression que le son bugue. Donc :
  - pas de grain qui démarre d'un coup (un saut d'échantillon est un clic) : chaque grain monte en 1 à 2 ms ;
  - pas de crépitement aigu ni dense : quelques grains graves et doux suffisent pour la matière ;
  - pas de bruit haché à chaque période (une « fêlure » hachée à 200 Hz sonne comme un haut-parleur abîmé) ;
  - pas de dent de scie grave avec ses fronts raides : même spectre, mais harmoniques déphasées au hasard ;
  - pas de clic dans l'ambiance en boucle, et pas de souffle aigu dans le vent ;
  - un passe-bas après chaque saturation de bruit ;
  - un fondu de quelques millisecondes à la fin d'un son joué à l'envers.
- **Pour le jeu final**, de vrais enregistrements superposés selon la même recette donneront mieux que la synthèse. La synthèse sert au prototype.

### 3.5 La lisibilité et le budget

- La forme principale dit **où ça touche**. Les effets ne cachent jamais la cible plus d'un instant.
- Les entailles retardées, les chutes à genou et les autres effets de ce genre sont du **visuel**. La vue n'écrit jamais l'état du combat : la règle du projet est que la vue ne fait que lire.
- **Mobile** (`ProfilMateriel`, palier BAS) : pas de distorsion, pas de flou radial, pas de fumée, particules réduites de 40 %, mêmes temps et même son.

### 3.6 Ne jamais retomber dans le dessin animé

Ce qui fait « dessin animé », c'est le **propre** et l'**uni** : une forme lisse, un trait d'épaisseur constante, une couleur en aplat, un cercle parfait, une lumière sans source. Le beau, ici, c'est la **matière** et le **désordre organisé**.

1. **La forme principale est un objet crédible**, pas un symbole :
   - une épaisseur, un poids, un matériau physique (métal, pierre, verre, chair, tissu) : couleur de base, rugosité qui varie, usure sur les arêtes, saleté dans les creux, reflets de l'environnement ;
   - du détail à **trois échelles** : la silhouette, les reliefs moyens (moulures, frises, écailles, nervures), le grain fin (piqûres, coulures, stries) ;
   - jamais une forme translucide unie. Ce qui est « spectral » le montre par sa naissance et sa mort (suie qui se condense, dissolution par bruit), pas par une transparence de verre.
2. **Aucune primitive propre dans l'image finale** : pas d'anneau, de tore, de disque, de sphère lisse, de trait à largeur constante. Tout est cassé par du bruit, varie en épaisseur, en densité et en lumière, et a une texture interne.
3. **L'énergie se montre par son effet sur le monde** : le sol saute, les joints s'allument, la poussière roule, l'air se tord, les débris volent. Un anneau lumineux qui s'agrandit ne suffit jamais.
4. **La chaleur suit le corps noir** : blanc au cœur, puis or, orange, ambre sombre, noir. Elle refroidit avec le temps. Un métal qui fige fait une croûte dont les fissures restent chaudes plus longtemps. Jamais d'aplat orange.
5. **Une fissure est une fente**, pas un éclair : tracé sinueux, largeur irrégulière, bords sombres, lueur au fond par endroits.
6. **Pas de liseré fin et brillant** sur la fumée ou sur les fragments : cela fait des éclairs ou des contours au néon.
7. **Les débris sont de vrais morceaux** : découpés dans l'objet lui-même (fragments prédécoupés, avec leur épaisseur et leurs motifs), irréguliers, brûlants à la cassure puis froids. Jamais de confettis plats ni de pastilles orange au sol.
8. **Un trait d'encre est un coup de pinceau** : appui au départ, poils visibles, pinceau sec en fin de course, bavures, éclaboussures. L'encre est mate.
9. **Les particules** ne sont jamais carrées. Trois tailles au moins, et un comportement propre à la matière : par exemple, les étincelles de forge éclatent en petites étoiles.
10. **Le décor touché par l'Art est en vrai volume** (dalles chanfreinées, pierres, colonnes), pour pouvoir réagir : se soulever, se fendre, garder une trace.

**Le test du gros plan**, avant d'envoyer quoi que ce soit :

- Une capture en caméra libre, à 4 ou 5 m de la forme principale, au pic de l'Art. Si elle ressemble à un jouet, à un logo ou à une icône, ce n'est pas fini.
- Une capture à 100 % de chaque trait brillant : il faut savoir d'où il vient. En cas de doute, faire une variante avec une couche coupée ou un masque affiché en couleur (c'est ainsi qu'ont été trouvés les faux éclairs de la fumée et le bug de la fêlure).
- Les mêmes instants côte à côte avec la Taille Rouge : la densité et la texture doivent être du même niveau.
- Les images d'impact en vue cinéma et en vue de jeu.

## 4. L'identité de chaque voie : ce qui doit changer d'un Art à l'autre

| Voie | Matière | Verbes | Pistes de son |
|---|---|---|---|
| **Sang** | encre rouge, feu, cendre | trancher, saigner, embraser | feu qui rugit, lame, giclées |
| **Astro** | lumière froide, étoiles, verre, nuit | tracer, relier, figer | glace qui craque, air glacé qui se déchire, silence, grave lointain |
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

   Pour le verre, le froid et le tir, partir de `prototypes/trait-etoile.html` :
   - la passe de verre : la scène est copiée, puis le verre la lit de travers (réfraction et dispersion) ;
   - la déchirure de nuit, dont les étoiles se lisent selon la direction du regard ;
   - les cristaux en instances et le givre en fougère ;
   - la fonction `froid()`, pendant de `corpsNoir()` ;
   - le monde qui se fige (les particules ralenties à 6 %).

   Pour la matière, partir aussi de `prototypes/cloche-felee.html` :
   - le bronze : `MeshStandardMaterial` complété par `onBeforeCompile` (relief en bosselage, patine, usure, coulée qui fige en croûte, fêlure), avec une carte d'environnement ;
   - les fragments prédécoupés (Voronoi sur la coque) ;
   - les dalles en volume, avec les marques peintes dans leur shader ;
   - les nuées qui tournent ;
   - la fonction `corpsNoir()` ;
   - les étincelles de forge.
4. **Porter dans Godot** (section 6), sans changer les dégâts ni les durées, sauf demande.
5. **Vérifier** :
   - captures fixes sur une campagne dédiée (sur le modèle de `--reference-encre`) ;
   - film Movie Maker. Au 25 octobre, il s'arrêtait encore parfois après une image, sans message d'erreur. Écrire l'AVI dans le dossier temporaire a aidé sans tout régler : c'est à éclaircir en premier ;
   - plusieurs angles ;
   - palier mobile ;
   - spectrogramme et courbe de niveau du son ;
   - **le test du gros plan** de la section 3.6, puis la liste des dix règles, une par une.
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
| Bronze de la cloche : relief, patine, coulée, croûte, fêlure | un `ShaderMaterial` spatial qui reprend les mêmes fonctions (`corpsNoir`, frises, fêlure) |
| Fragments prédécoupés | un maillage par fragment, puis `RigidBody3D` ou trajectoire précalculée à la rupture |
| Dalles qui sautent, or dans les joints, marques peintes au sol | shader du sol avec décalage de sommets, et un plan de mortier émissif dessous |
| Nuées qui tournent, jet de bronze | plans et cylindre avec shader |
| Étincelles de forge qui éclatent | `GPUParticles3D` avec sous-émetteur |
| Sons | WAV dans le dossier audio, `donnees/audio/sons.json`, `bande_son.gd`. Les nouveaux moments (silence, éclatement, clôture) doivent être autorisés dans la validation de `depot.gd`. |

Les sons de la Taille Rouge sont déjà exportés dans `prototypes/sons/taille-rouge/`, avec la fiche des moments, volumes et réglages du bus. Le script `prototypes/sons/export_wav.js` les régénère ; pour un autre Art : `node prototypes/sons/export_wav.js prototypes/<art>.html prototypes/sons/<art> <prefixe>`.

## 7. Les autres Arts connus

D'après le code de `mise_en_scene_arts.gd` et les notes de la session du 25 octobre. Les fiches complètes (forme, valeurs, fenêtres) sont dans `donnees/combat/arts.json` : **à relire avant de commencer**. La voie est déduite des couleurs et des noms quand elle n'est pas écrite.

| Art | Voie | Ce qui existe ou est prévu |
|---|---|---|
| `TAILLE_ROUGE` | Sang | **Fait** en prototype : la barre de qualité. Son niveau en forme ONDE, « la Roue », fait tourner l'entaille autour du corps. |
| Ruée du Sang | Sang | Là où le corps est passé, une ligne d'épines de verre de sang jaillit derrière lui (`VagueEpines`). |
| `CLOCHE_FELEE` | Airain | **Fait** en prototype : `prototypes/cloche-felee.html`, fiche `docs/arts/CLOCHE_FELEE.md`. Le ciel tourne et s'ouvre ; la cloche s'y condense en suie, se remplit de bronze en fusion, tombe, sonne, résonne trois fois dans la pierre et se brise en vrais morceaux. En repli : poussière en cercle et fissures. |
| `COUP_DE_BELIER` | Airain | Forme ONDE : la masse frappe le sol, il se fend, la poussière s'ouvre en cercle. Sinon : la poussière file devant le bouclier, le sol se fend au bout. |
| `TRAIT_D_ETOILE` | Astro | **Fait** en prototype : `prototypes/trait-etoile.html`, fiche `docs/arts/TRAIT_D_ETOILE.md`. L'Astrologue trace une constellation, la replie en une lance de verre, la jette à travers trois bêtes, et les vaincus deviennent une constellation qui s'éteint. |
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
- `prototypes/cloche-felee.html`, `docs/arts/CLOCHE_FELEE.md` et `prototypes/sons/cloche-felee/LISEZMOI.md` : un deuxième exemple, lourd et vertical, qui montre comment un Art se distingue du premier. C'est aussi **la référence pour la matière** (section 3.6).
- `prototypes/trait-etoile.html`, `docs/arts/TRAIT_D_ETOILE.md` et `prototypes/sons/trait-etoile/LISEZMOI.md` : un troisième exemple, froid et à distance. C'est la référence pour le verre, la nuit et le tir.
- Dans le projet du jeu :
  - `docs/REPRISE_SESSION.md` ;
  - `docs/00_decisions/ADR-027-le-poids-des-combats.md` § 9 à 18 ;
  - `docs/00_decisions/ADR-028-les-arts-d-arme.md` ;
  - `docs/art_direction/VISAGES_D_ECLAT.md`.
