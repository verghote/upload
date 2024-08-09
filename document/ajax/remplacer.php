<?php
// remplacer le fichier pdf associé à un document

// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . "/include/autoload.php";

// Vérification du jeton
Jeton::verifier();

// contrôle de l'existence des paramètres attendus
if (1) {
    Erreur::envoyerReponse("Paramètre manquant", 'system');
}

// Récupération des paramètres du téléversement
$lesParametres = require RACINE . '/classemetier/configdocument.php';

// instanciation et paramétrage d'un objet InputFile
$file = new InputFile($lesParametres);
$file->Directory = RACINE . $lesParametres['repertoire'];

// ici le fichier existe déjà, il faut passer en mode 'update' pour autoriser son remplacement


// contrôle de l'objet
if ($file->checkValidity()) {
    // copie du fichier

    echo json_encode(['success' => 'Le fichier a été remplacé']);
} else {
    echo json_encode(['error' => $file->getValidationMessage()]);
}