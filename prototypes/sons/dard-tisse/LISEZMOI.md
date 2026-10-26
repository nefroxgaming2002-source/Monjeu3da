# Bruitages du Dard Tissé

WAV 44,1 kHz, 16 bits, stéréo, exportés depuis `prototypes/dard-tisse.html`. Aucune musique.

Les temps sont comptés depuis le début de l'Art, sans l'arrêt sur coup de 110 ms à l'éclosion (qui décale d'autant tout ce qui suit). Ils supposent une anticipation de 760 ms, une active de 200 ms et une récupération de 600 ms : à recaler sur `arts.json`.

| Fichier | Quand | Volume | Envoi réverb |
|---|---|---|---|
| `dard_tisse_tissage` | 0 ms, le dard se tresse ; l'inspiration inversée finit à 520 ms | 0,85 | 0,45 |
| `dard_tisse_lancer` | 520 ms, le dard part ; il entre dans la pierre 60 ms plus tard | 0,90 | 0,35 |
| `dard_tisse_point_1`, `_2` | quand le dard ressort des dalles (≈ 590 et 675 ms) | 0,75 | 0,35 |
| `dard_tisse_eclosion` | 760 ms, début de l'active | 1,00 | 0,50 |
| `dard_tisse_tension` | 1 150 ms, la Tisseuse tire le fil | 0,85 | 0,40 |
| `dard_tisse_battement_1`, `_2` | 1 330 et 1 560 ms | 0,85 | 0,30 |
| `dard_tisse_avant` | 1 600 ms : l'appel d'air inversé finit pile sur la floraison | 0,90 | 0,40 |
| `dard_tisse_floraison` | 1 900 ms, le sommet | 1,25 | 0,60 |
| `dard_tisse_spores` | 2 250 ms, les spores retombent | 0,60 | 0,60 |
| `dard_tisse_cloture` | 2 900 ms, le fil coupé | 0,70 | 0,30 |
| `ambiance_vent_boucle` | en boucle, sans couture | 0,22 | 0 |

## Bus conseillé dans Godot

Le même que pour les autres Arts :

- coupe des sous-graves : `AudioEffectHighPassFilter` à 35 Hz, pente 24 dB, puis `AudioEffectLowShelfFilter` à 90 Hz, gain 0,71 (−3 dB) ;
- réverbération longue et sombre, environ 3,4 s, renvoyée à 0,6 ;
- compresseur : seuil −24 dB, ratio 5, attaque 4 ms, relâchement 300 ms ;
- légère saturation, puis limiteur à −3 dB (`AudioEffectHardLimiter`, plafond −3 dB).

## Ducking

- **Tissage** : le vent descend à 30 % et passe sous un passe-bas à 380 Hz.
- **Éclosion** : les sons en cours descendent à 45 %.
- **Silence** (de 1 240 ms à la floraison) : le vent est coupé, les sons en cours descendent à 12 % et la réverbération à 0,12. Les battements et l'appel d'air passent seuls.
- **Floraison** : tout revient ; les sons en cours descendent à 40 %.

Au ralenti, le prototype joue les sons à la vitesse `vitesse ^ 0,6` (plus graves et plus longs).
