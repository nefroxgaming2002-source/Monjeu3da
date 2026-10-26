# Cloche fêlée : fiche de l'Art

- **Identifiant** : `CLOCHE_FELEE`, voie de l'Airain.
- **Mécanique** (code existant) : `ClocheSpectrale.tomber()` pendant l'anticipation (`annonce_ms`), puis `sonner()` à l'ouverture de l'active. C'est une zone autour du lanceur, avec `rayon_m` à 3,0 par défaut.
- **Gameplay** : inchangé. Un seul coup, à l'ouverture, dans un rayon de 3 m. Les échos et la rupture sont du visuel, sauf si `arts.json` dit autre chose.

## Identité

- **Verbes** : appeler, sonner, se fendre.
- **Matière** : bronze spectral, or fondu, suie (l'encre de l'Airain), poussière.
- **Forme principale** : une cloche de bronze de 3 m, peinte à l'encre dans le ciel puis coulée en métal. Elle tombe sur le combattant, et sa fêlure brûle d'or fondu.
- **Ce qui voyage** : la cloche, du ciel au sol, puis **le son lui-même**, rendu visible par des anneaux d'or qui balaient la zone.
- **Contrepoint** : *la résonance qui fêle*. Trois échos, chacun plus large et plus grave, font grimper la fêlure jusqu'à la rupture : la cloche éclate en éclats de bronze et en gouttes d'or. La Taille Rouge, elle, fait silence puis éclatement ; ici, c'est pulsation puis rupture.
- **Différences avec la Taille Rouge** :
  - lourde et lente au lieu de rapide ;
  - verticale (du ciel vers le sol) au lieu de latérale ;
  - zone circulaire au lieu d'un arc ;
  - or et bronze au lieu du sang ;
  - pas de gel : le monde retient son souffle pendant l'appel ;
  - le son est la vedette.

## Les temps

Les durées sont supposées, à caler sur `arts.json`.

| Temps | Moment | Ce qui se passe |
|---|---|---|
| Appel | 0 – 420 ms | Le ciel se fend en un anneau d'or et une colonne de suie descend. La cloche se peint à l'encre de haut en bas, puis le bronze coule dedans. Le cercle de zone de 3 m se trace au sol à l'encre d'or. Le combattant lève la masse, qui chauffe. Le monde s'assombrit. |
| Chute | 420 – 700 ms | La cloche tombe en accélérant, avec une traînée d'étincelles. Le souffle chasse la poussière et les cailloux sautent. La masse s'abat. |
| Sonnerie | 700 ms, début de l'active | La cloche s'abat autour du combattant au moment où la masse frappe le sol. Arrêt sur coup de 120 ms, image négative puis image or. Onde de choc, premier anneau d'or, fissures en étoile, cercle de poussière, bêtes repoussées. |
| Échos | +260, +560, +900 ms | La cloche vibre et gonfle. Chaque écho envoie un anneau plus large ; la fêlure grimpe et coule de l'or. |
| Rupture | +1150 ms | La cloche éclate : éclats de bronze brûlants, gouttes d'or, suie, dernier anneau. Arrêt sur coup de 80 ms. Les bêtes tombent à genou. |
| Retombée et clôture | ensuite | Éclats et gouttes refroidissent en scories noires. L'empreinte brûlée du bord de la cloche reste au sol et la chaleur fait trembler l'air. Le combattant pose la masse sur l'épaule. |

## Couleurs

- Suie (l'encre).
- Bronze profond : `0.24, 0.11, 0.03` en linéaire.
- Or fondu `1, 0.5, 0.12` et cœur blanc chaud `1, 0.86, 0.62`.
- Image d'impact : négatif, puis duo or et noir.

## Caméra

- **Appel** : contre-plongée vers le ciel qui s'ouvre.
- **Chute** : la caméra suit la cloche qui descend.
- **Sonnerie** : plan large et bas.
- **Échos** : orbite qui monte, pour voir les anneaux.
- **Rupture** : poussée vers la cloche.
- **Fin** : plan haut sur l'empreinte et les éclats.

## Son

Les grosses cloches font la vedette, sans aucun aigu tenu. Les partiels de cloche restent sous 800 Hz, et les plus hauts s'éteignent en moins de 0,3 s.

- **Appel** : grondement du ciel, bourdon grave qui monte, cloche jouée à l'envers pendant qu'elle se peint.
- **Chute** : souffle qui descend et enfle.
- **Sonnerie** :
  - explosion (claquement, coup saturé, grave, corps qui gronde) ;
  - grande cloche fêlée : partiels de cloche, battements forts, grésillement de la fêlure ;
  - armure et cailloux.
- **Échos** : la cloche revibre, de plus en plus grave et fêlée, avec un coup sourd.
- **Rupture** :
  - craquement ;
  - quarante éclats de bronze courts ;
  - râle de la cloche qui se brise en descendant ;
  - grésillement du métal en fusion et gouttes.
- **Clôture** : la masse posée.

## Budget mobile

- Pas de distorsion ni de flou radial.
- Fumée et poussière réduites.
- Éclats réduits de 40 %.
- Les anneaux et la cloche restent.
