# 1. Présentation du module

Ce module permet de gérer un ensemble de documents au format PDF.

Les documents sont stockés dans le répertoire :  data/pdf

Le module propose une interface unique permettant :
- de consulter la liste des documents ;
- d'ajouter un document ;
- de supprimer un document.

Lors de l'ajout d'un document, celui-ci est enregistré dans le répertoire de stockage. Si un fichier portant le même nom existe déjà, un suffixe numérique est ajouté afin de générer un nom unique :

```text
document.pdf
document(1).pdf
document(2).pdf
```

Les paramètres de configuration du module sont définis dans :

```text
config/pdf.php
```

Le répertoire de stockage est défini sous la forme d'une constante dans :

```text
bootstrap.php
```

Les fichiers constituant le module sont regroupés dans :

```text
public/uploaddocument/
```

# 2. Les classes techniques

Le fonctionnement du module repose principalement sur deux classes techniques :
- `InputFile` : validation et normalisation du fichier reçu ;
- `FileManager` : gestion physique du fichier sur le disque.

Cette séparation permet de centraliser les opérations communes et de rendre le processus de téléversement plus cohérent, maintenable et sécurisé.

### 2.1. La classe `InputFile`

La classe `InputFile` permet de valider un fichier reçu avant son traitement.

Elle vérifie notamment :

- que le fichier a bien été téléversé ;
- que le fichier temporaire existe ;
- que le téléversement provient bien d'une requête HTTP POST ;
- que sa taille respecte la limite configurée ;
- que son extension est autorisée ;
- que son type MIME correspond à un type autorisé.

Elle fournit également un mécanisme de validation spécifique pouvant être étendu par des classes spécialisées, notamment pour les images.

### Normalisation du nom du fichier

`InputFile` normalise également le nom du fichier afin de limiter les problèmes liés à l'utilisation de caractères particuliers lors de son stockage ou de sa manipulation.

Le traitement du nom suit plusieurs étapes :

1. Les caractères accentués sont translittérés vers leur équivalent sans accent lorsque cela est possible.
2. Le nom est converti en minuscules.
3. Les espaces et autres caractères considérés comme des espaces sont remplacés par un underscore (`_`).
4. Dans le nom de base, seuls les caractères suivants sont conservés :
    - les lettres minuscules `a-z` ;
    - les chiffres `0-9` ;
    - le tiret `-` ;
    - l'underscore `_`.
5. Tous les autres caractères du nom de base sont supprimés.
6. L'extension est traitée séparément : seuls les caractères `a-z` et `0-9` sont conservés.
7. Le point séparant le nom de base et l'extension est conservé.

Par exemple :

```text
Mon été à Paris (vacances) !.PDF
```

devient :

```text
mon_ete_a_paris_vacances.pdf
```

Le nom final est ainsi réduit à un format simple et prévisible, composé de caractères ASCII autorisés.

Cette normalisation limite notamment les problèmes liés aux caractères spéciaux, aux espaces, aux caractères accentués et aux caractères susceptibles de poser des difficultés lors de la manipulation des fichiers.
## 2.2. La classe `FileManager`

La classe `FileManager` assure la gestion physique des fichiers stockés sur disque dans un répertoire donné.

Elle permet notamment :
- de lister les fichiers présents dans le répertoire ;
- de vérifier l'existence d'un fichier ;
- de copier un fichier ;
- de remplacer un fichier existant ;
- de supprimer un fichier ;
- de générer un nom de fichier unique.

### Sécurisation des noms

Avant les opérations de copie, de remplacement ou de suppression, `FileManager` contrôle le nom du fichier afin d'empêcher qu'il soit utilisé pour accéder à un emplacement situé en dehors du répertoire de stockage.

Les éléments suivants sont notamment refusés :

- les séparateurs de chemin `/` et `\` ;
- le caractère `:` ;
- les caractères de contrôle ;
- les noms `.` et `..`.

La comparaison avec `basename()` permet également de vérifier que la valeur fournie correspond bien à un simple nom de fichier et non à un chemin.

Cette vérification permet notamment de se protéger contre les attaques par traversée de répertoire.

#### Gestion des doublons

Lors de la copie d'un fichier, deux comportements sont possibles selon la configuration de `FileManager`.

Si le renommage automatique est désactivé, une exception est levée lorsqu'un fichier portant le même nom existe déjà.

Si le renommage automatique est activé, un suffixe numérique est ajouté au nom :

```text
document.pdf
document(1).pdf
document(2).pdf
document(3).pdf
```

La classe recherche le premier nom disponible.
#### Filtrage des extensions

Lors de la récupération de la liste des fichiers, il est possible de définir une liste d'extensions autorisées.

Seuls les fichiers correspondant à ces extensions sont alors retournés.

#### Journalisation et gestion des erreurs

Les opérations sensibles sont journalisées lorsqu'une tentative est effectuée avec un nom invalide ou lorsqu'une opération échoue.

Lorsqu'un fichier temporaire a été correctement copié ou remplacé, il est supprimé afin d'éviter de laisser inutilement des fichiers temporaires sur le serveur.

### 2.3. Répartition des responsabilités

Les deux classes ont des responsabilités complémentaires :

```text
InputFile
    ↓
