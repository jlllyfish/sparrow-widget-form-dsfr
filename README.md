# Sparrow – formulaire DSFR pour Grist

Formulaires publics au design de l'État (DSFR, inspiré de Démarche Numérique), conçus dans Grist et servis via un relais n8n.

![Schéma de fonctionnement](docs/schema-formulaire-dsfr-croquis.svg)

## Adresses une fois GitHub Pages activé
- Widget de conception et page publique : `https://jlllyfish.github.io/sparrow-widget-form-dsfr/index.html`
- Widget QR code : `https://jlllyfish.github.io/sparrow-widget-form-dsfr/qrcode.html`

Pour activer GitHub Pages : **Settings → Pages → Build and deployment**, choisissez « Deploy from a branch », la branche `main` et le dossier `/ (root)`.

Les pages ne dépendent d'aucun site externe : le DSFR (v1.12.1, polices et icônes) et la bibliothèque de QR code sont inclus dans le dossier `vendor/`. Dans Grist, l'API des widgets est chargée depuis l'instance Grist elle-même, avec docs.getgrist.com en secours.

## Principe : un formulaire qui s'adapte à la formation choisie
1. L'usager choisit la formation dans une **liste avec recherche** : il tape « NAS0 » ou un mot de l'intitulé. Avec un lien ou un QR code par formation, le code est déjà rempli.
2. La ligne de cette formation, dans une table Grist, remplit les **éléments non saisissables** du formulaire : titre, sous-titre, sections et blocs de texte (dates, lieu, formateur, objectifs…).
3. Les questions d'évaluation suivent. La réponse est enregistrée avec le code de la formation.

## Mise en place

Trois fichiers :
- `index.html` : sert à la fois de widget Grist (pour concevoir le formulaire) et de page publique (pour les répondants).
- `qrcode.html` : un petit widget Grist qui affiche le QR code du stage sélectionné. Il se place à côté de la table Stages.
- `n8n/workflow-n8n-formulaire-dsfr.json` : le relais n8n entre la page publique et Grist.

Le schéma `docs/schema-formulaire-dsfr-croquis.svg` résume l'ensemble.

Les répondants n'ont jamais accès au document Grist.

## Organisation des données
- **Document principal** :
  - le widget de configuration ;
  - la table `Formulaires` : une ligne par formulaire, avec le **brouillon** (bouton Enregistrer du widget) et la **configuration publiée** (bouton Publier), lue par n8n ;
  - la table `Stages`, avec les colonnes Code, Intitulé, Dates…, **Formulaire**, **Inscriptions ouvertes** et **Lien** ;
  - une table **modèle** des réponses, sur laquelle le widget est posé.
- **Document des réponses** (facultatif) : une table avec les **mêmes identifiants de colonnes** que la table modèle. Toutes les réponses publiques y arrivent. Le code stage est enregistré dans une colonne : filtrez ou regroupez par stage dans Grist.

## 1. Héberger `index.html` et `qrcode.html`
Ce dépôt est prévu pour GitHub Pages (voir plus haut). Une seule copie suffit pour tous vos formulaires.

Pour obtenir des liens plus courts, inscrivez l'URL du webhook n8n dans la constante `DEFAULT_API`, en haut du fichier. Le paramètre `&api=…` disparaît alors des liens et des QR codes.

## 2. Ajouter le widget dans Grist
1. Sur la page qui contient la table des réponses, ajoutez un widget **Personnalisé**.
2. Saisissez l'URL de `index.html` (adresse GitHub Pages ci-dessus), choisissez l'accès **complet** au document, puis cliquez sur « Ouvrir la configuration ».
3. Onglet **Général** : titre, sous-titre, introduction, logo et en-tête de l'État (bloc-marque). Ces textes sont identiques pour toutes les formations ; le titre peut être remplacé par le libellé de la formation choisie (onglet Préremplissage).
4. Onglet **Champs** :
   - ajoutez un champ **« Choix dans une table (liste avec recherche) »** pour le code de la formation, et reliez-le à la colonne du code dans la table des réponses ;
   - ajoutez les sections et les **blocs de texte** qui recevront les informations de la formation (laissez leur texte vide : ils restent masqués tant qu'aucune formation n'est choisie) ;
   - ajoutez les questions et leurs conditions d'affichage.
5. Onglet **Préremplissage** :
   - créez une règle « quand le champ Formation est renseigné, chercher dans la table des formations, colonne Code » ;
   - **Colonne affichée dans la liste** : l'intitulé, pour qu'il apparaisse à côté du code ;
   - **Correspondances** : pour chaque colonne de la ligne (Intitulé, Dates, Objectifs…), choisissez l'élément du formulaire qui l'affiche : titre ou sous-titre du formulaire, section, bloc de texte, ou champ à préremplir. Si plusieurs colonnes vont dans le même bloc, il les affiche ligne par ligne (« **Dates** : … ») ;
   - cochez « Bloquer l'envoi si la valeur est introuvable ».

   Le bouton **Ajouter Formulaire, Ouvert et Lien** complète ensuite la table Stages avec trois colonnes :
   - **Formulaire** : le modèle de formulaire utilisé par le stage ;
   - **Inscriptions ouvertes** : une case à cocher ;
   - **Lien** : une formule qui calcule l'adresse du formulaire pour ce stage.

   Renseignez d'abord l'onglet Publication, car la formule du Lien en a besoin. Si vous modifiez ensuite ces réglages, cliquez sur « Mettre à jour la colonne Lien ».

