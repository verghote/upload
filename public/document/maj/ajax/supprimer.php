<?php
declare(strict_types=1);

use ClasseMetier\Document;
use ClasseTechnique\FileManager;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

// Chargement automatique des classes
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST sécurisé par un jeton
Requete::exigerPost();

// récupération des données transmises
$id = Requete::postInt('primaryKey');

// Recherche du document dans la base de données pour obtenir le nom du fichier associé
$leDocument = Document::getById($id);
if ($leDocument === null) {
    ReponseJson::envoyerErreur("Le document demandé n'existe pas.");
}

$nomFichier = $leDocument['fichier'];

// création de l'objet métier
$document = new Document();

// Suppression du document dans la base de données
$document->delete($id);

// Suppression du fichier physique associé au document

// création d'un objet FileManager pour gérer les fichiers PDF
$fileManager = new FileManager(DOSSIER_DOCUMENT);

// Vérification de l'existence du fichier avant de tenter de le supprimer
if (!$fileManager->existe($nomFichier)) {
    ReponseJson::envoyerMessage("Le document a été supprimé, mais le fichier associé n'a pas été trouvé sur le disque.");
}

// Tentative de suppression du fichier
if (!$fileManager->supprimer($nomFichier)) {
    ReponseJson::envoyerMessage("Le document a été supprimé de la base de données, mais le fichier n'a pas pu être retiré du disque.");
}

ReponseJson::envoyerMessage("Le document a été supprimé.");