Valide et normalise le fichier entrant
    ↓
FileManager
    ↓
Gère le fichier sur le disque
```

Ainsi :

- `InputFile` valide et normalise un fichier entrant avant son traitement ;
- `FileManager` gère le fichier une fois qu'il doit être stocké sur le disque.

Le paramétrage de ces classes est réalisé à partir d'un fichier de configuration. Pour ce module, il s'agit de :

```text
config/pdf.php
```

# 3. Le fichier `index.html`

Le fichier `index.html` constitue l'interface utilisateur du module.

Il permet d'afficher la liste des documents et de proposer les actions d'ajout et de suppression.

## 3.1. Liste des documents

Le tableau affiche les fichiers PDF présents dans le répertoire :

```text
data/pdf
```

Chaque document dispose d'une action permettant sa suppression.

Le clic sur la croix déclenche une demande de confirmation avant la suppression du document.

## 3.2. Sélection d'un fichier

Le bouton `btnFichier` permet à l'utilisateur de sélectionner un fichier sur son ordinateur.

Le nom du fichier sélectionné est ensuite affiché dans la balise :

```html
nomFichier
```

Le module permet également de sélectionner un fichier par **glisser-déposer** dans cette zone.

## 3.3. Affichage des erreurs

Les messages d'erreur sont affichés sous le champ de type `file` :

```html
fichier
```

Il est donc important que cet élément soit placé immédiatement sous le champ concerné dans le document HTML afin que le message d'erreur apparaisse à l'endroit prévu.

# 4. Le script `index.php`

Le script `index.php` prépare les données nécessaires à l'affichage de l'interface.

Il récupère notamment :

- les paramètres de configuration du téléversement ;
- le répertoire de stockage ;
- la liste des fichiers PDF présents dans le répertoire.

La récupération des fichiers est réalisée à l'aide d'un objet `FileManager`.

# 5. Le script `ajax/ajouter.php`

Le script `ajax/ajouter.php` traite la demande d'ajout d'un document.

Il réalise notamment les opérations suivantes :

1. Il vérifie que la requête utilise la méthode HTTP `POST`.
2. Il vérifie la présence et la validité du jeton de sécurité.
3. Il vérifie qu'un fichier a bien été transmis dans `$_FILES['fichier']`.
4. Il récupère les paramètres de configuration du module.
5. Il instancie un objet `InputFile` afin de valider le fichier reçu.
6. Il effectue les contrôles définis par `InputFile`.
7. Il instancie un objet `FileManager` pour gérer le stockage du fichier.
8. Il copie le fichier dans le répertoire de destination.
9. Il retourne la liste mise à jour des fichiers.
    

Le fichier est donc soumis à deux niveaux de contrôle :

```text
Fichier reçu
     ↓
InputFile
     ↓
Validation + normalisation
     ↓
FileManager
     ↓
