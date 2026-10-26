# Bruitages de la Taille Rouge

WAV 44,1 kHz, 16 bits, stéréo, exportés depuis `prototypes/taille-rouge.html`. Aucune musique.

Les temps sont comptés depuis le début de l'Art, en vue cinéma avec le gel de 420 ms. Sans gel (caméra de jeu), on retire 420 ms et on joue `taille_rouge_charge` au lieu de `taille_rouge_charge_gel`.

| Fichier | Quand | Volume | Envoi réverb |
|---|---|---|---|
| `taille_rouge_charge_gel` | 0 ms, début du gel | 0,75 | 0,35 |
| `taille_rouge_lacher` | 420 ms, fin du gel | 0,70 | 0,40 |
| `taille_rouge_ruee` | 660 ms, début de la phase active | 0,85 | 0,30 |
| `taille_rouge_impact` | impact (≈ 688 ms) | 1,00 | 0,45 |
| `taille_rouge_battement` | impact + 120 ms, début du silence | 0,90 | 0,25 |
| `taille_rouge_entaille_1` à `_3` | impact + 120, 150 et 180 ms | 0,30 | 0,55 |
| `taille_rouge_aspiration` | éclatement − 170 ms | 0,75 | 0,20 |
| `taille_rouge_eclat` | impact + 300 ms | 1,00 | 0,50 |
| `taille_rouge_chiburi` | fin de récupération + 580 ms | 0,95 | 0,45 |
| `ambiance_vent_boucle` | en boucle, sans couture | 0,22 | 0 |

## Bus conseillé dans Godot

- Réverbération longue et sombre, environ 3,4 s, renvoyée à 0,6.
- Compresseur : seuil −24 dB, ratio 5, attaque 2 ms, relâchement 300 ms.
- Légère saturation, puis limiteur à −1,5 dB.

## Ducking

- **Gel** : le vent descend à 30 % et passe sous un passe-bas à 380 Hz.
- **Silence** (du battement jusqu'à l'éclatement) : le vent est coupé, les sons en cours descendent à 12 % et la réverbération à 0,12.
- **Éclatement** : tout revient en environ 0,3 s.

Au ralenti, le prototype joue les sons à la vitesse `vitesse ^ 0,6` (plus graves et plus longs).
