# Trait d'Étoile : fiche de l'Art

- **Identifiant** : `TRAIT_D_ETOILE`, voie de l'Astrologue (Astro). Au niveau 1, `facteur_degats` vaut 1,9.
- **Mécanique** : un tir (`_tirer_art`, `TraineeTir`). La forme exacte, la portée et les fenêtres sont à relire dans `arts.json`. Le prototype suppose :
  - une ligne d'environ 9 m qui traverse toutes les cibles sur son chemin ;
  - une anticipation de 600 ms, une active de 140 ms et une récupération de 500 ms.
- **Gameplay** : inchangé. La constellation des vaincus et les extinctions sont du visuel.

## Identité

- **Verbes** : tracer, relier, figer.
- **Matière** : lumière d'étoile, verre, givre, nuit (l'encre de l'Astrologue est bleu-noir et piquetée d'étoiles).
- **Forme principale** : une lance de verre d'étoile, à fût hexagonal tordu comme un cristal qui a poussé, avec deux barbes et une étoile à la pointe. Le verre réfracte et disperse la scène, et un filament de lumière court au cœur.
- **Ce qui voyage** : la lance, en ligne droite à travers les trois bêtes. Derrière elle, l'air se déchire sur la nuit profonde.
- **Contrepoint** : *la constellation des vaincus*. Les bêtes touchées deviennent des étoiles, la plume les relie, puis elles s'éteignent une à une et leurs cristaux éclatent. La Taille Rouge, elle, fait silence puis éclatement, et la Cloche fait des échos puis une rupture.
- **Différences avec les deux premiers Arts** :
  - un tir à distance, en ligne : ni une entaille au contact, ni une zone autour du lanceur ;
  - le froid au lieu du feu et du métal en fusion ;
  - une lumière précise et rare au lieu d'une flamme ;
  - un monde qui se fige au lieu d'un monde qui tremble ;
  - un son d'air glacé qui se déchire, de glace qui craque et de grave lointain, au lieu du feu ou des cloches.

## Les temps

Les durées sont supposées, à caler sur `arts.json`.

| Temps | Moment | Ce qui se passe |
|---|---|---|
| Tracé | 0 – 380 ms | La nuit se lit : le ciel s'assombrit, les étoiles s'avivent, la Voie lactée paraît et la robe s'allume de ses broderies. La main gauche suit une plume de lumière qui trace une constellation au-dessus de la ligne de tir : sept étoiles, deux barbes, un empennage. Chaque étoile s'allume quand la plume l'atteint. |
| Forge | 380 – 600 ms | Les étoiles filent dans la main droite. La lance cristallise de la poignée vers les deux bouts, avec un front de givre blanc, et de la vapeur froide tombe du verre. L'Astrologue arme son bras, le buste tourné en arrière. |
| Jet | 600 ms, début de l'active | La lance part dans un claquement d'air et vole 170 ms. Elle traverse les trois bêtes, avec des arrêts sur coup de 40, 40 et 80 ms. Chaque bête se fige sous un amas de cristaux et une plaque de givre. Derrière la lance s'ouvrent la déchirure de nuit et une traînée d'encre étoilée, de vapeur et d'étincelles froides, et le givre court en fougère sur les dalles. Images d'impact : négatif, puis duo bleu nuit, sur la troisième bête. |
| Plantée, figée | +170, puis +230 ms | La lance se plante. Les dalles se fendent en étoile et gèlent, et des cristaux poussent autour. Puis le monde se fige pendant environ 200 ms : neige, poussière et éclats restent suspendus, et le son se retire. |
| Les vaincus | +400 à +1200 ms | Une étoile s'allume sur chaque bête et sur la lance, et la plume les relie. Puis elles s'éteignent une à une, à 1480, 1630 et 1800 ms. À chaque extinction, les cristaux éclatent en verre, le givre de la bête fond et la déchirure se recoud jusqu'à l'étoile suivante. La dernière emporte la lance, qui éclate en verre (image duo). |
| Retombée et clôture | ensuite | Les éclats retombent en scintillant, la poussière d'étoile monte, le givre fond et les bêtes tombent à genou. L'Astrologue referme la main sur la dernière étoile, puis la baisse. |

## Couleurs

- Encre de nuit : `0.008, 0.012, 0.04` en linéaire.
- Bleu d'étoile : `0.42, 0.62, 1`.
- Cœur blanc froid : `0.9, 0.95, 1`.
- La lumière froide suit la rampe `froid()` du prototype : encre, puis bleu d'étoile, puis blanc. Jamais d'aplat.
- Image d'impact : négatif, puis duo bleu nuit.

## Caméra

- **Tracé** : par-dessus l'épaule gauche ; la constellation part vers les bêtes.
- **Forge** : de trois quarts face, sur la lance qui cristallise.
- **Jet** : la caméra suit la pointe, puis la lâche avant qu'elle ne se plante.
- **Figée et vaincus** : plan large de côté sur la file figée, qui glisse vers la face.
- **Fin** : plan haut derrière l'Astrologue.

## Son

Un son de bande-annonce : des montées, des appels d'air inversés, l'air qui se déchire et des impacts graves. Aucun tintement de verre : le verre et le givre passent par des craquements graves, saturés puis adoucis par un passe-bas. Aucun aigu tenu, aucune friture (voir la section 3.4 du guide).

- **Tracé** :
  - grave lointain qui bat ;
  - montée de puissance ;
  - air froid qui monte et tourne d'une oreille à l'autre ;
  - un battement sourd par étoile allumée.
- **Forge** : un impact joué à l'envers qui gonfle jusqu'au jet, une inspiration, la glace qui prend.
- **Jet** : claquement, l'air qui se déchire et file d'une oreille à l'autre, coup saturé, grave qui tombe.
- **Percées** : claquement, coup saturé, grave de cinéma, corps qui gronde, glace qui casse.
- **Plantée** : coup sourd, grave, craquement de glace, poussière.
- **Figée** : tout s'étouffe ; il ne reste que deux sinus graves qui battent.
- **Vaincus** : quatre battements sourds et trois traits d'air, très bas.
- **Avant chaque extinction** : un appel d'air (un impact joué à l'envers) qui finit pile sur elle, plus long avant la dernière.
- **Extinctions** : le même impact que les percées. La dernière ajoute le corps d'une explosion, un grave long et un grand souffle : c'est le sommet.
- **Clôture** : un froissement de robe et un coup léger.

## Budget mobile

- Pas d'ombres portées.
- Pas de distorsion ni de flou radial.
- Particules réduites de 40 %.
- La lance, la déchirure, les cristaux et le givre restent.
