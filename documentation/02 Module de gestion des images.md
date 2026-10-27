# 1. Présentation du module

Ce module permet de gérer un ensemble de fichiers image.

Les images sont stockées dans le répertoire : data/image

Le module propose une interface unique permettant :
- de consulter les images sous forme de cadres ;
- d'ajouter une image ;
- de supprimer une image.

Lors du téléversement, le nom d'origine de l'image est conservé après normalisation par `InputFile`. En cas de doublon, un suffixe numérique est automatiquement ajouté afin de générer un nom unique.

Par exemple :

```text
photo.jpg
photo(1).jpg
photo(2).jpg
```

Les dimensions des images sont également contrôlées. Selon la configuration, une image peut être refusée si ses dimensions dépassent les valeurs autorisées ou être automatiquement redimensionnée lors de son stockage.

Les fichiers constituant le module sont regroupés dans :

```text
uploadimage/
```

Le fonctionnement général du module est très proche de celui du module de gestion des documents PDF.

La principale différence repose sur l'utilisation de deux classes spécialisées :

- `InputFileImg` à la place de `InputFile` ;
- `ImageManager` à la place de `FileManager`.

Les contrôleurs AJAX `ajax/ajouter.php` et `ajax/supprimer.php` retournent également la liste actualisée des fichiers après chaque opération. Cela permet à l'interface de prendre en compte les éventuels ajouts ou suppressions effectués entre-temps par d'autres utilisateurs.

# 2. La classe technique `InputFileImg`

`InputFileImg` est une classe spécialisée qui dérive de `InputFile`.

Elle reprend donc l'ensemble des contrôles effectués par `InputFile` et y ajoute les contrôles propres aux images.

Elle permet notamment de gérer :
- la largeur de l'image ;
- la hauteur de l'image ;
- les dimensions maximales autorisées ;
- le redimensionnement automatique de l'image.

Le traitement du redimensionnement nécessite l'installation du composant :

```text
gumlet/php-image-resize
```

via Composer.

## 2.1. Validation spécifique aux images

`InputFileImg` surcharge la méthode :

```php
validationSpecifique()
```

Cette méthode est automatiquement appelée par :

```php
checkValidity()
```

Elle vérifie tout d'abord que le fichier reçu correspond bien à une image valide.

Elle récupère ensuite ses dimensions afin de vérifier qu'elles respectent les limites configurées.

La logique dépend du paramètre `resized`.

### Lorsque `resized` vaut `false`

L'image n'est pas destinée à être redimensionnée lors de son stockage.

Les dimensions de l'image sont donc contrôlées par rapport aux valeurs maximales configurées :

- si `maxWidth` vaut `0`, aucune limite de largeur n'est appliquée ;
- si `maxHeight` vaut `0`, aucune limite de hauteur n'est appliquée ;
- si les deux valeurs valent `0`, aucune limite de dimension n'est appliquée.

Une image dépassant une dimension maximale configurée est alors refusée.
### Lorsque `resized` vaut `true`

L'image est destinée à être redimensionnée lors de sa copie par `ImageManager`.

La validation ne refuse donc pas l'image uniquement parce que ses dimensions dépassent les valeurs configurées : le redimensionnement sera effectué ultérieurement lors du stockage.

La responsabilité est ainsi répartie entre les deux classes :

```text
InputFileImg
    ↓
Vérifie que le fichier est une image valide
    ↓
Contrôle les dimensions lorsque nécessaire
```

puis :

```text
ImageManager
    ↓
Redimensionne l'image lors de son stockage
```

# 3. La classe technique `ImageManager`

`ImageManager` est une classe spécialisée qui dérive de `FileManager`.

Elle reprend donc les fonctionnalités générales de gestion des fichiers de `FileManager` et y ajoute les traitements spécifiques aux images.

Elle permet notamment de :

- gérer un répertoire de stockage d'images ;
- gérer les conflits de noms ;
- copier une image ;
- redimensionner une image avant son stockage ;
- conserver les dimensions lorsqu'aucun redimensionnement n'est nécessaire.

Le redimensionnement est effectué à l'aide du composant :

```text
gumlet/php-image-resize
```

## 3.1. Fonctionnement du redimensionnement

Lorsque le redimensionnement est activé et qu'au moins une dimension maximale est définie, `ImageManager` adapte l'image avant de l'enregistrer.

Les trois situations suivantes sont prises en charge :

- seule la largeur maximale est définie : l'image est redimensionnée afin de respecter cette largeur ;
- seule la hauteur maximale est définie : l'image est redimensionnée afin de respecter cette hauteur ;
- les deux dimensions sont définies : l'image est redimensionnée afin de respecter au mieux les deux limites, tout en conservant ses proportions.

