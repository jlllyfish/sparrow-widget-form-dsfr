// Nœud n8n « Préparer la liste » — workflow version 6
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
function isInput(f) { return !!f && f.type !== 'section' && f.type !== 'contenu' && f.type !== 'explication'; }
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

// Liste des choix d'un champ « Choix dans une table » (codes + intitulés, filtrés par formulaire et ouverture)
const { config, req, docId, gristUrl } = $input.first().json;
const rule = (config.lookups || []).find(l => l.id === req.rule);
const none = reason => [{ json: { gristUrl, docId, sql: 'SELECT 1 AS ok WHERE 0 = 1', args: [], reason } }];
const trig = rule && (config.fields || []).find(f => f.id === rule.triggerFieldId);
if (!rule) return none('La règle de préremplissage n’existe pas dans la version publiée : cliquez sur Publier.');
if (!trig || trig.type !== 'tableselect') return none('Le champ de la règle n’est pas un « Choix dans une table » dans la version publiée.');
if (!ID.test(rule.tableId || '') || !ID.test(rule.keyColId || '')) return none('Table ou colonne du code non renseignée dans la règle.');
const targetDoc = (rule.external && rule.docId) ? rule.docId : docId;
if (!DOC.test(targetDoc)) return none('Identifiant de document invalide.');
const slug = String(req.f || '');
if (req.action === 'diag') {
  // Diagnostic : combien de lignes passent chaque filtre, et quelles valeurs contient la colonne « formulaire »
  const fc = rule.formColId && ID.test(rule.formColId) ? rule.formColId : '';
  const oc = rule.openColId && ID.test(rule.openColId) ? rule.openColId : '';
  const formVal = fc ? (rule.formColRef && ID.test(rule.formColRef) ? `(SELECT "Slug" FROM "${rule.formColRef}" WHERE id = "${fc}")` : `CAST("${fc}" AS TEXT)`) : '';
  const formOk = fc ? `${formVal} = ?` : '1 = 1', openOk = oc ? isTrue(oc) : '1 = 1';
  const args = fc ? [slug, slug] : [];
  const sql = `SELECT COUNT(*) AS total,
    SUM(CASE WHEN "${rule.keyColId}" IS NULL OR CAST("${rule.keyColId}" AS TEXT) = '' THEN 1 ELSE 0 END) AS sans_code,
    SUM(CASE WHEN ${formOk} THEN 1 ELSE 0 END) AS bon_formulaire,
    SUM(CASE WHEN ${openOk} THEN 1 ELSE 0 END) AS ouvertes,
    SUM(CASE WHEN ${formOk.replace('?', '?')} AND ${openOk} THEN 1 ELSE 0 END) AS retenues,
    ${fc ? `SUBSTR(GROUP_CONCAT(DISTINCT ${formVal}), 1, 200)` : "''"} AS valeurs_formulaire,
    ${oc ? `SUBSTR(GROUP_CONCAT(DISTINCT quote("${oc}")), 1, 60)` : "''"} AS valeurs_ouvert
    FROM "${rule.tableId}"`;
  return [{ json: { gristUrl, docId: targetDoc, args, sql, diag: { table: rule.tableId, formCol: fc, openCol: oc, slug } } }];
}
const lab = rule.labelColId && ID.test(rule.labelColId) ? `, "${rule.labelColId}" AS "__label"` : '';
const w = ruleWhere(rule, null, slug, true);
return [{ json: { gristUrl, docId: targetDoc, args: w.args,
  sql: `SELECT "${rule.keyColId}" AS "__key"${lab} FROM "${rule.tableId}" WHERE ${w.where} ORDER BY 1 LIMIT 5000` } }];
