// Nœud n8n « Préparer recherche » — workflow version 7
// Mise à jour : ouvrez ce nœud dans n8n, sélectionnez tout le code (Ctrl+A), collez ce fichier, enregistrez le workflow.

// ⚠️ Bloc généré à partir du widget (index.html) : même logique de validation que dans le navigateur.
const CHOICE_TYPES = ['select', 'radio', 'checkboxes'];
const REGEX_TYPES = ['text', 'textarea', 'email', 'tel'];
const REGEX_PRESETS = {
  none:      { label: 'Aucun contrôle', re: '', msg: '' },
  email:     { label: 'Adresse électronique', re: '^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9\\-]+(\\.[A-Za-z0-9\\-]+)*\\.[A-Za-z]{2,}$',
               msg: 'Saisissez une adresse électronique valide, par exemple prenom.nom@agriculture.gouv.fr' },
  emailGouv: { label: 'Adresse électronique en .gouv.fr', re: '^[A-Za-z0-9._%+\\-]+@([A-Za-z0-9\\-]+\\.)*gouv\\.fr$',
               msg: 'Saisissez une adresse se terminant par .gouv.fr' },
  emailAgri: { label: 'Adresse agriculture.gouv.fr ou educagri.fr', re: '^[A-Za-z0-9._%+\\-]+@(agriculture\\.gouv\\.fr|educagri\\.fr)$',
               msg: 'Saisissez une adresse en @agriculture.gouv.fr ou @educagri.fr' },
  telFR:     { label: 'Téléphone français', re: '^(?:(?:\\+|00)33\\s?|0)[1-9](?:[\\s.\\-]?\\d{2}){4}$',
               msg: 'Saisissez un numéro valide, par exemple 06 12 34 56 78' },
  cp:        { label: 'Code postal', re: '^\\d{5}$', msg: 'Le code postal comporte 5 chiffres' },
  siret:     { label: 'SIRET (14 chiffres)', re: '^\\d{3}\\s?\\d{3}\\s?\\d{3}\\s?\\d{5}$', msg: 'Le SIRET comporte 14 chiffres' },
  uai:       { label: 'Code UAI d’établissement', re: '^\\d{7}[A-Za-z]$', msg: 'Le code UAI comporte 7 chiffres suivis d’une lettre' },
  custom:    { label: 'Expression personnalisée…', re: '', msg: '' }
};
function isEmpty(v) { return v == null || v === '' || v === false || (Array.isArray(v) && !v.length); }
function norm(v) { return String(v == null ? '' : v).trim().toLowerCase(); }
function keyNorm(v) { return String(v == null ? '' : v).toLowerCase().replace(/\s+/g, ''); }
function isInput(f) { return !!f && f.type !== 'section' && f.type !== 'contenu' && f.type !== 'explication' && f.type !== 'pagebreak'; }
function testCond(c, values) {
  const op = c.op || 'eq';
  const v = values[c.fieldId];
  if (op === 'empty') return isEmpty(v);
  if (op === 'notEmpty') return !isEmpty(v);
  if (op === 'gt' || op === 'lt') {
    if (isEmpty(v)) return false;
    const a = Number(String(v).replace(',', '.')), b = Number(String(c.value).replace(',', '.'));
    if (isNaN(a) || isNaN(b)) return false;
    return op === 'gt' ? a > b : a < b;
  }
  const target = norm(c.value);
  const arr = Array.isArray(v) ? v.map(norm) : typeof v === 'boolean' ? [v ? 'oui' : 'non'] : [norm(v)];
  if (op === 'eq') return arr.includes(target);
  if (op === 'neq') return !arr.includes(target);
  if (op === 'contains') return arr.some(x => x.includes(target));
  return true;
}
function computeVisibilityFrom(fields, values) {
  const vis = {};
  let sectionVisible = true;
  for (const f of fields) {
    let own = true;
    if (f.condition && f.condition.fieldId) own = vis[f.condition.fieldId] !== false && testCond(f.condition, values);
    if (f.type === 'section') { sectionVisible = own; vis[f.id] = own; }
    else vis[f.id] = own && sectionVisible;
  }
  return vis;
}
function getRule(f) {
  const p = f.regexPreset || 'none';
  if (p === 'custom') return f.regex ? { re: f.regex, msg: f.regexMessage || 'Le format saisi n’est pas valide.' } : null;
  if (p !== 'none' && REGEX_PRESETS[p]) return { re: REGEX_PRESETS[p].re, msg: f.regexMessage || REGEX_PRESETS[p].msg };
  if (f.type === 'email') return { re: REGEX_PRESETS.email.re, msg: f.regexMessage || REGEX_PRESETS.email.msg };
  return null;
}
function compileRule(rule) {
  if (!rule || !rule.re) return null;
  let src = rule.re, flags = '';
  const m = /^\/(.*)\/([gimsuy]*)$/.exec(src);
  if (m) { src = m[1]; flags = m[2].replace('g', ''); }
  try { return new RegExp(src, flags); } catch (e) { return null; }
}
function validateField(f, v) {
  if (f.required && isEmpty(v)) {
    if (f.type === 'checkbox') return 'Vous devez cocher cette case.';
    if (f.type === 'checkboxes') return 'Cochez au moins une option.';
    return CHOICE_TYPES.includes(f.type) || f.type === 'yesno' ? 'Sélectionnez une option.' : 'Ce champ est obligatoire.';
  }
  if (isEmpty(v)) return '';
  if (f.type === 'number' && isNaN(Number(String(v).replace(',', '.').replace(/\s/g, '')))) return 'Saisissez un nombre.';
  if (f.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return 'Saisissez une date valide.';
  if (typeof v === 'string') {
    const rule = getRule(f);
    const rx = compileRule(rule);
    if (rx && !rx.test(v)) return rule.msg;
  }
  return '';
}
function toGristTyped(f, v, t) {
  t = t || '';
  if (t === 'Bool') return typeof v === 'boolean' ? v : (v === '' || v == null ? null : /^(oui|true|1|yes|vrai)$/i.test(String(v)));
  if (t === 'Numeric' || t === 'Int') {
    if (v === '' || v == null) return null;
    const n = Number(String(v).replace(',', '.').replace(/\s/g, ''));
    return isNaN(n) ? String(v) : (t === 'Int' ? Math.round(n) : n);
  }
  if (t === 'Date' || t.indexOf('DateTime') === 0) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v));
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 1000 : (v || null);
  }
  if (t === 'ChoiceList') {
    const arr = Array.isArray(v) ? v : (isEmpty(v) ? [] : [String(v)]);
    return arr.length ? ['L'].concat(arr) : null;
  }
  if (!t) {
    if (f.type === 'checkbox') return !!v;
    if (f.type === 'number') return v === '' ? null : Number(String(v).replace(',', '.'));
  }
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
  if (Array.isArray(v)) return v.join(', ');
  return v;
}

