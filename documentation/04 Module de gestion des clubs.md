# 1. Présentation du module

Ce module permet de gérer des clubs d'athlétisme. Chaque club est décrit par un enregistrement de la table `club` et possède éventuellement un **logo**, stocké sous forme de fichier image.

| Colonne | Rôle                                                                  |
|---------|-----------------------------------------------------------------------|
| `id`    | Code du club : 6 caractères, `080` suivi de 3 chiffres (clé primaire) |
| `nom`   | Nom du club (unique, 3 à 60 caractères)                               |
| `logo`  | Nom du fichier image du logo (facultatif)                             |

Les logos sont stockés dans le répertoire :

```text
public/data/club
```

dont le chemin est défini par la constante `DOSSIER_CLUB` dans `bootstrap/bootstrap.php`.

Le module associe donc :

- la gestion de données en base (comme dans le module `document`) ;
- la gestion de fichiers image (comme dans le module `uploadimage`).

Il propose les pages suivantes :

| Page    | Rôle                                                       |
|---------|------------------------------------------------------------|
| `liste` | Consulter les clubs sous forme de cartes avec leur logo    |
| `ajout` | Ajouter un club avec son logo (facultatif)                 |
| `maj`   | Modifier le nom d'un club ou le supprimer                  |
| `logo`  | Ajouter ou remplacer le logo d'un club                     |

Les fichiers constituant le module sont regroupés dans :

```text
public/club/
├── config/menuhorizontal.json
├── liste/
├── ajout/   (index.*, ajax/ajouter.php)
├── maj/     (index.*, ajax/modifiernom.php, supprimer.php)
└── logo/    (index.*, ajax/majlogo.php)
```

Les paramètres de téléversement sont définis dans :

```text
config/club.php
```

# 2. Le fichier de configuration `config/club.php`

| Paramètre          | Valeur            | Signification                                      |
|--------------------|-------------------|----------------------------------------------------|
| `maxSize`          | 300 Ko            | Taille maximale du fichier                         |
| `maxWidth`         | 350               | Largeur maximale                                   |
| `maxHeight`        | 350               | Hauteur maximale                                   |
| `resized`          | `false`           | Pas de redimensionnement : une image trop grande est **refusée** |
| `lesExtensions`    | `jpg`, `png`      | Extensions autorisées                              |
| `lesTypes`         | `image/jpeg`, `image/png` | Types MIME autorisés                       |
| `renommerSiExiste` | `true`            | Ajout d'un suffixe numérique en cas de doublon     |

Ce fichier est chargé avec `Config::chargerPhp('club')` côté serveur, et transmis au JavaScript pour effectuer les mêmes contrôles côté navigateur.

# 3. Les classes utilisées

## 3.1. La classe métier `Club`

La classe `ClasseMetier\Club` dérive de `Table` et décrit la table `club` :

- `id` : obligatoire, **non modifiable**, motif `^080[0-9]{3}$` ;
- `nom` : obligatoire, modifiable, 3 à 60 caractères, lettres non accentuées, chiffres, espace, `'`, `-` et `.`, espaces superflus supprimés ;
- `logo` : facultatif, modifiable, 100 caractères maximum.

Elle fournit deux méthodes de consultation :

```php
Club::getAll();      // tous les clubs triés par nom
Club::getById($id);  // un club ou null
```

La base de données applique les mêmes règles que la classe métier : contraintes `check` sur le code et le nom, unicité du nom, et un déclencheur (`avantmodificationclub`) qui interdit la modification du code.

## 3.2. Les classes techniques

- `InputFileImg` : valide le fichier reçu et vérifie qu'il s'agit d'une image dont les dimensions respectent la configuration ;
- `FileManager` : gère le stockage physique du fichier (copie, existence, suppression) en contrôlant le nom ;
- `ImageManager` : dérive de `FileManager` et ajoute le redimensionnement lors de la copie d'une image.

Ces classes sont détaillées dans la documentation du module de gestion des images.

# 4. La page `liste`

## 4.1. Le script `liste/index.php`

Il transmet au JavaScript la liste des clubs (`Club::getAll()`) et le chemin web du répertoire des logos, obtenu en retirant `DOSSIER_WWW` de `DOSSIER_CLUB`.

Cette page ne modifie aucune donnée : elle n'utilise donc pas de jeton.

## 4.2. Le fichier `liste/index.js`

Pour chaque club, le script clone le template `carteClubTemplate` et renseigne :

- le nom du club dans l'entête de la carte (propriété `innerText`, ce qui évite toute interprétation HTML) ;
- le logo : l'adresse de l'image est `repertoire + '/' + club.logo`.

