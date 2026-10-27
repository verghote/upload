<?php
declare(strict_types=1);

use ClasseMetier\Document;
use ClasseTechnique\FileManager;
use ClasseTechnique\InputFile;
use ClasseTechnique\Config;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

// Chargement automatique des classes
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST sécurisé par un jeton
Requete::exigerPost();

// récupération des paramètres transmis
$titre = Requete::postString('titre');
$fichier = Requete::getFile('fichier');

// Vérification de la présence du fichier
if (!$fichier) {
    throw new UserException("Aucun fichier n'a été transmis.");
}

// Instanciation et paramétrage de l'objet InputFile
$lesParametres = Config::chargerPhp('pdf');
$inputFile = new InputFile($fichier, $lesParametres);

// Validation du fichier
if (!$inputFile->checkValidity()) {
    $message = $inputFile->getValidationMessage() ?: "Le fichier n'est pas valide.";
    throw new UserException($message);
}

// Instanciation du FileManager avec le répertoire défini par la constante globale
$fileManager = new FileManager(DOSSIER_DOCUMENT, $lesParametres);

// Enregistrement du fichier (renommé si nécessaire selon la configuration)
$nomUnique = $fileManager->copier($fichier['tmp_name'], $inputFile->getValue());

try {
    // Instanciation d'un objet métier Document
    $document = new Document();

    // Ajout du document dans la base de données avec le titre et le nom unique du fichier
    $document->add(['titre' => $titre, 'fichier' => $nomUnique]);
} catch (\Throwable $e) {
    // Nettoyage du fichier orphelin sur le disque puis relance pour Erreur::installerGestionnaire()
    $fileManager->supprimer($nomUnique);
    throw $e;
}

ReponseJson::envoyerMessage("Document ajouté avec succès.");