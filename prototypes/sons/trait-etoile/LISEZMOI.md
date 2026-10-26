# Bruitages du Trait d'Étoile

WAV 44,1 kHz, 16 bits, stéréo, exportés depuis `prototypes/trait-etoile.html`. Aucune musique.

Les temps sont comptés depuis le début de l'Art, sans les arrêts sur coup (40, 40 et 80 ms aux trois percées, qui décalent d'autant ce qui suit). Ils supposent une anticipation de 600 ms, une active de 140 ms, une récupération de 500 ms et un vol de 170 ms : à recaler sur `arts.json`.

| Fichier | Quand | Volume | Envoi réverb |
|---|---|---|---|
| `trait_etoile_trace` | 0 ms, la plume trace la constellation | 0,85 | 0,50 |
| `trait_etoile_forge` | 380 ms, la lance cristallise | 0,80 | 0,40 |
| `trait_etoile_jet` | 600 ms, début de l'active | 1,00 | 0,45 |
| `trait_etoile_percee_1` à `_3` | quand la pointe atteint chaque bête (≈ 640, 686, 732 ms) | 0,80, 0,90, 1,00 | 0,50 |
| `trait_etoile_plante` | 770 ms, la lance se plante | 0,85 | 0,40 |
| `trait_etoile_fige` | 830 ms, le monde se fige | 0,70 | 0,60 |
| `trait_etoile_relie` | 1 000 ms, les vaincus s'allument | 0,40 | 0,60 |
| `trait_etoile_avant_1` à `_3` | 1 300, 1 450 et 1 480 ms : l'appel d'air finit pile sur chaque extinction | 0,70, 0,70, 0,90 | 0,40 |
| `trait_etoile_eteint_1` à `_3` | 1 480, 1 630 et 1 800 ms | 0,85, 0,95, 1,20 | 0,55 |
| `trait_etoile_cloture` | 2 350 ms, la main se referme | 0,70 | 0,35 |
| `ambiance_vent_boucle` | en boucle, sans couture | 0,22 | 0 |

## Bus conseillé dans Godot

Le même que pour les autres Arts :

- coupe des sous-graves : `AudioEffectHighPassFilter` à 35 Hz, pente 24 dB, puis `AudioEffectLowShelfFilter` à 90 Hz, gain 0,71 (−3 dB) ;
- réverbération longue et sombre, environ 3,4 s, renvoyée à 0,6 ;
- compresseur : seuil −24 dB, ratio 5, attaque 4 ms, relâchement 300 ms ;
- légère saturation, puis limiteur à −3 dB (`AudioEffectHardLimiter`, plafond −3 dB).

## Ducking

- **Tracé** : le vent descend à 30 % et passe sous un passe-bas à 380 Hz.
- **Percées** : chaque percée fait descendre les sons en cours à 60 %.
- **Figé** (de 830 ms à la première extinction) : le vent est coupé, les sons en cours descendent à 12 % et la réverbération à 0,12.
- **Extinctions** : tout revient à la première ; chaque extinction fait descendre les sons en cours à 45 %.

Au ralenti, le prototype joue les sons à la vitesse `vitesse ^ 0,6` (plus graves et plus longs).
