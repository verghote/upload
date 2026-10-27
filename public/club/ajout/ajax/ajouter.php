<?php

declare(strict_types=1);

use ClasseMetier\Club;
use ClasseTechnique\Config;
use ClasseTechnique\FileManager;
use ClasseTechnique\InputFileImg;
use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

// Chargement automatique des classes
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST sécurisé par un jeton
Requete::exigerPost();

// Récupération des données textuelles du club
$data = [
    'id' => Requete::postString('id'),
    'nom' => Requete::postString('nom'),
    'logo' => null
];

// Traitement du logo (facultatif)
if (Requete::fichierEnvoye('fichier')) {
    $fichier = Requete::getFile('fichier');
    $lesParametres = Config::chargerPhp('club');
    $inputFileImg = new InputFileImg($fichier, $lesParametres);

    if (!$inputFileImg->checkValidity()) {
        ReponseJson::envoyerErreur($inputFileImg->getValidationMessage());
    }

    $fileManager = new FileManager(DOSSIER_CLUB, $lesParametres);

    // Sauvegarde physique de l'image (le nom retourné est celui réellement utilisé)
    $nomUnique = $fileManager->copier($fichier['tmp_name'], $inputFileImg->getValue());
    $data['logo'] = $nomUnique;
}

// Instanciation de l'objet métier
$club = new Club();

try {
    // Ajout du club en BDD (les erreurs SQL/contraintes lèvent une exception)
    $club->add($data);
} catch (\Throwable $e) {
    // Si la BDD échoue et qu'un logo avait été copié, on nettoie le disque
    if (isset($nomUnique)) {
        $fileManager->supprimer($nomUnique);
    }
    // Relance pour prise en charge par Erreur::installerGestionnaire()
    throw $e;
}

ReponseJson::envoyerMessage("Le club a été ajouté avec succès.");