Deux situations sont gérées :

- le club n'a pas de logo : la balise `img` est supprimée de la carte ;
- le fichier est introuvable sur le serveur : l'évènement `onerror` de l'image supprime la balise, afin de ne pas afficher une image cassée.

# 5. La page `ajout`

## 5.1. Le fichier `ajout/index.html`

Le formulaire contient :

- le champ `id` : code du club, 6 caractères, motif `^080[0-9]{3}$` ;
- le champ `nom` : motif identique à celui de la classe `Club` ;
- une zone `cible` permettant de sélectionner le logo par clic ou par glisser-déposer ;
- un champ `file` masqué (`accept` sur les formats image) ;
- un bouton `btnAjouter`.

## 5.2. Le fichier `ajout/index.js`

Le champ `id` est initialisé avec `080`. La fonction `filtrerLaSaisie()` empêche la saisie de caractères non autorisés dans le champ `nom`.

Le logo est facultatif. Lorsqu'un fichier est sélectionné, `controlerFichier(file)` :

1. vérifie la taille et l'extension avec `fichierValide()` ;
2. vérifie que le fichier est bien une image et respecte les dimensions avec `verifierImage()` ;
3. si tout est correct, mémorise le fichier dans `leFichier` et affiche **un aperçu** de l'image dans la zone cible.

La fonction `ajouter()` construit un `FormData` contenant `id` et `nom`. Le fichier n'est ajouté que s'il a été sélectionné. En cas de succès, l'utilisateur est redirigé vers la liste après confirmation.

## 5.3. Le script `ajout/ajax/ajouter.php`

1. vérification de la méthode `POST` et du jeton ;
2. lecture du code et du nom ; le logo vaut `null` par défaut ;
3. **si un fichier a été envoyé** (`Requete::fichierEnvoye()`) :
    - validation par `InputFileImg` ;
    - copie du fichier avec `FileManager::copier()` ;
    - le nom réellement utilisé est enregistré dans `$data['logo']` ;
4. ajout du club en base de données avec `Club::add()`.

Comme pour les documents, si l'insertion échoue après la copie du logo, le fichier est supprimé pour ne pas laisser de fichier orphelin :

```php
try {
    $club->add($data);
} catch (\Throwable $e) {
    if (isset($nomUnique)) {
        $fileManager->supprimer($nomUnique);
    }
    throw $e;
}
```

Une erreur fréquente est un code de club déjà utilisé : le logo copié est alors correctement retiré.

### Test du contrôleur

Il convient notamment de tester :

- l'absence de jeton ou un jeton invalide ;
- un code invalide (ne commençant pas par `080`, longueur incorrecte) ;
- un nom invalide ou déjà utilisé ;
- un club sans logo ;
- un logo trop volumineux, d'extension interdite, qui n'est pas une image ou dont les dimensions dépassent les limites ;
- un code déjà utilisé avec un logo : vérifier que le fichier n'est pas conservé ;
- deux clubs ayant un logo portant le même nom : vérifier le suffixe `(1)`.

# 6. La page `maj`

La page `maj` permet de modifier le nom d'un club et de le supprimer. Le code n'est affiché qu'à titre d'information : il n'est pas modifiable.

## 6.1. Le fichier `maj/index.js`

Chaque ligne est construite à partir du template `modeleLigneClub`. La fonction `creerLigneClub()` :

- affecte l'identifiant `club<id>` à la ligne, afin de pouvoir la retrouver après suppression ;
- affiche le code et le nom ;
- configure le champ nom (`configurerInputNom`) et le bouton de suppression (`configurerBoutonSuppression`).

Lorsque le nom est modifié, il est converti en majuscules sans accent (`enleverAccent`, `toUpperCase`) puis contrôlé avec `checkValidity()`. S'il est valide, `modifierNom()` appelle le serveur ; sinon le texte passe en rouge.

La suppression demande une confirmation avant l'appel à `ajax/supprimer.php`. En cas de succès, la ligne est retirée du tableau.

## 6.2. Le script `ajax/modifiernom.php`

Il modifie uniquement le champ `nom` avec `Club::modify()`. Si le résultat est `true`, un message est retourné ; sinon la liste des erreurs de validation est envoyée avec `ReponseJson::envoyerLesErreurs()`.

## 6.3. Le script `ajax/supprimer.php`

1. vérification de la méthode `POST` et du jeton ;
2. lecture du code du club ;
3. recherche du club en base pour obtenir le nom du logo ;
4. suppression de l'enregistrement avec `Club::delete()` ;
5. si le club avait un logo, suppression du fichier avec `FileManager::supprimer()`.