Lorsque `maxWidth` et `maxHeight` valent tous les deux `0`, aucune contrainte de dimension n'est appliquée et l'image est simplement copiée.

Ainsi, une valeur `0` signifie **qu'aucune limite n'est définie pour cette dimension**.


# 4. Le fichier de configuration `config/image.php`

Le comportement du module est défini à partir du fichier de configuration :

```text
config/image.php
```

Dans l'application, le redimensionnement des images est activé.

La largeur maximale est fixée à :

```text
350 px
```

Aucune limite de hauteur spécifique n'est imposée lorsque la configuration ne définit pas de hauteur maximale.

Le paramètre de gestion des doublons est également activé.

Ainsi, lorsqu'une image portant le même nom existe déjà, un suffixe numérique est ajouté automatiquement :

```text
photo.jpg
photo(1).jpg
photo(2).jpg
```

Le fichier de configuration permet donc de centraliser les règles applicables au téléversement et au stockage des images.

# 5. Le fichier `index.html`

Le fichier `index.html` constitue l'interface utilisateur du module.

Les images disponibles sont présentées sous forme de cadres.

Chaque cadre permet notamment d'afficher l'image et de proposer une action de suppression.

## 5.1. Suppression d'une image

La croix associée à une image permet de demander sa suppression.

Une confirmation est demandée avant l'exécution effective de l'opération.

La suppression est ensuite réalisée par le contrôleur AJAX correspondant.

## 5.2. Zone de téléversement

La zone d'ajout permet à l'utilisateur de sélectionner une image.

Le fichier peut également être sélectionné par glisser-déposer.

Le style de cette zone, notamment son affichage en pointillés sur fond orange, est défini dans la feuille de style du module.

# 6. Le script `index.php`

Le script `index.php` prépare les données nécessaires à l'affichage de l'interface.

Il récupère notamment :

- les paramètres de configuration du téléversement ;
- le répertoire de stockage ;
- la liste des fichiers image présents dans le répertoire.

La liste des fichiers est récupérée à l'aide d'un objet `FileManager`.

# 7. Le script `ajax/ajouter.php`

Le script `ajax/ajouter.php` traite les demandes d'ajout d'une image.

Il réalise notamment les opérations suivantes :

1. Vérification de l'utilisation de la méthode HTTP `POST`.
2. Vérification de la présence et de la validité du jeton de sécurité.
3. Vérification de la présence du fichier dans `$_FILES['fichier']`.
4. Récupération des paramètres de configuration.
5. Instanciation d'un objet `InputFileImg`.
6. Validation de l'image reçue.
7. Instanciation d'un objet `ImageManager`.
8. Copie et, si nécessaire, redimensionnement de l'image.
9. Récupération de la liste actualisée des images.
10. Retour de cette liste au client.

Le traitement peut être résumé ainsi :

```text
Image envoyée
      ↓
InputFileImg
      ↓
Validation du fichier et de l'image
      ↓
ImageManager
      ↓
Redimensionnement éventuel
      ↓
Stockage de l'image
      ↓
Liste des images mise à jour
```

## Test du contrôleur

Le contrôleur peut être testé indépendamment de l'interface à l'aide d'**Insomnia**.

Il convient notamment de tester :

- une requête sans jeton ;
- un jeton invalide ;
- une requête sans fichier ;
- un fichier trop volumineux ;
- une extension non autorisée ;
- un fichier qui n'est pas une image ;
- une image dont les dimensions dépassent les limites lorsque `resized` est désactivé ;
- une image dont les dimensions dépassent les limites lorsque `resized` est activé ;
- l'ajout d'une image portant un nom déjà utilisé.
    

# 8. Le script `ajax/supprimer.php`

Le script `ajax/supprimer.php` traite les demandes de suppression d'une image.

Il réalise notamment les opérations suivantes :

1. Vérification de l'utilisation de la méthode HTTP `POST`.
2. Vérification de la présence et de la validité du jeton de sécurité.
3. Vérification de la transmission du nom du fichier à supprimer.
4. Récupération des paramètres nécessaires.
5. Instanciation d'un gestionnaire de fichiers.
6. Suppression sécurisée de l'image.
7. Récupération de la liste actualisée des images.
8. Retour de cette liste au client.

La suppression est effectuée par `FileManager`, qui vérifie notamment que le nom fourni ne peut pas être utilisé pour accéder à un fichier situé en dehors du répertoire de stockage.

