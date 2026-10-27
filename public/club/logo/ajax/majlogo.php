<?php
declare(strict_types=1);

use ClasseMetier\Club;
use ClasseTechnique\Config;
use ClasseTechnique\ImageManager;
use ClasseTechnique\InputFileImg;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

// Chargement automatique des classes
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX POST sécurisé
Requete::exigerPost();

// Récupération des données de la requête
$id = Requete::postString('primaryKey');
$file = Requete::getFile('fichier');

// Vérification de la présence du fichier
if (!$file) {
    ReponseJson::envoyerErreur("Aucun fichier n'a été transmis.");
}

// Recherche du club pour vérifier son existence et récupérer le logo actuel
$leClub = Club::getById($id);
if ($leClub === null) {
    ReponseJson::envoyerErreur("Ce club n'existe pas.");
}

$ancienLogo = $leClub['logo'];

// Instanciation et validation de l'objet InputFileImg
$lesParametres = Config::chargerPhp('club');
$inputFileImg = new InputFileImg($file, $lesParametres);

if (!$inputFileImg->checkValidity()) {
    ReponseJson::envoyerErreur( $inputFileImg->getValidationMessage());
}

// Instanciation du FileManager
$imageManager = new ImageManager(DOSSIER_CLUB, $lesParametres);

// Sauvegarde physique du nouveau logo (nom unique si la configuration l'impose)
$nouveauLogo = $imageManager->copierImage($inputFileImg, $inputFileImg->getValue());

// Instanciation de l'objet métier
$club = new Club();

try {
    // modify($id, $data) retourne false en cas d'erreur de validation métier
    if (!$club->modify($id, ['logo' => $nouveauLogo])) {
        $imageManager->supprimer($nouveauLogo);
        ReponseJson::envoyerLesErreurs($club->getErrors());
    }
} catch (\Throwable $e) {
    // Si la BDD échoue, nettoyage du NOUVEAU logo créé sur le disque
    $imageManager->supprimer($nouveauLogo);
    throw $e;
}

// Si la BDD est mise à jour avec succès, suppression de l'ancien logo du disque
if ($ancienLogo !== null) {
    $imageManager->supprimer($ancienLogo);
}

// Retour de la réponse JSON
ReponseJson::envoyerLesDonnees(['logo' => $nouveauLogo]);