Le nom du fichier provient de la base de données, et jamais du navigateur. Si le logo est absent du disque ou ne peut pas être supprimé, un message précise que le club a bien été supprimé mais que le fichier pose problème.

# 7. La page `logo`

Cette page permet d'ajouter ou de remplacer le logo d'un club déjà existant.

## 7.1. Le fichier `logo/index.js`

Les clubs sont présentés sous forme de cartes. Chaque carte contient une zone `cible-logo` qui affiche :

- le logo du club s'il existe ;
- un message « Cliquer pour ajouter un logo » sinon.

Le logo peut être modifié par un clic sur la zone (ouverture du sélecteur de fichier) ou par glisser-déposer. Dans les deux cas, l'identifiant du club est mémorisé dans la variable `idClub`.

La fonction `controlerFichier(file)` vérifie le fichier avec `fichierValide()` puis `verifierImage()` ; en cas de succès, `majLogo(file)` envoie le fichier vers `ajax/majlogo.php`.

Après la réponse du serveur, l'image de la carte est mise à jour avec le nouveau nom du fichier. Le paramètre `?t=<horodatage>` ajouté à l'adresse force le navigateur à ne pas utiliser l'ancienne image mise en cache.

Le nom du fichier est encodé avec `encodeURIComponent()` afin de gérer les espaces ou caractères spéciaux (par exemple `us camon.png`).

Le champ `value` du champ `file` est réinitialisé après chaque sélection afin de pouvoir choisir deux fois de suite le même fichier.

## 7.2. Le script `logo/ajax/majlogo.php`

Le script remplace le logo en conservant la cohérence entre la base et le disque :

1. vérification de la méthode `POST` et du jeton ;
2. lecture du code du club et du fichier ;
3. recherche du club pour vérifier son existence et mémoriser **l'ancien logo** ;
4. validation du nouveau fichier avec `InputFileImg` ;
5. copie du nouveau logo avec `ImageManager::copierImage()` ;
6. mise à jour de la colonne `logo` ;
7. suppression de l'**ancien** logo du disque ;
8. envoi du nom du nouveau logo au navigateur.

L'ordre des opérations est important :

```text
Copie du nouveau logo
        ↓
Mise à jour en base
   ↓ (échec)                ↓ (succès)
Suppression du         Suppression de l'ancien
NOUVEAU logo           logo
```

L'ancien logo n'est supprimé qu'**après** le succès de la mise à jour en base. Si la mise à jour échoue, c'est le nouveau fichier qui est retiré, et le club conserve son ancien logo.

### Test du contrôleur

Il convient notamment de tester :

- l'absence de jeton ou un jeton invalide ;
- un club inexistant ;
- une requête sans fichier ;
- un fichier invalide (taille, extension, dimensions, pas une image) ;
- l'ajout d'un logo à un club qui n'en avait pas ;
- le remplacement d'un logo existant : vérifier que l'ancien fichier est supprimé ;
- un nouveau logo portant le même nom que l'ancien.

# 8. Sécurité

- Toutes les requêtes de modification passent par `Requete::exigerPost()` (méthode `POST` et jeton).
- Le nom du logo supprimé ou remplacé est toujours lu en base de données.
- Le nom du fichier téléversé est normalisé par `InputFile`, puis contrôlé par `FileManager` contre la traversée de répertoire.
- Les contrôles JavaScript améliorent l'expérience utilisateur, mais ne remplacent pas ceux du serveur (`InputFileImg`, classe métier `Club`, contraintes de la base).
- Les noms de clubs sont affichés avec `innerText` ou `textContent`, jamais avec `innerHTML`.

# 9. Points d'attention constatés dans le code

La rédaction de cette documentation a mis en évidence quelques incohérences à corriger :

1. **Paramètre `primaryKey` / `id` dans la page `logo`.** `logo/index.js` envoie le code du club dans le champ `id`, alors que `ajax/majlogo.php` lit `primaryKey`. Les deux noms doivent être identiques, sinon le club n'est pas retrouvé.
2. **Redimensionnement annoncé mais non activé.** `ajout/index.html` indique « Redimensionnement automatique à 350 px », alors que `config/club.php` définit `resized => false` : une image trop grande est refusée. De plus, `ajout/ajax/ajouter.php` utilise `FileManager::copier()` et non `ImageManager::copierImage()`, contrairement à `majlogo.php`. Le texte ou la configuration doit être harmonisé.
3. **Formats annoncés et formats autorisés.** Les pages affichent « JPG, JPEG, PNG, WEBP, AVIF » alors que `config/club.php` n'autorise que `jpg` et `png`. Or certains logos présents dans les données d'exemple sont au format `webp`.
