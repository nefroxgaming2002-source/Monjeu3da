# Monjeu3da

Dépôt de prototypes pour MonJeu3d, un jeu d'action-RPG dark fantasy sous Godot 4.7. Le jeu lui-même est dans un autre dépôt, sur l'ordinateur du développeur.

- **Pour créer ou refaire un Art**, suis le skill `.claude/skills/nouvel-art/SKILL.md`. Le développeur veut « un prompt, un Art complet », parfait du premier coup. Le skill donne :
  - l'ordre des étapes ;
  - la liste à vérifier avant le premier rendu (les erreurs qui reviennent) ;
  - la définition de « fini ».
- **Avant tout travail sur les effets, les sons, les animations ou la caméra d'un Art**, lis `docs/GUIDE_EFFETS_ARTS.md`. Il contient :
  - ce que veut le développeur ;
  - les erreurs déjà faites ;
  - la barre de qualité ;
  - ce que chaque Art a déjà pris ;
  - la méthode ;
  - la correspondance avec Godot.
- `docs/MOTEUR_PROTOTYPES.md` décrit l'anatomie d'une page de prototype. `outils/` contient les vérifications (console, mise en page, son, captures), avec leurs seuils dans `outils/LISEZMOI.md`.
- Les quatre prototypes de référence montrent quatre identités très différentes ; ne recopie aucun des quatre :
  - `prototypes/taille-rouge.html` est l'étalon de beauté ;
  - `prototypes/cloche-felee.html` est la référence pour la matière ;
  - `prototypes/trait-etoile.html` est la référence pour le verre, le froid et le tir ;
  - `prototypes/dard-tisse.html` est la référence pour les fils, l'organique et le sol qui réagit. C'est la page la plus récente : pars de celle-là.
- Avant d'envoyer un Art, passe le test du gros plan et les dix règles de la section 3.6 du guide : le développeur refuse tout ce qui fait « dessin animé ».
- Réponds en français, sans raconter chaque étape.
