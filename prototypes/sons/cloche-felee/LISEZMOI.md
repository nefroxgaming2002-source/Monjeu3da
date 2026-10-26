# Bruitages de la Cloche fêlée

WAV 44,1 kHz, 16 bits, stéréo, exportés depuis `prototypes/cloche-felee.html`. Aucune musique.

Les temps sont comptés depuis le début de l'Art. Ils supposent une anticipation de 700 ms, une active de 180 ms et une récupération de 520 ms : à recaler sur `arts.json`.

| Fichier | Quand | Volume | Envoi réverb |
|---|---|---|---|
| `cloche_felee_appel` | 0 ms, le ciel s'ouvre | 0,80 | 0,35 |
| `cloche_felee_chute` | 420 ms, la cloche tombe | 0,80 | 0,30 |
| `cloche_felee_sonnerie` | 700 ms, début de l'active | 1,00 | 0,50 |
| `cloche_felee_echo_1` | 960 ms | 0,75 | 0,55 |
| `cloche_felee_echo_2` | 1 260 ms | 0,85 | 0,55 |
| `cloche_felee_echo_3` | 1 600 ms | 0,95 | 0,55 |
| `cloche_felee_rupture` | 1 850 ms | 1,00 | 0,50 |
| `cloche_felee_cloture` | 2 900 ms, la masse sur l'épaule | 0,70 | 0,30 |
| `ambiance_vent_boucle` | en boucle, sans couture | 0,22 | 0 |

## Bus conseillé dans Godot

Le même que pour la Taille Rouge :

- réverbération longue et sombre, environ 3,4 s, renvoyée à 0,6 ;
- compresseur : seuil −24 dB, ratio 5, attaque 2 ms, relâchement 300 ms ;
- légère saturation, puis limiteur à −1,5 dB.

## Ducking

- **Appel** : le vent descend à 30 % et passe sous un passe-bas à 380 Hz. Il revient à la sonnerie, en environ 0,3 s.
- **Échos** : chaque écho fait descendre les sons en cours à 50 % de leur niveau, pour que le nouveau coup passe devant.
- **Rupture** : les sons en cours descendent à 35 %.

Au ralenti, le prototype joue les sons à la vitesse `vitesse ^ 0,6` (plus graves et plus longs).
