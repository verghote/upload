# Étude du téléversement de fichiers

Il s'agit d'étudier le téléversement d'un fichier dans une application.  
Ce travail nécessite un contrôle très fin, car c'est bien souvent un point d'entrée utilisé par les pirates.

En fonction du type de fichier (document pdf, image), les contrôles peuvent être différents.

L'utilisation des classes InputFile et InputFileImg (classe dérivée de InputFile) vont permettre de simplifier la mise en oeuvre des contrôles et du téléversement

Les paramètres devant s'appliquer sur les fichiers téléversés sont définis dans des fichiers de configuration stockés dans le répertoire .config ou dans le répertoire classemetier si le téléversement est associé à un enregistrement d'une table, par exemple la photo d'un membre, le fichier pdf associé à une information.

L'activité propose 6 interfaces :

* Gestion d'un répertoire contenant des fichiers au format PDF
* Gestion d'un répertoire contenant des fichiers images
* Gestion des enregistrements de la table document avec possibilité de remplacer le fichier PDF associé
* Ajout d'un enregistrement dans la table document avec téléversement d'un fichier PDF associé
* Gestion des étudiants et de leur photo
* Ajout d'un étudiant avec sa photo

Pour cloner ce référentiel sans oublier les sous-modules, utiliser la commande suivante :

```bash
  git clone add https://github.com/verghote/upload.git --recurse-submodules
```

Pour automatiser le clonage du référentiel et l'ajout du repertoire vendor utilise le script uplaod.ps1