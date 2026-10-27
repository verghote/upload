# 1. Présentation du module

Ce module permet de gérer un ensemble de documents PDF **associés à des données stockées en base de données**.

Contrairement au module `uploaddocument`, qui se contente de lister les fichiers présents dans un répertoire, chaque document est ici décrit par un enregistrement de la table `document` :

| Colonne   | Rôle                                                        |
|-----------|-------------------------------------------------------------|
| `id`      | Identifiant du document (clé primaire auto-incrémentée)     |
| `titre`   | Titre affiché à l'utilisateur (unique, 10 à 100 caractères) |
| `fichier` | Nom du fichier PDF stocké sur le disque (unique)            |
| `rang`    | Position du document dans la liste                          |

Les fichiers PDF sont stockés dans le répertoire :

```text
public/data/document
```

dont le chemin est défini par la constante `DOSSIER_DOCUMENT` dans `bootstrap/bootstrap.php`.

Le module propose les fonctionnalités suivantes :

| Page                 | Rôle                                                              |
|----------------------|-------------------------------------------------------------------|
| `liste`              | Consulter les documents et afficher un PDF                        |
| `ajout`              | Ajouter un document (titre + fichier PDF)                         |
| `maj`                | Modifier un titre, remplacer le fichier PDF, supprimer un document |
| `ordonnancement`     | Modifier l'ordre d'affichage des documents                        |
| `afficher.php`       | Envoyer le PDF au navigateur à partir de l'identifiant du document |

Les fichiers constituant le module sont regroupés dans :

```text
public/document/
├── afficher.php
├── config/menuhorizontal.json
├── liste/
├── ajout/            (index.*, ajax/ajouter.php)
├── maj/              (index.*, ajax/modifiertitre.php, remplacer.php, supprimer.php)
└── ordonnancement/   (index.*, ajax/modifierrang.php)
```

Les paramètres de téléversement sont définis dans les fichiers de configuration :

```text
config/document.php
config/pdf.php
```

# 2. Principe général : la base et le disque doivent rester cohérents

Chaque document est constitué de **deux éléments** :

```text
Enregistrement en base  <──── fichier ────>  Fichier PDF sur le disque
(titre, nom du fichier, rang)                (public/data/document/xxx.pdf)
```

Chaque opération doit donc modifier les deux éléments sans laisser d'incohérence :

| Opération      | Base de données                  | Disque                        |
|----------------|----------------------------------|-------------------------------|
| Ajout          | `INSERT`                         | Copie du fichier              |
| Remplacement   | aucune modification              | Écrasement du fichier         |
| Modification du titre | `UPDATE titre`            | aucune modification           |
| Suppression    | `DELETE`                         | Suppression du fichier        |

Le nom du fichier n'est **jamais** fourni par le navigateur lors d'une modification ou d'une suppression : seul l'identifiant du document est transmis, le contrôleur retrouve ensuite le nom du fichier en base de données. Cela limite fortement les risques de manipulation des chemins (voir le paragraphe 8).

# 3. Les classes utilisées

## 3.1. La classe métier `Document`

La classe `ClasseMetier\Document` dérive de `Table`. Elle décrit la table `document` :

- la colonne `titre` : obligatoire, modifiable, 10 à 100 caractères, motif de validation (lettres, chiffres, espace, apostrophe, tiret), espaces superflus supprimés ;
- la colonne `fichier` : obligatoire, **non modifiable** après l'insertion ;
- la colonne `rang` : non renseignée à l'insertion, modifiable.

Elle fournit également deux méthodes de consultation :

```php
Document::getAll();      // tous les documents, triés par rang puis par titre
Document::getById($id);  // un document ou null
```

La validation des données (longueur, motif, unicité) est donc centralisée dans la classe métier. Les héritages `add()`, `modify()` et `delete()` de `Table` sont utilisés par les contrôleurs.

## 3.2. Les classes techniques

Le module réutilise les classes déjà présentées dans la documentation du module de gestion des documents PDF :

- `InputFile` : validation et normalisation du fichier reçu ;
- `FileManager` : gestion physique du fichier (copie, remplacement, suppression, contrôle du nom).

