// Nœud n8n « Résultat dépôt » — workflow version 6
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

const r = $input.first().json;
const id = r.records && r.records[0] && r.records[0].id;
return [{ json: id ? { ok: true, id } : { ok: false, message: 'L’enregistrement a échoué. Réessayez dans quelques instants.' } }];
