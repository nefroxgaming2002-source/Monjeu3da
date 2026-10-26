# Cloche fêlée : fiche de l'Art

- **Identifiant** : `CLOCHE_FELEE`, voie de l'Airain.
- **Mécanique** (code existant) : `ClocheSpectrale.tomber()` pendant l'anticipation (`annonce_ms`), puis `sonner()` à l'ouverture de l'active. C'est une zone autour du lanceur, avec `rayon_m` à 3,0 par défaut.
- **Gameplay** : inchangé. Un seul coup, à l'ouverture, dans un rayon de 3 m. Les échos et la rupture sont du visuel, sauf si `arts.json` dit autre chose.
- **Règle de jeu à respecter** : si le joueur bouge avant la rupture, la rupture se déclenche aussitôt. La cloche ne doit jamais l'enfermer.

## Identité

- **Verbes** : appeler, sonner, se fendre.
- **Matière** : bronze, or fondu, suie (l'encre de l'Airain), poussière, pierre.
- **Forme principale** : une vraie cloche de bronze de 3 m. Elle a :
  - un profil de bourdon et une coque épaisse ;
  - des moulures et des cordons torsadés ;
  - une frise de maillons ;
  - un bandeau d'écriture inventée ;
  - des écailles sur l'épaule ;
  - une couronne à six anses ;
  - une patine, de la suie dans les creux et un relief poli par l'usure.
- **Naissance** : elle se condense en suie dans un ciel qui tourne, puis un jet de bronze en fusion la remplit depuis la couronne.
- **Ce qui voyage** : la cloche, du ciel au sol, puis **le son**, qui passe dans la pierre. Les dalles sautent, l'or court dans les joints, la poussière roule.
- **Contrepoint** : *la résonance qui fêle*. Trois échos font sauter la cloche, allument son inscription et font grimper la fêlure, jusqu'à la rupture en vrais morceaux.
- **Différences avec la Taille Rouge** :
  - lourde et lente au lieu de rapide ;
  - verticale au lieu de latérale ;
  - zone circulaire au lieu d'un arc ;
  - or, bronze et pierre au lieu du sang ;
  - pas de gel : le monde retient son souffle pendant l'appel ;
  - le son est la vedette.

## Les temps

Les durées sont supposées, à caler sur `arts.json`.

| Temps | Moment | Ce qui se passe |
|---|---|---|
| Appel | 0 – 420 ms | Les nuées de suie tournent et se déchirent sur un four de bronze en fusion. La cloche se condense en suie, du haut vers le bas. Un jet de métal la remplit depuis la couronne : blanc au front, il fige en croûte derrière, et les fissures de la croûte restent chaudes. Au sol, le cercle de 3 m se trace d'un seul coup de pinceau, avec des touches et des éclaboussures, et l'or court dans quelques stries. La masse chauffe et les dalles tremblent. |
| Chute | 420 – 700 ms | Le jet se rompt. La cloche tombe en refroidissant, avec une traînée d'étincelles et de suie, et son ombre grandit sur les dalles. La masse s'abat. |
| Sonnerie | 700 ms, début de l'active | La cloche s'abat au moment où la masse frappe. Arrêt sur coup de 120 ms : image négative (la silhouette de la cloche), puis image or. Le bronze s'embrase un instant. Les dalles s'enfoncent sous le bord et se fendent en étoile. La première onde fait sauter le dallage et soulève la poussière, et les bêtes sont repoussées. |
| Échos | +260, +560, +900 ms | La cloche saute sur ses échos et son bord s'ovalise. Une bande de chaleur monte le long de la paroi et allume l'inscription. La fêlure grimpe en suintant l'or. À chaque coup, une onde plus large court dans les joints et soulève la poussière. |
| Rupture | +1150 ms | Arrêt sur coup de 80 ms, puis image or et noir. La cloche éclate en une quarantaine de fragments aux cassures encore rouges, avec des éclats, des gouttes de métal, des étincelles de forge, de la suie et un dernier choc dans le sol. La couronne s'envole. Les bêtes tombent à genou. |
| Retombée et clôture | ensuite | Les fragments retombent, rebondissent, refroidissent, puis se défont en suie. Les gouttes figent sur la pierre, et les fissures et l'empreinte du bord restent. Le combattant pose la masse sur l'épaule. |

## Couleurs

- Suie : l'encre.
- Bronze : de `0.27, 0.15, 0.06` (patiné) à `0.66, 0.42, 0.17` (poli), en linéaire.
- La chaleur suit le corps noir, sans aplat :
  - ambre sombre `0.42, 0.06, 0.004` ;
  - or `1, 0.6, 0.17` ;
  - cœur blanc chaud `1, 0.86, 0.62`.
- Image d'impact : négatif, puis duo or et noir.

## Caméra

- **Appel** : contre-plongée large. Le combattant est petit sous le ciel qui tourne.
- **Chute** : la caméra suit la cloche qui descend.
- **Sonnerie** : plan large et bas.
- **Échos** : orbite qui monte.
- **Rupture** : poussée vers la cloche.
- **Fin** : plan haut sur les fragments et l'empreinte.

## Son

Les grosses cloches font la vedette, sans aucun aigu tenu. Les partiels de cloche restent sous 1 kHz, et les plus hauts s'éteignent en moins de 0,3 s. La fêlure est un battement des partiels et un souffle sombre, jamais un bruit haché qui grésille. Aucune friture (voir la section 3.4 du guide).

- **Appel** :
  - grondement du ciel ;
  - bourdon grave qui monte ;
  - cloche jouée à l'envers ;
  - bronze qui coule (grondement visqueux, quelques bulles sourdes) ;
  - souffle inversé.
- **Chute** : souffle qui descend et enfle.
- **Sonnerie** :
  - explosion : claquement, coup saturé, grave, corps qui gronde ;
  - grande cloche fêlée ;
  - armure et gravats sourds.
- **Échos** : la cloche revibre, de plus en plus grave et fêlée, avec un coup sourd et un ou deux morceaux de bronze qui retombent, sourds.
- **Rupture** :
  - craquement ;
  - une douzaine de morceaux de bronze qui retombent lourdement, sans tintement ;
  - râle de la cloche qui se brise ;
  - vapeur sombre et quelques bulles sourdes du métal en fusion.
- **Clôture** : la masse posée.

## Budget mobile

- Pas d'ombres portées.
- Pas de distorsion ni de flou radial.
- Une seule couche de nuées.
- Une cloche moins découpée : environ 64 × 32 cellules au lieu de 96 × 48.
- Particules réduites de 40 %.
- Les dalles, la cloche et ses fragments restent.