## 2 bis. Ajouter le widget QR code à côté de la table Stages
1. Ajoutez un widget **Personnalisé** avec l'URL de `qrcode.html`, sélectionné par la table Stages.
2. Dans le panneau de droite, associez les colonnes : **Lien** (obligatoire), Titre (Intitulé), Code, Détails (Dates) et Ouvert (Inscriptions ouvertes).

L'ENA sélectionne son stage et obtient directement :
- le QR code ;
- le lien à copier ;
- l'affiche à imprimer ;
- les affiches de tous les stages ouverts, d'un seul coup.

Il ouvre ou ferme lui-même les inscriptions en cochant ou décochant la case de son stage.

## 3. Installer le relais n8n
1. Dans n8n, importez le fichier `n8n/workflow-n8n-formulaire-dsfr.json`.
2. Créez une identification **Header Auth** nommée « Grist API » :
   - nom : `Authorization` ;
   - valeur : `Bearer <votre clé API Grist>`.

   Sélectionnez-la dans les 6 nœuds HTTP du workflow.
3. Dans le nœud **Paramètres**, renseignez l'URL de Grist et l'identifiant du document principal, qui contient les tables Formulaires, Stages et la table modèle des réponses.
4. Activez le workflow et copiez l'**URL de production** du nœud Webhook.

La clé API doit appartenir à un compte qui a au moins accès en lecture complète aux documents utilisés pour le préremplissage. C'est nécessaire parce que n8n interroge ces documents via l'endpoint `/sql` de Grist.

## 4. Publier
Dans le widget, onglet **Publication & QR code** :
1. Renseignez l'identifiant du formulaire, l'URL du webhook n8n et l'adresse de la page publique.
2. Cliquez sur **Publier**. Le brouillon enregistré dans la table `Formulaires` devient la version en ligne. Sans l'adresse du webhook n8n, aucun lien ni QR code n'est généré, car le formulaire public ne pourrait pas fonctionner.
3. **Destination des réponses publiques** : indiquez l'identifiant du document des réponses et le nom de sa table. Laissez vide pour enregistrer dans le document principal.
4. **Un lien et un QR code par formation** : le lien public général ouvre le formulaire sans formation choisie. Ici, chaque formation reçoit son propre lien, qui ouvre le formulaire déjà adapté à elle. Choisissez le champ qui reçoit le code de la formation : la liste des formations s'affiche, avec pour chacune :
   - son lien à copier, à envoyer par courriel aux personnes sans téléphone ;
   - son QR code ;
   - son affiche à imprimer.

   Vous pouvez aussi imprimer toutes les affiches d'un coup, ou exporter tous les liens en CSV.

   Le lien ouvre le formulaire avec le code déjà rempli et verrouillé, et les informations du stage préremplies.
5. **Afficher aussi le QR code en haut du formulaire** : pratique sur un écran partagé ou en salle, pour continuer l'inscription sur son téléphone. Le QR code suit le code stage saisi. Il est masqué sur les petits écrans.

À chaque modification du formulaire, cliquez de nouveau sur **Publier**. Pour suspendre un formulaire, décochez la case `Publie` dans la table `Formulaires`.

## Ce que fait le relais n8n
- **config** : renvoie le formulaire publié, sans aucun détail interne (ni colonnes, ni tables, ni documents).
- **options** : renvoie la liste des codes (et intitulés) proposés dans le champ « Choix dans une table ». Seules les formations rattachées au formulaire et ouvertes y figurent.
- **lookup** : renvoie uniquement les éléments à afficher ou préremplir pour la ligne choisie. La comparaison ignore la casse et les espaces. Il est impossible de télécharger la table entière. Il signale aussi si les inscriptions sont closes, et ignore les stages rattachés à un autre formulaire.
- **submit** : refait côté serveur toutes les vérifications du navigateur : champs obligatoires, expressions régulières, conditions, options proposées, et code stage existant, rattaché à ce formulaire et ouvert. Les champs masqués sont ignorés, ainsi que les colonnes non prévues. Un champ piège invisible bloque les robots.

## Vérifier que tout fonctionne
Dans le widget, onglet **Publication & QR code**, le bouton **Tester la connexion** vérifie que :
- n8n répond, et avec la bonne version du workflow ;
- le formulaire est publié et lu par n8n ;
- les dernières modifications sont publiées ;
- la liste de choix contient bien des formations.

Si le navigateur affiche une erreur CORS, vérifiez l'option *Allowed Origins (CORS)* du nœud Webhook. Elle vaut `*` par défaut ; vous pouvez y mettre l'adresse de votre page publique.
