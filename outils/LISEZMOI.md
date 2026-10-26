# Outils de vérification des prototypes

Ces outils servent à vérifier un Art **avant** de le montrer au développeur. Ils marchent pour tous les prototypes de `prototypes/`, à condition que la page expose son crochet (voir plus bas).

- Ils tournent dans un Chromium sans écran, avec un rendu WebGL logiciel (SwiftShader). C'est lent, mais le résultat est le même d'une session à l'autre.
- `require('playwright')` doit marcher ; dans l'environnement cloud, Chromium est déjà installé. Ne pas lancer `playwright install`.
- three.js est servi depuis `outils/.cache/`, sans réseau. S'il manque, `commun.js` le récupère une fois (`npm pack three@0.160.0`, ou jsDelivr à défaut). Le dossier `.cache` n'est pas versionné.

## Les commandes

| Commande | Ce qu'elle fait | Durée |
|---|---|---|
| `node outils/controle.js prototypes/<art>.html [dossier]` | Vérifie la console sur tout le déroulé (vues cinéma et jeu), la mise en page à 390 et 1280 px, et l'activation du son. Sort en erreur si un point échoue. | 3 à 8 min |
| `node outils/son.js prototypes/<art>.html [dossier]` | Joue l'Art, note chaque son et sa date, refait la chaîne audio hors ligne, puis affiche la courbe de niveau et les grains de friture. Rend aussi un verdict : NaN, écrêtage, sous-graves, friture, silence, aigu tenu. Refuse une page qui a encore l'ancien moteur (réverbération en direct). Avec un dossier, écrit `sequence.wav` et chaque son. | 1 à 2 min |
| `node outils/captures.js prototypes/<art>.html <dossier> "vue:ms[:s][:az,el,dist,cy,cx];…" [largeur] [mobile]` | Captures à des instants précis. `s` : pendant l'arrêt sur coup. `az,el,dist,cy,cx` : orbite de la vue libre, pour les gros plans. `mobile` : palier BAS. | 20 à 60 s par image |
| `python3 outils/planche.py sortie.jpg colonnes échelle img1 img2 …` | Planche contact, pour comparer des instants ou des angles d'un coup d'œil. | instantané |

Vues : `cine`, `jeu`, `cote`, `face`, `dos`, `dessus`, `libre`, `mosaique`.

Les captures et le son se lancent en arrière-plan quand ils dépassent deux minutes. Ne pas en lancer plusieurs en même temps : SwiftShader occupe tout le processeur.

## Ce que la page doit exposer

```js
window.__monArt = { son: Son, T, get sim() { return run.sim; }, get tau() { return run.tau; }, seek(vue, ms, pendantArret, orbite) { … } };
```

- `seek` relance l'Art et le fait avancer jusqu'à `ms`, sans attendre l'horloge. Il rend aussi une image.
- `T.bout` est la fin de l'Art.
- `son` est l'objet `Son` de la page : `son.js` remplace ses fonctions `jouer`, `ambiance` et `couper` pour noter les événements.
- La synthèse doit tenir entre `/* <synthese>` et `/* </synthese> */`, en JavaScript pur, sans DOM, et finir par `reverberer()` : `son.js` et `prototypes/sons/export_wav.js` la lisent dans le fichier.
- `son.js` refait la chaîne de `Son.preparer` (coupe des sous-graves, compresseur, saturation, limiteur, retour de réverbération). Si le moteur change, reporter le changement dans `son.js`.

## Les seuils (la définition de « fini »)

- Console : aucune erreur, aucun avertissement.
- Mise en page : aucun débordement horizontal à 390 px, et la scène est visible.
- Son :
  - 0 NaN, 0 échantillon écrêté ;
  - sous-graves : 15 % au plus de l'énergie de sortie sous 40 Hz ;
  - friture : 4 grains au plus par 100 ms, 20 en tout (un impact en donne 1 ou 2) ;
  - le silence est au moins 12 dB sous le sommet (viser 15) ;
  - le sommet est le contrepoint ou l'impact, pas la charge.
- Image : voir le test du gros plan et les dix règles du guide (section 3.6). Aucun outil ne remplace l'œil.
