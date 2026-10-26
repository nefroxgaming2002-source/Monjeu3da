# Dard Tissé : fiche de l'Art

- **Identifiant** : `DARD_TISSE`, voie du Miasme. La forme exacte, les valeurs et les fenêtres sont à relire dans `arts.json`. Le prototype suppose :
  - une zone en colonne à distance, d'environ 1,4 m de rayon, à 6,4 m de la Tisseuse ;
  - une anticipation de 760 ms, une active de 200 ms et une récupération de 600 ms.
- **Gameplay** : inchangé. La couture du sol, la tension, la floraison et l'infection sont du visuel.

## Identité

- **Verbes** : tisser, coudre, éclore, infecter.
- **Matière** : de la chair végétale tressée en cordes, humide et sombre (lie-de-vin), traversée d'une sève violette qui luit par plaques. Des poils de mycélium gris-lilas, des spores, une sève qui tache. L'encre du Miasme est un noir violacé.
- **Forme principale** : une colonne tissée. Quarante-huit cordes torsadées montent en hélice, vingt-quatre dans chaque sens, et passent l'une sur l'autre en vraie armure de tissage, jusqu'à se refermer en cocon au-dessus des bêtes. Une lueur de sève l'allume de l'intérieur et filtre entre les mailles. Avant elle, le dard : un fuseau de sept cordes tressées autour d'un cœur, armé d'une épine de chitine courbe, annelée et irisée.
- **Ce qui voyage** : le dard, **sous le sol**. Il plonge dans les dalles devant la Tisseuse, file dessous en soulevant une crête de dalles, ressort deux fois en points de couture (des arcs de fil au-dessus du sol), puis jaillit au centre de la zone. Le fil reste cousu dans la place.
- **Contrepoint** : *la tension, puis la floraison*. La Tisseuse tire le fil : il se tend, la place se fronce comme un tissu, la colonne se serre sur les bêtes et le monde se tait. Deux battements de sève remontent les cordes. Puis la colonne s'ouvre lentement par le haut, comme une fleur, en six pétales qui se recourbent, et lâche un grand nuage de spores.
- **Différences avec les trois premiers Arts** :
  - une zone **à distance**, ni une entaille au contact (Taille Rouge), ni une zone autour du lanceur (Cloche), ni un tir en ligne (Trait d'Étoile) ;
  - une trajectoire **sous le sol**, pas dans l'air ;
  - de la matière **souple, vivante et humide** : ni flamme, ni métal, ni verre ;
  - un sommet **lent**, une ouverture qui expire, au lieu d'un éclatement ;
  - une trace qui **se répand** (le mycélium gagne les dalles), au lieu de refroidir ou de fondre ;
  - un son de souffles, de cordes qui se tendent, de chair humide et de battements, sans feu, sans cloche, sans glace.

## Les temps

Les durées sont supposées, à caler sur `arts.json`.

| Temps | Moment | Ce qui se passe |
|---|---|---|
| Tissage | 0 – 520 ms | Le ciel se couvre, le monde s'assombrit. Des poils de mycélium sortent des joints autour de la Tisseuse et montent vers ses mains, qui tournent l'une autour de l'autre. Le dard se tresse entre elles, des sept cordes vers l'épine. Au loin, le sol de la zone se tache : des points de moisissure s'allument (l'annonce de la zone). |
| Couture | 520 – 760 ms | La main droite plante le dard dans les dalles. Il file sous la place : une crête de dalles se soulève et retombe sur son passage, la poussière sort des joints. Il ressort deux fois en arc et replonge ; le fil reste cousu derrière lui. |
| Éclosion | 760 ms, début de l'active | Arrêt sur coup de 110 ms. Le dard jaillit au centre de la zone : les cordes fusent en gerbe puis se tissent en colonne autour des trois bêtes, et les dalles de la zone se soulèvent en couronne. Des cordes partent de la paroi et ligotent chaque bête. Images d'impact : négatif, puis duo violet. Gerbe de spores, de lambeaux et de sève. |
| Tension | +390 à +1140 ms | La Tisseuse tire le fil : il se tend, les dalles se froncent le long de la couture, la colonne se serre. Silence (le son retombe, réverbération comprise) ; deux battements de sève remontent les cordes. |
| Floraison | +1140 ms (1 900 ms) | Après un appel d'air inversé, la colonne s'ouvre lentement par le haut en six pétales. Chaque pétale rassemble ses cordes : étroit au pied et au bout, large au milieu, il se recourbe vers l'extérieur. La sève brille au bord de l'ouverture, et l'épine tombe au fond et se plante. Un panache sombre et transparent monte du cœur, piqué de spores violettes. C'est le sommet : image duo, onde molle, plan plongeant. |
| Infection, puis clôture | ensuite | Les spores retombent, le mycélium gagne les dalles en réseau de veines, les pétales se fanent et sèchent, les bêtes s'affaissent dans leurs liens. À 2 900 ms, la Tisseuse pince le fil entre deux doigts et le coupe ; il retombe, mou, sur la place. |

## Couleurs

- Encre du Miasme : `0.012, 0.004, 0.016` en linéaire.
- Chair des cordes : `0.085, 0.018, 0.05`, humide.
- Lumière de sève : la rampe `miasme()` du prototype, qui va de l'encre au violet `0.62, 0.32, 1`, puis à un lilas pâle au cœur. Jamais d'aplat, toujours par plaques.
- Le décor est d'un gris olive, sous un ciel couvert : le violet ressort.
- Image d'impact : négatif, puis duo violet.

## Caméra

- **Tissage** : de trois quarts face, bas, sur les mains qui tissent.
- **Couture** : au ras des dalles, la caméra suit le dard, et les points de couture passent devant l'objectif.
- **Éclosion** : la caméra s'arrête au pied de la zone et lève la tête avec la colonne.
- **Tension** : plan large de côté, le fil tendu de la main à la colonne.
- **Floraison** : plongée au-dessus de la colonne, qui s'ouvre sous l'objectif.
- **Fin** : plan haut derrière la Tisseuse.

## Son

Des souffles, des cordes qui se tendent, de la chair humide et des battements. Rien d'aigu ni de tenu, aucun tintement et aucune friture : l'humide se fait avec du bruit filtré qui glisse, jamais avec des petits clics.

- **Tissage** :
  - grave qui respire ;
  - montée ;
  - glissements humides ;
  - cordes qui se serrent ;
  - inspiration jouée à l'envers jusqu'au lancer.
- **Lancer** : souffle et coup sourd quand le dard entre dans la pierre.
- **Couture** :
  - grondement qui court sous la place, de gauche à droite ;
  - à chaque point de couture : pierre qui se soulève, chair qui sort, fil qui file.
- **Éclosion** :
  - claquement ;
  - coup saturé ;
  - grave de 60 à 30 Hz (le bus coupe en dessous de 35 Hz) ;
  - déchirure humide ;
  - cordes qui se tendent ;
  - corps qui gronde.
- **Tension** : la corde se tend en grave (un « vrong » court et sourd), puis le silence, puis deux battements.
- **Floraison** : un appel d'air inversé, puis une énorme expiration grave, longue, humide, au niveau de l'éclosion ou au-dessus.
- **Infection** : le soupir des spores qui retombent, très bas.
- **Clôture** : un pincement sourd et un froissement d'étoffe.

## Budget mobile

- Pas d'ombres portées.
- Pas de distorsion ni de flou radial.
- Particules réduites de 40 %.
- Tubes à quatre côtés au lieu de six.
- Moins de franges et pas de poils de mycélium.
- La colonne, le dard, la couture et l'infection restent.
