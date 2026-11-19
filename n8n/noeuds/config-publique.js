// Nœud n8n « Config publique » — workflow version 6
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

// Renvoie la configuration sans les détails internes (colonnes, tables, documents)
const prep = $('Préparer').first().json;
const c = JSON.parse(JSON.stringify(prep.config));
(c.fields || []).forEach(f => { delete f.colId; });
c.lookups = (c.lookups || []).map(l => ({ id: l.id, triggerFieldId: l.triggerFieldId, lock: !!l.lock,
  mustMatch: !!(l.mustMatch || l.openColId || l.formColId), mappings: (l.mappings || []).map(m => ({ fieldId: m.fieldId })) }));
['contentSource', 'targetTableId', 'apiUrl', 'publicUrl', 'qrUrl', 'qrMode', 'responsesDocId', 'responsesTableId', 'urlLabelColId', 'urlCodes'].forEach(k => delete c[k]);
return [{ json: { ok: true, version: 6, config: c } }];
