// Nœud n8n « Décider » — workflow version 6
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

const items = $('Valider').all().map(i => i.json);
const results = $input.all().map(i => i.json);
const base = items[0];
if (base.spam) return [{ json: { route: 2, ok: true, id: null } }];
const errors = Object.assign({}, base.errors);
let gristFail = '';
items.forEach((c, i) => {
  if (!c.fieldId) return;
  const r = results[i] || {};
  if (!Array.isArray(r.records)) { gristFail = 'Contrôle impossible : Grist a refusé la requête du nœud « Vérifier (SQL) ».'; return; }
  if (!r.records.length) errors[c.fieldId] = errors[c.fieldId] || 'Code introuvable ou inscriptions closes.';
});
if (gristFail) errors._global = gristFail;
const global = errors._global;
delete errors._global;
if (global || Object.keys(errors).length) {
  return [{ json: { route: 1, ok: false, errors, message: global || 'Le formulaire contient des erreurs. Corrigez les champs signalés.' } }];
}
return [{ json: { route: 0, gristUrl: base.gristUrl, docId: base.saveDocId, tableId: base.tableId, record: base.record } }];
