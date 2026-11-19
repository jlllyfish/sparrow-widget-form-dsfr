// Nœud n8n « Config publique » — workflow version 7
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

// Configuration sans les détails internes (colonnes, tables, documents)
function publicConfig(config) {
  const c = JSON.parse(JSON.stringify(config));
  (c.fields || []).forEach(f => { delete f.colId; });
  c.lookups = (c.lookups || []).map(l => ({ id: l.id, triggerFieldId: l.triggerFieldId, lock: !!l.lock,
    mustMatch: !!(l.mustMatch || l.openColId || l.formColId), mappings: (l.mappings || []).map(m => ({ fieldId: m.fieldId })) }));
  ['contentSource', 'targetTableId', 'apiUrl', 'publicUrl', 'qrUrl', 'qrMode', 'responsesDocId', 'responsesTableId', 'urlLabelColId', 'urlCodes'].forEach(k => delete c[k]);
  return c;
}
const prep = $('Préparer').first().json;
return [{ json: { ok: true, version: 7, config: publicConfig(prep.config) } }];
