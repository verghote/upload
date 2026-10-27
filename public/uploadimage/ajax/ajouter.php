<?php
declare(strict_types=1);

use ClasseTechnique\Config;
use ClasseTechnique\ImageManager;
use ClasseTechnique\InputFileImg;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

// Chargement automatique des classes et des constantes (DOSSIER_IMAGE)
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST
Requete::exigerPost();

// Récupération du fichier téléversé
$fichier = Requete::getFile('fichier');
if (!$fichier) {
    ReponseJson::envoyerErreur("Aucun fichier n'a été transmis.");
}

// Récupération des paramètres de configuration
$lesParametres = Config::chargerPhp('image');

// Vérification du fichier
$inputFileImg = new InputFileImg($fichier, $lesParametres);
if (!$inputFileImg->checkValidity()) {
    ReponseJson::envoyerErreur($inputFileImg->getValidationMessage());
}

// Copie du fichier
$imageManager = new ImageManager(DOSSIER_IMAGE, $lesParametres);
$imageManager->copierImage($inputFileImg, $inputFileImg->getValue());

// Envoi de la liste à jour des fichiers images
ReponseJson::envoyerLesDonnees($imageManager->getLesFichiers());