Il utilise également :

- `Requete` : lecture contrôlée de `$_POST`, `$_GET` et `$_FILES` ;
- `ReponseJson` : envoi des réponses au format JSON ;
- `Config` : chargement des fichiers de configuration ;
- `Page` : alimentation et affichage de l'interface.

# 4. La page `liste`

## 4.1. Le script `liste/index.php`

Il transmet au JavaScript :

- la liste des documents (`Document::getAll()`) ;
- le chemin web du répertoire de stockage, obtenu en retirant `DOSSIER_WWW` de `DOSSIER_DOCUMENT`.

## 4.2. Le fichier `liste/index.js`

Pour chaque document, le script clone le template `tplLigneDocument` et renseigne le titre et le nom du fichier.

Le script vérifie ensuite que le fichier existe réellement sur le serveur à l'aide d'une requête HTTP `HEAD` :

```javascript
const response = await fetch(url, { method: 'HEAD' });
return response.ok;
```

Deux états sont alors possibles :

- le fichier existe : une icône 👁️ est affichée avec un lien vers `afficher.php?id=<id>` ;
- le fichier est absent : une icône ⚠️ est affichée et le nom du fichier est signalé comme manquant.

Les vérifications sont lancées en parallèle (`Promise.all`) afin de ne pas ralentir l'affichage.

Cette vérification permet de détecter une incohérence entre la base de données et le disque.

## 4.3. Le script `afficher.php`

Le lien d'affichage ne contient que l'identifiant du document :

```text
afficher.php?id=3
```

Le script :

1. lit l'identifiant avec `Requete::getInt('id')`, qui refuse toute valeur qui n'est pas un entier ;
2. recherche le document avec `Document::getById()` et lève une `UserException` s'il n'existe pas ;
3. construit le chemin du fichier à partir du nom **lu en base de données** ;
4. vérifie que le fichier existe ;
5. envoie les entêtes HTTP puis le contenu :

```php
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . $document['fichier'] . '"');
header('Content-Length: ' . filesize($fichier));
readfile($fichier);
```

Le navigateur ne connaît donc jamais le chemin réel du fichier sur le serveur.

# 5. La page `ajout`

## 5.1. Le fichier `ajout/index.html`

Le formulaire contient :

- un champ `titre` (10 à 100 caractères, motif identique à celui de la classe `Document`) ;
- un bouton `btnFichier` associé à un champ `file` masqué (`accept=".pdf"`) ;
- une balise `nomFichier` affichant le nom du fichier sélectionné ;
- un bouton `btnAjouter`.

## 5.2. Le script `ajout/index.php`

Il transmet au JavaScript les paramètres de téléversement chargés avec `Config::chargerPhp('document')` : taille maximale et extensions autorisées.

## 5.3. Le fichier `ajout/index.js`

Le fichier sélectionné est conservé dans la variable globale `leFichier`.

La fonction `controlerFichier(file)` contrôle la taille et l'extension avec `fichierValide()`. Si le champ titre est vide, il est pré-rempli avec le nom du fichier privé de son extension.

Au clic sur `btnAjouter` :

1. les erreurs précédentes sont effacées ;
2. les espaces superflus du titre sont supprimés ;
3. si aucun fichier n'est sélectionné, une erreur est affichée sous le champ `fichier` ;
4. sinon, si les données du formulaire sont valides, `ajouter()` est appelée.

La fonction `ajouter()` envoie le fichier et le titre avec un objet `FormData` vers `ajax/ajouter.php`. En cas de succès, l'utilisateur est redirigé vers la page `liste`.

## 5.4. Le script `ajout/ajax/ajouter.php`

Il réalise les opérations suivantes :

1. vérification de la méthode `POST` et du jeton (`Requete::exigerPost()`) ;
2. lecture du titre et du fichier ;
3. vérification de la présence du fichier ;
4. validation du fichier par `InputFile` (taille, extension, type MIME) ;
5. copie du fichier par `FileManager::copier()` ; le nom réellement utilisé est retourné ;
6. ajout de l'enregistrement dans la table `document` avec le titre et le nom du fichier.

