  // ---------------------------------------------------------------- le Miasme : souffles, chair humide, cordes qui se serrent, battements
  // L'humide se fait avec du bruit filtre qui glisse, a attaque douce, jamais avec des petits clics ; rien d'aigu, rien de tenu.
  function inverse(d, t0, dur, g, gen) { // un son joue a l'envers, qui gonfle jusqu'a l'instant t0 + dur
    const tmp = vide(dur + 0.05); gen(tmp);
    const n = N(dur); for (const [c, pan] of [[tmp.L, -0.3], [tmp.R, 0.3]]) { const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = c[n - 1 - i] * Math.pow(i / n, 1.3); mix(d, x, t0, g, pan); }
  }
  function respire(d, t0, dur, g) { // le grave qui respire : deux sinus graves qui battent, gonfles et relaches par un souffle lent
    const n = N(dur);
    for (const [f, pan] of [[46, -0.3], [46.8, 0.3]]) mix(d, env(sinus(n, t => f + 3 * Math.sin(t * 2.4)), t => Math.min(1, t / 0.2) * (0.65 + 0.35 * Math.sin(t * 4.1)) * (t > dur - 0.3 ? Math.max(0, (dur - t) / 0.3) : 1)), t0, g, pan);
  }
  function glisse(d, t0, dur, g, o = {}) { // la chair humide qui glisse : du bruit dans une bande qui descend, attaque douce, passe-bas
    const n = N(dur), f0 = o.f0 ?? 900, f1 = o.f1 ?? 220;
    const x = env(filtre(rose(n), 'bp', t => f0 * Math.pow(f1 / f0, t / dur), o.q ?? 2.2), t => Math.pow(Math.sin(Math.PI * Math.min(1, t / dur)), 1.4));
    mix(d, filtre(x, 'lp', 2400), t0, g * 3.2, o.pan ?? 0);
  }
  function serre(d, t0, dur, g, pan = 0) { // des cordes qui se serrent : deux bandes de bruit etroites et graves qui montent lentement
    const n = N(dur);
    for (const [k, p] of [[1, pan - 0.3], [1.33, pan + 0.3]]) {
      const x = filtre(rose(n), 'bp', t => (140 + 260 * Math.pow(t / dur, 1.3)) * k, 5.0), am = lent(n, 11);
      for (let i = 0; i < n; i++) { const t = i / SR; x[i] *= Math.min(1, t / 0.05) * (t > dur - 0.06 ? Math.max(0, (dur - t) / 0.06) : 1) * (0.6 + 0.4 * am[i]); }
      mix(d, x, t0, g * 4.5, p);
    }
  }
  function dechireHumide(d, t0, g, pan = 0, gros = 1) { // la chair qui se dechire : bruit sature puis adouci, qui glisse vers le grave
    const n = N(0.5 * gros);
    const x = env(filtre(rose(n), 'bp', t => 1300 * Math.exp(-t / (0.07 * gros)) + 180, 1.2), t => Math.min(1, t / 0.004) * Math.exp(-t / (0.11 * gros)));
    mix(d, filtre(sat(x, 3), 'lp', 2600), t0, g * 3.4, pan);
    mix(d, env(filtre(brun(n), 'lp', 380), t => Math.min(1, t / 0.006) * Math.exp(-t / (0.14 * gros))), t0, g * 1.6, pan);
  }
  function pierreSourde(d, t0, g, pan = 0) { // une dalle qui se souleve et retombe : choc sourd, pierre qui frotte, sans eclat
    coup(d, t0, g * 0.7, { f0: 120, f1: 50, tau: 0.06, drive: 2.5, dur: 0.3 });
    mix(d, env(filtre(rose(N(0.25)), 'bp', 520, 1.4), t => Math.min(1, t / 0.003) * Math.exp(-t / 0.05)), t0, g * 2.2, pan);
    mix(d, env(filtre(brun(N(0.35)), 'lp', 300), t => Math.min(1, t / 0.004) * Math.exp(-t / 0.09)), t0, g * 1.4, pan);
  }
  function tendu(d, t0, g) { // la corde se tend : un « vrong » grave et court, un frottement qui monte, aucune vibration aigue
    const n = N(0.9);
    mix(d, sat(env(sinus(n, t => 62 + 30 * Math.exp(-t / 0.05)), t => Math.min(1, t / 0.004) * Math.exp(-t / 0.22)), 2.2), t0, g * 0.9, 0);
    mix(d, env(sinus(n, t => 93 + 45 * Math.exp(-t / 0.05)), t => Math.min(1, t / 0.004) * Math.exp(-t / 0.12)), t0, g * 0.35, 0.2);
    mix(d, env(filtre(rose(n), 'lp', t => 700 * Math.exp(-t / 0.08) + 120, 0.8), t => Math.min(1, t / 0.003) * Math.exp(-t / 0.1)), t0, g * 1.8, 0);
  }
  function expire(d, t0, dur, g) { // la grande expiration : un souffle grave et large qui s'ouvre, puis retombe longtemps
    const n = N(dur);
    for (const pan of [-0.7, 0, 0.7]) {
      const x = filtre(rose(n), 'lp', t => 220 + 1500 * Math.exp(-t / (dur * 0.22)) * Math.min(1, t / 0.08), 0.8), am = lent(n, 5);
      for (let i = 0; i < n; i++) { const t = i / SR; x[i] *= Math.min(1, Math.pow(t / 0.09, 1.5)) * Math.exp(-t / (dur * 0.38)) * (0.75 + 0.25 * am[i]); }
      mix(d, x, t0, g * 2.6, pan);
    }
    mix(d, env(filtre(brun(n), 'lp', 140), t => Math.min(1, t / 0.06) * Math.exp(-t / (dur * 0.5))), t0, g * 2.0, 0);
  }
  function soupir(d, t0, dur, g) { // les spores qui retombent : un soupir tres bas qui tourne d'une oreille a l'autre
    const n = N(dur);
    for (const pan of [-0.6, 0.6]) { const x = filtre(rose(n), 'bp', t => 420 - 200 * t / dur + 60 * Math.sin(t * 3 + pan), 0.9), am = lent(n, 2.5); for (let i = 0; i < n; i++) { const t = i / SR; x[i] *= Math.sin(Math.PI * Math.min(1, t / dur)) * (0.6 + 0.4 * am[i]); } mix(d, filtre(x, 'lp', 1400), t0, g * 2.4, pan); }
  }
  function grondeSous(d, t0, dur, g) { // ca court sous la place : grondement de terre qui va de gauche a droite
    const n = N(dur);
    const x = filtre(brun(n), 'lp', 260, 0.8), y = filtre(rose(n), 'bp', 380, 1.0), am = lent(n, 18);
    for (let i = 0; i < n; i++) { const t = i / SR; x[i] = (x[i] * 2.5 + y[i] * 1.2) * Math.min(1, t / 0.03) * (t > dur - 0.06 ? Math.max(0, (dur - t) / 0.06) : 1) * (0.7 + 0.3 * am[i]); }
    mix(d, filtre(sat(x, 2), 'lp', 1800), t0, g * 1.6, t => -0.8 + 1.6 * Math.min(1, t / dur));
  }
  function battementHumide(d, t0, g) { // un battement de seve : deux coups sourds (lub-dub) et un glissement mou
    coup(d, t0, g, { f0: 75, f1: 38, chute: 0.03, tau: 0.09, drive: 1.6, dur: 0.4 });
    coup(d, t0 + 0.16, g * 0.65, { f0: 66, f1: 34, chute: 0.03, tau: 0.08, drive: 1.4, dur: 0.35 });
    glisse(d, t0 + 0.01, 0.22, g * 0.25, { f0: 500, f1: 160, q: 1.6 });
  }

  // ---------------------------------------------------------------- les bruitages du Dard Tisse
  return {
    tissage() { // le grave respire, la puissance monte, la chair glisse et se serre ; une inspiration a l'envers jusqu'au lancer (0,52 s)
      const d = vide(0.75);
      respire(d, 0, 0.72, 0.4); montee(d, 0.02, 0.52, 0.3, { f0: 44, f1: 88, courbe: 1.5 });
      for (let k = 0; k < 4; k++) glisse(d, 0.04 + k * 0.11, 0.2, 0.3, { f0: RR(700, 1000), f1: RR(180, 260), pan: -0.6 + 0.4 * k });
      serre(d, 0.15, 0.37, 0.3); aspire(d, 0.22, 0.3, 0.55);
      return fondu(normer(densifier(normer(d, 0.9), 1.4), 0.8), 0.06);
    },
    lancer() { // le dard part et entre dans la pierre (+60 ms), puis file dessous jusqu'a la zone (+240 ms)
      const d = vide(0.7);
      souffle(d, 0, 0.12, 0.5, { f0: 200, f1: 900, f2: 260, pic: 0.05, siffle: 0.05, dechire: 0.04, de: -0.4, vers: 0.1 });
      pierreSourde(d, 0.06, 0.9, -0.3); dechireHumide(d, 0.06, 0.6, -0.3, 0.8); grave(d, 0.065, 0.5, { f0: 58, f1: 30, tau: 0.25, dur: 0.6 });
      grondeSous(d, 0.07, 0.19, 0.55);
      return fondu(normer(densifier(normer(d, 0.9), 1.6), 0.85), 0.15);
    },
    point(k) { // un point de couture : la dalle se souleve, la chair sort, le fil file vers le haut
      const d = vide(0.6), pan = k === 1 ? -0.25 : 0.2;
      pierreSourde(d, 0, 0.7, pan); dechireHumide(d, 0.005, 0.5, pan, 0.6);
      glisse(d, 0.02, 0.16, 0.4, { f0: 300, f1: 900, q: 1.8, pan });
      return fondu(normer(d, 0.7), 0.1);
    },
    eclosion() { // la colonne jaillit : claquement, coup sature, grave, dechirure humide, cordes qui se tendent, corps qui gronde
      const d = vide(2.6);
      claque(d, 0, 0.5);
      coup(d, 0, 0.95, { f0: 160, f1: 42, chute: 0.025, tau: 0.14, drive: 4.5, dur: 0.7 });
      grave(d, 0.004, 0.85, { f0: 62, f1: 22, tau: 0.6, dur: 1.8 });
      dechireHumide(d, 0.003, 1.0, 0, 1.4);
      for (const p of [-0.6, 0.6]) dechireHumide(d, RR(0.02, 0.06), 0.5, p, 0.9);
      serre(d, 0.05, 0.5, 0.45);
      for (const pan of [-0.6, 0.6]) mix(d, filtre(sat(env(filtre(rose(N(1.6)), 'lp', t => 1600 * Math.exp(-t / 0.12) + 160, 0.8), t => Math.min(1, t / 0.004) * Math.exp(-t / 0.4)), 2), 'lp', 3000), 0, 1.3, pan);
      for (let i = 0; i < 6; i++) pierreSourde(d, RR(0.1, 0.9), RR(0.15, 0.3), RR(-0.8, 0.8));   // les dalles qui retombent
      return fondu(normer(densifier(normer(d, 0.95), 2.0), 0.95), 0.4);
    },
    tension() { const d = vide(1.0); tendu(d, 0, 1); serre(d, 0, 0.3, 0.25); for (let i = 0; i < 3; i++) pierreSourde(d, 0.03 + i * 0.07, 0.25, -0.6 + 0.5 * i); return fondu(normer(d, 0.8), 0.2); },
    battement(k) { const d = vide(0.6); battementHumide(d, 0, 1); return fondu(normer(d, 0.6 + 0.1 * k), 0.15); },
    avant() { // l'appel d'air : la grande expiration jouee a l'envers, qui finit pile sur la floraison
      const L = 0.3, d = vide(L); inverse(d, 0, L, 1, t => expire(t, 0, 0.9, 1)); aspire(d, 0, L, 0.6);
      return fondu(normer(d, 0.65), 0.004);
    },
    floraison() { // la colonne s'ouvre : une enorme expiration grave et humide, qui dure ; le sommet de l'Art
      const d = vide(3.6);
      coup(d, 0, 0.9, { f0: 110, f1: 36, chute: 0.05, tau: 0.25, drive: 3.5, dur: 1.0 });
      grave(d, 0.01, 1.0, { f0: 52, f1: 20, tau: 1.1, dur: 3.2 });
      expire(d, 0, 3.2, 1.0);
      for (let k = 0; k < 6; k++) glisse(d, 0.05 + k * 0.08, 0.5, 0.35, { f0: RR(600, 900), f1: RR(140, 200), pan: -0.75 + 0.3 * k });   // les petales qui se deroulent
      dechireHumide(d, 0.02, 0.8, 0, 1.6);
      return fondu(normer(densifier(normer(d, 0.95), 2.4), 0.99), 0.6);
    },
    spores() { const d = vide(2.2); soupir(d, 0, 2.1, 0.8); respire(d, 0, 2.0, 0.25); return fondu(normer(d, 0.5), 0.4); },
    cloture() { const d = vide(0.8); coup(d, 0, 0.5, { f0: 90, f1: 45, tau: 0.05, drive: 1.6, dur: 0.3 }); glisse(d, 0, 0.12, 0.25, { f0: 600, f1: 300 }); souffle(d, 0.08, 0.4, 0.25, { f0: 160, f1: 600, f2: 220, siffle: 0.04, dechire: 0.02, de: 0.3, vers: -0.3 }); return fondu(normer(d, 0.5), 0.12); },
