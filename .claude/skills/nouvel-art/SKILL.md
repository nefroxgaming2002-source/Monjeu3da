---
name: nouvel-art
description: Créer, ou refaire de fond en comble, un Art de MonJeu3d en prototype navigateur, avec ses effets, son son, ses animations et sa caméra, au niveau des quatre Arts de référence et du premier coup. À utiliser dès qu'on demande un nouvel Art, un prototype d'Art, ou de reprendre les effets, le son, l'animation ou la caméra d'un Art.
---

# Un Art complet en une passe

Le développeur veut **un prompt, un Art complet**, sans avoir à le remodeler ni à le régler ensuite. Chaque erreur déjà faite est notée dans le guide : la refaire, c'est lui faire perdre du temps. Cette méthode existe pour ça. Suis-la dans l'ordre, sans sauter d'étape.

## 0. Ce qu'on livre (la définition de « fini »)

1. `prototypes/<art>.html` : une page autonome, avec la scène, les huit vues, le ralenti, le son, le découpage en six temps et les notes Godot.
2. `prototypes/sources/<art>/` : l'assembleur et ses blocs, si la page a été assemblée (c'est conseillé).
3. `docs/arts/<ART>.md` : la fiche (modèle : `docs/arts/DARD_TISSE.md`).
4. `prototypes/sons/<art>/` : les WAV (`node prototypes/sons/export_wav.js prototypes/<art>.html prototypes/sons/<art> <prefixe>`) et `LISEZMOI.md` (moments, volumes, envois, ducking).
5. `docs/GUIDE_EFFETS_ARTS.md` : section 7 (l'Art est « fait »), section 8 (références) et section 2 (**chaque nouvelle erreur rencontrée**, même corrigée).
6. Les outils (`outils/`) passés sans échec, et toutes les captures regardées.
7. Le commit et le push sur la branche de travail, la page publiée en Artifact, et une réponse courte en français : ce qui a été fait, et ce qui reste à juger à l'oreille ou à l'œil.

## 1. Lire avant d'écrire une ligne

- `docs/GUIDE_EFFETS_ARTS.md` en entier, surtout :
  - 1 (ce que veut le développeur) ;
  - 2 (les erreurs) ;
  - 3.4 (le son) ;
  - 3.6 (le dessin animé) ;
  - 4 (l'identité des voies).
- `docs/MOTEUR_PROTOTYPES.md` : l'anatomie d'une page, et ce qu'on remplace.
- Les fiches des Arts déjà faits (`docs/arts/`), pour **ne rien leur reprendre** : forme, trajectoire, contrepoint, caméra, clôture, son de la matière. Le tableau « déjà pris » est dans la section 4 du guide.
- `outils/LISEZMOI.md`.

## 2. Choisir l'identité, puis écrire la fiche

- Pars de la voie (section 4 du guide) et de la forme de jeu de l'Art (section 7 : contact, zone autour du lanceur, tir, zone à distance…).
- Change **les six choses** de la section 4 par rapport à **tous** les Arts déjà faits.
- Écris la fiche **avant** le code, sur le modèle de `docs/arts/DARD_TISSE.md` :
  - l'identité ;
  - les six temps, avec leurs durées ;
  - les couleurs (trois valeurs) ;
  - la caméra plan par plan ;
  - le son couche par couche ;
  - le budget mobile.
- Si le développeur a demandé l'Art d'un seul coup, ne t'arrête pas pour la faire valider : annonce-la en trois lignes, puis enchaîne.

## 3. Construire

- Pars de la page la plus récente, avec un assembleur. L'exemple est `prototypes/sources/dard-tisse/assembler.py` ; voir aussi `docs/MOTEUR_PROTOTYPES.md`.
  - L'assembleur remplace les sections propres à l'Art ;
  - il vérifie qu'il ne reste aucun mot de l'ancien Art (liste de mots interdits à la fin) ;
  - il écrit la page.
- Une **forme principale en vraie matière**, avec du détail à trois échelles (section 3.6). Le mouvement doit montrer l'énergie sur le monde : le sol, la poussière, l'air.
- La rampe de lumière de la voie va dans `GLSL_COMMUN` (`corpsNoir`, `froid`, `miasme`…). Toute lumière passe par elle, toujours **par plaques**.
- Le crochet `window.__<art> = { son: Son, T, get sim(), get tau(), seek(…) }` est obligatoire : les outils s'en servent.

### La liste avant le premier rendu (les erreurs qui reviennent)

Ce sont des erreurs déjà faites, parfois plusieurs fois. Vérifie-les dans le code **avant** de lancer la moindre capture.

- [ ] **`smoothstep(a, b, x)` avec `a == b`**, quand une borne dépend d'un uniform qui peut valoir 0 (un rayon, une progression, une ouverture) : c'est indéfini et ça remplit tout. Il faut sortir tôt (`if (r <= 0.001) return 0.0;`) ou borner (`max(r, 0.002)`). Cherche `smoothstep(u` et `smoothstep(R`.
- [ ] **Lumières ponctuelles près du sol ou des corps** : 1 au plus à moins de 1 m du sol, 3 à 9 seulement en hauteur, au moment de l'impact. Sinon tout devient une tache de couleur.
- [ ] **Décor lumineux dans le champ** (lanterne, fenêtre) : émission de 1 au plus, et placé hors des plans principaux.
- [ ] **Poussière et fumée dans une scène sombre** : couleur linéaire de 0,035 au plus, opacité de 0,35 au plus. Au-delà, c'est du coton.
- [ ] **Particules fines** (spores, poudre) : taille de 0,008 à 0,022, une centaine par gerbe au plus. Plus grosses, ce sont des pastilles.
- [ ] **Lumière sur une forme** : une base de 0,1 au plus, des plaques de bruit, des pics brefs. Une lumière uniforme sur toute la longueur fait du néon.
- [ ] **Tresses, cordes, faisceaux** : les brins doivent se toucher (rayon d'un brin ≥ écart entre les brins), avec un cœur plein. Sinon, c'est un ressort.
- [ ] **Personnage** : aucune émission en taches sur ses vêtements ; une lumière motivée sur lui au premier plan (la forme qui luit dans ses mains) ; un fond plus clair derrière la silhouette.
- [ ] **Accrocs, déchirures, découpes au bruit** : rares (seuil de bruit ≥ 0,98). Sinon, c'est un motif de léopard.
- [ ] **Caméra** :
  - le premier plan montre le lanceur entier et ses mains, à au moins 2,5 m ;
  - un plan qui suit un objet le garde dans le tiers central ;
  - la caméra ne passe jamais sous le sol.
- [ ] **Son** :
  - aucune friture : les grains montent en 1 à 2 ms, pas de crépitement aigu, pas de bruit haché, les dents de scie graves ont leurs harmoniques déphasées, et la saturation est suivie d'un passe-bas ;
  - aucun tintement ;
  - un appel d'air inversé qui finit pile sur le coup, avec un fondu de 4 ms ;
  - un silence au moins 15 dB sous le sommet ;
  - le sommet est le contrepoint ou l'impact ;
  - le moteur audio commun reste tel quel : `reverberer()` à la fin de la synthèse, pas de `ConvolverNode` en direct, coupe à 35 Hz et limiteur à −3 dB. Un assembleur qui remplace les recettes s'arrête avant `// La reverberation de la place` ;
  - 15 % au plus de l'énergie de sortie sous 40 Hz (`son.js` le mesure) : un grave de 60 à 30 Hz suffit, le reste fait grésiller les portables.
- [ ] **Les trois lois** : pas de musique, aucun visage visible, aucun vocabulaire de divinité ou de religion (y compris dans les noms de variables et les textes de la page).

## 4. Vérifier, en boucle, jusqu'à ce que tout passe

Les outils sont lents (SwiftShader) : lance-les en arrière-plan, un à la fois.

1. `node outils/controle.js prototypes/<art>.html` : console, mise en page et son. Il ne doit sortir aucun « ÉCHEC ».
2. `node outils/son.js prototypes/<art>.html <dossier>` : le verdict doit être « ok » partout. Regarde aussi la courbe :
   - une montée pendant la charge ;
   - un trou au silence ;
   - le sommet au contrepoint.
3. `node outils/captures.js …` : **au moins** les instants suivants. Regarde **chaque** image en entier :
   - en vue cinéma, un instant par temps (charge, départ, impact pendant l'arrêt sur coup avec `:s`, contrepoint, sommet, après, clôture) ;
   - en vue de jeu, l'impact et le sommet ;
   - en vue libre, deux gros plans à 4 ou 5 m de la forme principale, au pic ;
   - en mobile, l'impact (`… 390 mobile`).
4. Le test du gros plan et les dix règles de la section 3.6, une par une, en écrivant la réponse pour toi (oui ou non, et pourquoi).
5. Toute erreur trouvée en route va dans la section 2 du guide, et dans la liste ci-dessus si elle peut revenir.

## 5. Livrer

- Exporte les WAV et écris le `LISEZMOI` des sons.
- Mets à jour la fiche (ce qui a changé en route), puis le guide (sections 2, 7 et 8).
- Fais le commit et le push sur la branche de travail. La fin du message de commit suit les instructions de la session.
- Publie la page en Artifact : la page autonome, en ajoutant le doctype si besoin.
- Réponds en français, court : ce que fait l'Art, ce qui le distingue, et ce qui reste à juger.
