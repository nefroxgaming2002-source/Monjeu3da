function drawTimeline() {
  const seg = (id, a, b) => { const el = document.getElementById(id); el.style.left = pct(a); el.style.width = pct(b - a); };
  seg('seg-anti', 0, T.act); seg('seg-actif', T.act, T.rec); seg('seg-recup', T.rec, T.fin);
  ticks.innerHTML = '';
  for (const x of [...T.points, T.eclot, T.tension, T.flor, T.coupe]) { const d = document.createElement('div'); d.className = 'tick'; d.style.left = pct(x); ticks.appendChild(d); }
}
function updateHud() {
  const t = run.tau;
  let nom = 'Garde', txt = '';
  if (t >= 0 && t < T.act) { nom = t < T.lancer ? 'Tissage' : 'Couture'; txt = `${Math.round(t)} / 760 ms`; }
  else if (t >= T.act && t < T.rec) { nom = 'Éclosion'; txt = `${Math.round(t - T.act)} / 200 ms`; }
  else if (t >= T.rec && t < T.fin) { nom = 'Récupération'; txt = `${Math.round(t - T.rec)} / 600 ms`; }
  else if (t >= T.fin) { nom = 'Suite'; txt = `+${Math.round(t - T.fin)} ms`; }
  hudPhase.textContent = nom; hudMs.textContent = txt;
  hudEtat.textContent = run.hitstop > 0 ? `arrêt sur coup ${run.stopLabel} ms` : t >= T.tension && t < T.flor ? 'le fil se tend' : t >= T.flor && t < T.flor + 900 ? 'floraison' : '';
  tete.style.left = pct(Math.max(0, t));
}
