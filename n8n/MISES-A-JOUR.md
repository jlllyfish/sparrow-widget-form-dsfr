# Mettre à jour le workflow n8n sans le réimporter

Le dossier `noeuds/` contient le code de chaque nœud « Code » du workflow, un fichier par nœud. Pour appliquer une mise à jour :

1. Dans n8n, ouvrez le workflow et double-cliquez sur le nœud concerné, par exemple « Valider ».
2. Cliquez dans le code, sélectionnez tout (Ctrl+A) et collez le contenu du fichier correspondant, par exemple `noeuds/valider.js`.
3. Fermez le nœud, puis **enregistrez le workflow**. Il reste actif.

Le nœud **Paramètres**, qui contient votre adresse Grist et l'identifiant du document, n'est jamais à remplacer. Les nœuds HTTP n'ont pas changé depuis la version 4.

La version en service s'affiche dans le widget, avec le bouton « Tester la connexion » (« workflow version N »).

## Historique

| Version | Nœuds à remplacer | Changement |
|---|---|---|
| 6 (facultatif) | `preparer-recherche.js`, `preparer-la-liste.js`, `valider.js` | Le « saut de page » est reconnu comme élément non saisissable. Sans cette mise à jour, tout fonctionne : n8n l'ignore déjà. |
| 6 | `preparer.js`, `preparer-recherche.js`, `preparer-la-liste.js`, `valider.js` | Les cases cochées stockées par Grist sous la forme « T » sont reconnues. |
| 5 | `preparer.js`, `preparer-la-liste.js`, `reponse-liste.js` | Diagnostic de la liste de choix. |
| 4 | Réimport complet | Messages d'erreur de Grist explicites, suppression de la table Contenus. |

À partir de la version 6, chaque évolution du workflow indiquera ici les seuls nœuds à remplacer.
