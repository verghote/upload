<?php
declare(strict_types=1);

use ClasseMetier\Club;
use ClasseTechnique\FileManager;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

// Chargement automatique des classes
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX POST sécurisé
Requete::exigerPost();

// Récupération des données transmises
$id = Requete::postString('primaryKey');

// Recherche du club dans la base de données pour obtenir le nom du logo associé
$leClub = Club::getById($id);
if ($leClub === null) {
    ReponseJson::envoyerErreur("Le club demandé n'existe pas.");
}

$nomLogo = $leClub['logo'];

// Création de l'objet métier
$club = new Club();

// Suppression du club dans la base de données
$club->delete($id);

// Suppression du logo associé au club s'il existe
if ($nomLogo !== null) {
    // création d'un objet FileManager pour gérer les fichiers photo
    $fileManager = new FileManager(DOSSIER_CLUB);

    // Vérification de l'existence du fichier avant de tenter de le supprimer
    if (!$fileManager->existe($nomLogo)) {
        ReponseJson::envoyerMessage("Le club a été supprimé, mais le logo associé n'a pas été trouvé sur le disque.");
    }

    // Tentative de suppression du fichier photo
    if (!$fileManager->supprimer($nomLogo)) {
        ReponseJson::envoyerMessage("Le club a été supprimé de la base de données, mais le logo n'a pas pu être retiré du disque.");
    }
}

ReponseJson::envoyerMessage("Le club a été supprimé.");