## Test du contrôleur

Le contrôleur peut être testé avec **Insomnia**.

Il convient notamment de tester :

- une méthode HTTP incorrecte ;
- une requête sans jeton ;
- un jeton invalide ;
- une demande sans nom de fichier ;
- un fichier inexistant ;
- un nom de fichier valide ;
- une tentative de traversée de répertoire.

# 9. Le script `index.js`

Le fichier `index.js` assure l'interactivité de l'interface et déclenche les opérations d'ajout et de suppression.

Une différence importante avec la version précédente concerne la gestion du fichier sélectionné.

Dans le module précédent, le fichier était conservé dans une variable globale avant que l'utilisateur ne déclenche manuellement l'ajout.

Dans cette version, le fichier est contrôlé immédiatement après sa sélection.

Il n'est donc plus nécessaire de conserver le fichier dans une variable globale.

Le glisser-déposer reste également disponible.

## 9.1. Contrôle du fichier

La fonction :

```javascript
controlerFichier(file)
```

est appelée lorsqu'un fichier est sélectionné.

Elle utilise tout d'abord :

```javascript
fichierValide()
```

afin de vérifier les caractéristiques générales du fichier, notamment sa taille et son extension.

Elle appelle ensuite :

```javascript
verifierImage()
```

afin de vérifier :

- que le fichier est bien une image ;
    
- que ses dimensions respectent les paramètres configurés, lorsque l'image n'est pas destinée à être redimensionnée.
    

La vérification de l'image est asynchrone car le navigateur doit charger le fichier en mémoire afin de pouvoir en déterminer les dimensions.

Lorsque toutes les vérifications sont réussies, la fonction de rappel est exécutée :

```javascript
() => ajouter(file)
```

L'image est alors immédiatement transmise au contrôleur `ajax/ajouter.php`.

Le traitement peut être résumé ainsi :

```text
Sélection de l'image
        ↓
controlerFichier(file)
        ↓
fichierValide()
        ↓
verifierImage()
        ↓
Contrôles réussis
        ↓
ajouter(file)
        ↓
ajax/ajouter.php
```

## 9.2. Ajout de l'image

La fonction :

```javascript
ajouter(file)
```

transmet l'image au contrôleur :

```text
ajax/ajouter.php
```

Le transfert est réalisé à l'aide d'un objet `FormData`, indispensable pour transmettre l'objet `File` au serveur.

Le contrôleur effectue ensuite ses propres contrôles côté serveur avant de confier le stockage à `ImageManager`.

Les contrôles réalisés côté JavaScript ne remplacent donc pas les contrôles côté serveur. Ils permettent principalement d'améliorer l'expérience utilisateur en détectant rapidement les fichiers invalides.

## 9.3. Mise à jour de l'affichage

Après un ajout ou une suppression, le serveur retourne la liste actualisée des images.

L'interface utilise cette liste pour reconstruire l'affichage.

Cette méthode permet également de prendre en compte les modifications effectuées par d'autres utilisateurs entre deux opérations.

# 10. Tests fonctionnels

Une fois le module développé, il convient de réaliser les tests fonctionnels de l'application.

Les tests doivent notamment vérifier les situations suivantes.

### Ajout d'une image

- sélectionner une image valide ;
- sélectionner une image trop volumineuse ;
- sélectionner un fichier ayant une extension interdite ;
- sélectionner un fichier qui n'est pas une image ;
- sélectionner une image dont les dimensions dépassent les limites lorsque le redimensionnement est désactivé ;
- sélectionner une image dont les dimensions dépassent les limites lorsque le redimensionnement est activé ;
- vérifier que l'image est correctement redimensionnée ;
- vérifier que les proportions de l'image sont conservées ;
- ajouter deux images portant le même nom et vérifier l'ajout du suffixe.

### Glisser-déposer

- déposer une image valide ;
- déposer un fichier non autorisé ;
- déposer une image dont les dimensions sont incorrectes ;
- vérifier que les messages d'erreur sont correctement affichés.
### Suppression

- supprimer une image existante ;
- annuler la confirmation de suppression ;
- tenter de supprimer une image inexistante ;
- vérifier que la liste affichée est correctement actualisée.

### Tests multi-utilisateurs

Il convient enfin de vérifier que la liste des images est correctement actualisée après l'ajout ou la suppression d'une image par un autre utilisateur.

Le retour de la liste des fichiers par les contrôleurs `ajax/ajouter.php` et `ajax/supprimer.php` permet précisément de maintenir l'interface synchronisée avec le contenu réel du répertoire de stockage.