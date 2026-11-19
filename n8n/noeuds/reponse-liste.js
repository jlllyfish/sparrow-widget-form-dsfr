// Nœud n8n « Réponse liste » — workflow version 6
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

// Erreur renvoyée par Grist (le nœud HTTP continue en cas d'erreur)
function gristError(res, node) {
  if (Array.isArray(res.records)) return '';
  const e = res.error || {};
  const why = String(e.message || e.description || (typeof e === 'string' ? e : JSON.stringify(e)) || 'réponse inattendue').slice(0, 200);
  const auth = /401|403|unauthori|forbidden|permission|access|credential/i.test(why);
  return `Grist a refusé la requête du nœud « ${node} » (${why}).` + (auth ? ' Vérifiez que l’identification « Grist API » est bien sélectionnée sur ce nœud et que la clé a accès au document.' : '');
}
const prep = $('Préparer la liste').first().json;
const res = $input.first().json;
if (prep.reason) return [{ json: { ok: false, version: 6, error: prep.reason } }];
const err = gristError(res, 'Lister (SQL)');
if (err) return [{ json: { ok: false, version: 6, error: err } }];
if (prep.diag) return [{ json: { ok: true, version: 6, diag: Object.assign({}, prep.diag, (res.records[0] || {}).fields || {}) } }];
const options = (res.records || []).map(r => ({ value: String(r.fields.__key ?? '').trim(), label: r.fields.__label == null ? '' : String(r.fields.__label) }))
  .filter(o => o.value);
return [{ json: { ok: true, version: 6, options } }];
