<?php
declare(strict_types=1);

use ClasseMetier\Document;
use ClasseTechnique\Config;
use ClasseTechnique\FileManager;
use ClasseTechnique\InputFile;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

// Chargement automatique des classes
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST sécurisé par un jeton
Requete::exigerPost();

// récupération des paramètres transmis
$id = Requete::postInt('primaryKey');
$file = Requete::getFile('fichier');

// Vérification de la présence du fichier
if (!$file) {
    ReponseJson::envoyerErreur("Aucun fichier n'a été transmis.");
}

// Recherche du document dans la base de données pour obtenir le nom du fichier associé
$leDocument = Document::getById($id);
if ($leDocument === null) {
    ReponseJson::envoyerErreur("Ce document n'existe pas.");
}

// Instanciation et paramétrage de l'objet InputFile
$lesParametres = Config::chargerPhp('document');
$inputFile = new InputFile($file, $lesParametres);

// Validation du fichier
if (!$inputFile->checkValidity()) {
    ReponseJson::envoyerErreur($inputFile->getValidationMessage() );
}

// Instanciation du FileManager avec le répertoire défini par la constante globale
$fileManager = new FileManager(DOSSIER_DOCUMENT);

// Remplacement du fichier physique sur le disque par le nouveau fichier
$fileManager->remplacer($file['tmp_name'], $leDocument['fichier']);

// Aucun changement au niveau de la base de données, car le nom du fichier reste le même.
// Le document est donc toujours associé au même fichier,
// mais le contenu du fichier a été remplacé par le nouveau fichier transmis.

// Retour des données mises à jour.
ReponseJson::envoyerMessage("Document associé mis à jour.");