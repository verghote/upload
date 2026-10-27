<?php
declare(strict_types=1);

use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;
use ClasseTechnique\InputFile;
use ClasseTechnique\FileManager;
use ClasseTechnique\Config;

// Chargement automatique des classes et des constantes (DOSSIER_PDF)
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST
Requete::exigerPost();

// Récupération du fichier téléversé
$fichier = Requete::getFile('fichier');
if (!$fichier) {
    ReponseJson::envoyerErreur("Aucun fichier n'a été transmis.");
}

// Récupération des paramètres de configuration
$lesParametres = Config::chargerPhp('pdf');

// Vérification du fichier
$inputFile = new InputFile($fichier, $lesParametres);
if (!$inputFile->checkValidity()) {
    ReponseJson::envoyerErreur($inputFile->getValidationMessage());
}

// Copie du fichier
$fileManager = new FileManager(DOSSIER_PDF, $lesParametres);
$fileManager->copier($fichier['tmp_name'], $inputFile->getValue());

// Envoi de la liste à jour des fichiers PDF
ReponseJson::envoyerLesDonnees($fileManager->getLesFichiers());