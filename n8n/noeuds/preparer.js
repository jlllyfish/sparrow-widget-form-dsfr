// Nœud n8n « Préparer » — workflow version 6
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

const VERSION = 6;
const p = $('Paramètres').first().json;
const res = $input.first().json;
const req = p.req || {};
const rec = (res.records || [])[0];
let config = null;
try { config = rec && rec.fields.Publie ? JSON.parse(rec.fields.Config) : null; } catch (e) { config = null; }
if (req.action === 'ping') return [{ json: { action: 'error', ok: true, version: VERSION, published: !!config } }];
if (!config) return [{ json: { action: 'error', ok: false, version: VERSION, error: 'Ce formulaire n’existe pas ou n’est plus ouvert.' } }];
if (!['config', 'lookup', 'submit', 'options', 'diag'].includes(req.action)) return [{ json: { action: 'error', ok: false, version: VERSION, error: 'Requête invalide.' } }];
// Destination des réponses : autre document si configuré, sinon le document principal
const DOC = /^[A-Za-z0-9_-]+$/, ID = /^[A-Za-z_][A-Za-z0-9_]*$/;
const otherDoc = config.responsesDocId && DOC.test(config.responsesDocId);
const respDocId = otherDoc ? config.responsesDocId : p.docId;
const respTableId = otherDoc && ID.test(config.responsesTableId || '') ? config.responsesTableId : config.targetTableId;
return [{ json: { action: req.action, config, req, gristUrl: p.gristUrl, docId: p.docId, respDocId, respTableId } }];