Sécurisation du nom + stockage
```

### Test du contrôleur

Le contrôleur peut être testé indépendamment de l'interface avec un outil tel qu'**Insomnia**.

Il convient notamment de tester :
- une requête sans jeton ;
- une requête avec un jeton invalide ;
- une requête sans fichier ;
- un fichier trop volumineux ;
- une extension interdite ;
- un type MIME interdit ;
- un fichier valide ;
- l'ajout d'un fichier portant un nom déjà utilisé.

# 6. Le script `ajax/supprimer.php`

Le script `ajax/supprimer.php` traite la demande de suppression d'un document.

Il réalise notamment les opérations suivantes :

1. Il vérifie que la requête utilise la méthode HTTP `POST`.
2. Il vérifie la présence et la validité du jeton de sécurité.
3. Il vérifie que le nom du fichier à supprimer a bien été transmis.
4. Il récupère les paramètres nécessaires.
5. Il instancie un objet `FileManager`.
6. Il demande à `FileManager` de supprimer le fichier après vérification de son nom.
7. Il retourne la liste mise à jour des fichiers.

La suppression ne repose donc pas directement sur une valeur fournie à `unlink()`. Le nom est d'abord contrôlé par `FileManager`.
### Test du contrôleur

Le contrôleur peut également être testé avec **Insomnia**.

Il convient notamment de vérifier :

- la réponse à une requête `GET` ;
- l'absence de jeton ;
- un jeton invalide ;
- un nom de fichier inexistant ;
- un nom de fichier valide ;
- une tentative de traversée de répertoire.

# 7. Protection contre la traversée de répertoire

La **traversée de répertoire** est une technique d'exploitation qui consiste à manipuler un chemin fourni par l'utilisateur afin d'accéder à des fichiers ou à des répertoires situés en dehors de l'emplacement normalement prévu par l'application.

Par exemple, une valeur telle que :

```text
../../../etc/passwd
```

pourrait, dans une application vulnérable, être utilisée pour tenter d'accéder au fichier :

```text
/etc/passwd
```

Il serait donc dangereux de construire directement un chemin à partir d'un nom fourni par l'utilisateur :

```php
$chemin = $repertoire . '/' . $nomFichier;
```

sans effectuer de contrôle préalable.

## 7.1. Une première protection insuffisante

Une première approche pourrait consister à rechercher les séparateurs de chemin :

```php
if (preg_match('#[\/\\\\]#', $nomFichier)) {
    // Nom interdit
}
```

Cette vérification permet effectivement de détecter `/` et `\`, mais elle ne constitue pas à elle seule une protection suffisamment robuste.

Il ne faut pas simplement rechercher quelques caractères interdits : il faut vérifier que la valeur reçue correspond bien à **un nom de fichier et non à un chemin**.

## 7.2. Protection utilisée par `FileManager`

La méthode `nomSecurise()` applique plusieurs contrôles complémentaires :

```php
return $nom !== ''
    && $nom !== '.'
    && $nom !== '..'
    && !preg_match('/[\/\\\\:\x00-\x1F]/', $nom)
    && basename($nom) === $nom;
```

Elle vérifie notamment :

- que le nom n'est pas vide ;
- qu'il n'est pas égal à `.` ;
- qu'il n'est pas égal à `..` ;
- qu'il ne contient pas `/` ;
- qu'il ne contient pas `\` ;
- qu'il ne contient pas `:` ;
- qu'il ne contient pas de caractère de contrôle ;
- que `basename($nom)` correspond exactement au nom fourni.

Cette dernière vérification est particulièrement importante : elle permet de s'assurer que la valeur fournie est bien un nom simple et non un chemin.

La protection repose donc sur une **validation positive de la structure du nom**, plutôt que sur la seule recherche de quelques caractères interdits.

# 8. Le script `index.js`

Le fichier `index.js` assure l'interactivité de l'interface et déclenche les opérations d'ajout et de suppression.

Le fichier sélectionné par l'utilisateur est conservé dans une variable globale :

```javascript
let leFichier = null;
```

## 8.1. Sélection du fichier

Le fichier peut être sélectionné à l'aide du bouton de sélection ou par glisser-déposer dans la zone prévue à cet effet.

La fonction :

```javascript
controlerFichier(file)
```

contrôle le fichier sélectionné en utilisant la fonction `fichierValide()` de la bibliothèque `controle.js`.

Elle met ensuite à jour :

- la variable globale `leFichier` ;
- l'affichage du nom du fichier dans la balise `nomFichier`.
## 8.2. Affichage de la liste

La fonction :

```javascript
afficher()
```

met à jour le contenu du `tbody` du tableau.

Elle utilise le template défini dans `index.html` afin de générer les lignes correspondant aux documents disponibles.

## 8.3. Ajout d'un fichier

La fonction :

```javascript
ajouter()
```

déclenche l'appel vers :

```text
ajax/ajouter.php
```

Le contrôleur effectue alors les vérifications nécessaires, valide le fichier, le copie dans le répertoire de stockage et retourne la liste mise à jour des documents.

Le transfert du fichier nécessite l'utilisation d'un objet `FormData`, car celui-ci permet de transmettre un objet `File` dans une requête HTTP :

```javascript
const formData = new FormData();
formData.append('fichier', leFichier);
```

L'appel AJAX est réalisé à l'aide de la fonction :

```javascript
appelAjax()
```

qui centralise notamment la gestion des erreurs.

## 8.4. Suppression d'un fichier

La fonction :

```javascript
supprimer(nomFichier)
```

déclenche un appel vers :

```text
ajax/supprimer.php
```

Le contrôleur vérifie la demande, demande à `FileManager` de supprimer le fichier et retourne, en cas de succès, la liste actualisée des documents.

L'interface est alors rafraîchie à partir de cette nouvelle liste.