Le point important est la **gestion de l'échec de l'étape 6**. Le fichier est déjà sur le disque ; si l'insertion échoue (titre déjà utilisé, titre invalide…), il deviendrait un fichier orphelin. Le contrôleur utilise donc un bloc `try/catch` :

```php
try {
    $document->add(['titre' => $titre, 'fichier' => $nomUnique]);
} catch (\Throwable $e) {
    $fileManager->supprimer($nomUnique);
    throw $e;
}
```

Le fichier est supprimé, puis l'exception est relancée pour être traitée par le gestionnaire d'erreurs de l'application.

```text
Fichier + titre reçus
        ↓
InputFile : validation
        ↓
FileManager : copie sur le disque
        ↓
Document : insertion en base
        ↓ (échec)
FileManager : suppression du fichier copié
```

### Test du contrôleur

Le contrôleur peut être testé avec **Insomnia**. Il convient notamment de tester :

- une requête sans jeton ou avec un jeton invalide ;
- une requête sans fichier ;
- un titre invalide (trop court, caractères interdits) ;
- un fichier trop volumineux, d'extension ou de type MIME interdits ;
- un titre déjà utilisé : vérifier que le fichier n'est pas conservé sur le disque ;
- un fichier valide.

# 6. La page `maj`

La page `maj` permet de modifier le titre d'un document, de remplacer son fichier PDF ou de le supprimer, directement depuis un tableau.

## 6.1. Le script `maj/index.php`

Il transmet les documents et les paramètres de téléversement.

## 6.2. Le fichier `maj/index.js`

Chaque ligne du tableau est créée à partir du template `templateLigneDocument`. La fonction `creerLigneDocument()` y ajoute :

- un bouton de **remplacement** : il mémorise l'identifiant du document dans la variable `idDocument` puis déclenche le champ `file` masqué ;
- un bouton de **suppression** : il demande une confirmation avant d'appeler `supprimer(id)` ;
- un champ de saisie pour le **titre**.

Le titre est modifié sur l'évènement `change` du champ. Le contrôle HTML (`checkValidity()`) est effectué avant l'appel au serveur ; en cas d'erreur, le texte passe en rouge et le message du navigateur est affiché. En cas de succès, il passe en vert.

Après la sélection d'un fichier de remplacement, `fichierValide()` contrôle la taille et l'extension, puis `remplacer(file)` transmet le fichier et l'identifiant du document.

## 6.3. Le script `ajax/modifiertitre.php`

Il récupère l'identifiant et les colonnes à modifier, puis appelle `Document::modify()`. Si la modification réussit, un message est retourné ; sinon la liste des erreurs de validation est envoyée avec `ReponseJson::envoyerLesErreurs()`.

## 6.4. Le script `ajax/remplacer.php`

Il remplace le contenu du fichier PDF **sans modifier la base de données** : le nom du fichier reste identique.

1. vérification de la méthode `POST` et du jeton ;
2. lecture de l'identifiant et du fichier ;
3. recherche du document en base pour obtenir le nom du fichier associé ;
4. validation du nouveau fichier avec `InputFile` ;
5. remplacement du fichier avec `FileManager::remplacer()`.

Le nom du fichier remplacé est celui lu en base de données et non une valeur fournie par l'utilisateur.

## 6.5. Le script `ajax/supprimer.php`

1. vérification de la méthode `POST` et du jeton ;
2. lecture de l'identifiant ;
3. recherche du document pour obtenir le nom du fichier ;
4. suppression de l'enregistrement en base ;
5. vérification de l'existence du fichier puis suppression avec `FileManager::supprimer()`.

La base de données est modifiée **en premier**. Si le fichier est absent ou ne peut pas être supprimé, l'opération reste réussie du point de vue de la base, et un message adapté informe l'utilisateur :

- « Le document a été supprimé, mais le fichier associé n'a pas été trouvé sur le disque » ;
- « Le document a été supprimé de la base de données, mais le fichier n'a pas pu être retiré du disque ».

### Test des contrôleurs

Il convient notamment de tester :