const ID = /^[A-Za-z_][A-Za-z0-9_]*$/;
const DOC = /^[A-Za-z0-9_-]+$/;
function isTrue(c) { return `CAST("${c}" AS TEXT) IN ('1', 'T', 'true', 'True')`; }
function keySql(c) { return `lower(replace(replace(replace(CAST("${c}" AS TEXT), ' ', ''), char(9), ''), char(160), ''))`; }
// Condition SQL d'une règle : code + rattachement au formulaire (+ ouverture si demandé)
function ruleWhere(rule, value, slug, requireOpen) {
  const conds = [], args = [];
  if (value != null) { conds.push(`${keySql(rule.keyColId)} = ?`); args.push(keyNorm(value)); }
  if (rule.formColId && ID.test(rule.formColId) && slug) {
    if (rule.formColRef && ID.test(rule.formColRef)) conds.push(`(SELECT "Slug" FROM "${rule.formColRef}" WHERE id = "${rule.formColId}") = ?`);
    else conds.push(`CAST("${rule.formColId}" AS TEXT) = ?`);
    args.push(slug);
  }
  if (requireOpen && rule.openColId && ID.test(rule.openColId)) conds.push(isTrue(rule.openColId));
  return { where: conds.length ? conds.join(' AND ') : '1 = 1', args };
}

const { config, req, docId, gristUrl } = $input.first().json;
const rule = (config.lookups || []).find(l => l.id === req.rule);
const value = keyNorm(req.value);
const none = { gristUrl, docId, sql: 'SELECT 1 AS ok WHERE 0 = 1', args: [], maps: [] };
if (!rule || !value || !ID.test(rule.tableId || '') || !ID.test(rule.keyColId || '')) return [{ json: none }];
const targetDoc = (rule.external && rule.docId) ? rule.docId : docId;
if (!DOC.test(targetDoc)) return [{ json: none }];
const maps = (rule.mappings || []).filter(m => m.fieldId && ID.test(m.colId || ''));
const cols = [...new Set(maps.map(m => m.colId))];
const open = rule.openColId && ID.test(rule.openColId) ? [`CASE WHEN ${isTrue(rule.openColId)} THEN 1 ELSE 0 END AS "__open"`] : [];
const select = [`"${rule.keyColId}" AS "__key"`].concat(open, cols.map(c => `"${c}"`)).join(', ');
const w = ruleWhere(rule, value, String(req.f || ''), false);
return [{ json: {
  gristUrl, docId: targetDoc, maps, args: w.args,
  sql: `SELECT ${select} FROM "${rule.tableId}" WHERE ${w.where} LIMIT 1`
} }];
