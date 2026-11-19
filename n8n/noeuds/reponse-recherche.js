// Nœud n8n « Réponse recherche » — workflow version 6
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

// Erreur renvoyée par Grist (le nœud HTTP continue en cas d'erreur)
function gristError(res, node) {
  if (Array.isArray(res.records)) return '';
  const e = res.error || {};
  const why = String(e.message || e.description || (typeof e === 'string' ? e : JSON.stringify(e)) || 'réponse inattendue').slice(0, 200);
  const auth = /401|403|unauthori|forbidden|permission|access|credential/i.test(why);
  return `Grist a refusé la requête du nœud « ${node} » (${why}).` + (auth ? ' Vérifiez que l’identification « Grist API » est bien sélectionnée sur ce nœud et que la clé a accès au document.' : '');
}
const prep = $('Préparer recherche').first().json;
const res = $input.first().json;
const err = gristError(res, 'Rechercher (SQL)');
if (err) return [{ json: { ok: false, error: err } }];
const rec = (res.records || [])[0];
if (!rec) return [{ json: { ok: true, found: false } }];
// Plusieurs colonnes vers un même élément : une ligne « **Libellé** : valeur » par colonne
const show = (v, t) => {
  if (Array.isArray(v)) return v.slice(v[0] === 'L' ? 1 : 0).join(', ');
  if (/^Date/.test(t || '') && typeof v === 'number') return new Date(v * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return v == null ? '' : String(v);
};
const groups = {};
prep.maps.forEach(m => { (groups[m.fieldId] = groups[m.fieldId] || []).push(m); });
const fields = {};
Object.entries(groups).forEach(([fid, ms]) => {
  fields[fid] = ms.length === 1 ? rec.fields[ms[0].colId]
    : ms.map(m => [m.label || m.colId, show(rec.fields[m.colId], m.type)]).filter(([, v]) => v.trim()).map(([l, v]) => `**${l}** : ${v}`).join('\n');
});
const closed = ('__open' in rec.fields) && !rec.fields.__open;
return [{ json: { ok: true, found: true, closed, key: rec.fields.__key, fields } }];