- l'absence de jeton ou un jeton invalide ;
- un identifiant inexistant ;
- une modification de titre invalide ou en doublon ;
- le remplacement avec un fichier invalide, puis avec un fichier valide ;
- la suppression d'un document dont le fichier a été préalablement retiré du disque.

# 7. La page `ordonnancement`

Cette page permet de modifier l'ordre d'affichage des documents par glisser-déposer.

## 7.1. Le fichier `ordonnancement/index.js`

La fonction `ordonnerElement()` (composant `ordonnancement.js`) construit la liste ordonnable à partir de la liste des documents, avec `id` comme clé et `titre` comme libellé. Elle appelle la fonction `modifierRang()` avec les identifiants dans leur nouvel ordre.

`modifierRang()` envoie une requête par document vers `ajax/modifierrang.php` avec le nouveau rang (position + 1). Les requêtes sont lancées en parallèle avec `Promise.all`. Si l'une d'elles échoue, un message d'erreur indique que l'ordre n'a pas été entièrement enregistré ; sinon l'utilisateur est redirigé vers la liste.

## 7.2. Le script `ajax/modifierrang.php`

Il modifie la colonne `rang` du document avec `Document::modify()`. La colonne `rang` est la seule colonne numérique modifiable, avec contrôle par la classe métier.

La liste utilise `ORDER BY rang, titre` : les documents de même rang sont triés par titre.


# 8. Sécurité

## 8.1. Traversée de répertoire

Dans ce module, le nom du fichier utilisé sur le disque provient toujours :

- soit de la base de données (`afficher.php`, `remplacer.php`, `supprimer.php`) ;
- soit du fichier téléversé, après normalisation par `InputFile` (`ajouter.php`).

En complément, `FileManager` contrôle systématiquement le nom (voir la documentation du module de gestion des documents PDF). Il y a donc deux niveaux de protection.

## 8.2. Autres protections

- Toutes les requêtes de modification utilisent `Requete::exigerPost()` : méthode `POST` et jeton obligatoires.
- Les paramètres sont lus avec des méthodes typées (`postInt`, `postString`, `getInt`…).
- Les données saisies sont validées par la classe métier, et pas seulement par le navigateur.
- Le titre est affiché avec `textContent`, jamais avec `innerHTML`, ce qui évite l'injection de code HTML.

# 9. Tests fonctionnels

### Ajout

- ajouter un document valide ;
- tenter d'ajouter un document sans titre, sans fichier, avec un titre déjà utilisé ;
- vérifier qu'aucun fichier orphelin ne subsiste après un échec d'insertion.

### Liste

- vérifier l'affichage du PDF dans un nouvel onglet ;
- retirer un fichier du disque et vérifier l'affichage de l'icône ⚠️ ;
- tester `afficher.php` avec un identifiant inexistant ou non numérique.

### Mise à jour

- modifier un titre (valide, invalide, en doublon) ;
- remplacer le fichier d'un document et vérifier que le nouveau contenu est affiché ;
- supprimer un document et vérifier la disparition de la ligne et du fichier.

### Ordonnancement

- modifier l'ordre et vérifier qu'il est conservé sur la page `liste`.

# 10. Points d'attention constatés dans le code

La rédaction de cette documentation a mis en évidence quelques incohérences à corriger :

1. **Clé `extensions` / `lesExtensions`.** `maj/index.js` lit `lesParametres.extensions`, alors que le fichier de configuration définit la clé `lesExtensions` (`ajout/index.js` utilise la bonne clé). Dans la page `maj`, le contrôle des extensions côté navigateur n'est donc pas appliqué.
2. **Deux fichiers de configuration.** `ajout/ajax/ajouter.php` utilise `config/pdf.php` (pas de renommage en cas de doublon), alors que `remplacer.php` et les pages d'interface utilisent `config/document.php` (renommage activé). Un seul fichier devrait être retenu pour ce module.
3. **Ordre de suppression.** `supprimer.php` supprime l'enregistrement avant le fichier : un échec de suppression du fichier laisse un fichier orphelin sur le disque (signalé à l'utilisateur par un message).