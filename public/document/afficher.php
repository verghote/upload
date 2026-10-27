<?php
declare(strict_types=1);

use ClasseMetier\Document;
use ClasseTechnique\Requete;
use ClasseTechnique\UserException;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";

// Lecture et validation du paramètre GET.
// Une UserException sera levée automatiquement si le paramètre est absent
// ou n'est pas un entier.
$id = Requete::getInt('id');

// Recherche du document.
$document = Document::getById($id);

if ($document === null) {
    throw new UserException("Le document n'existe pas.");
}

if (!$document["present"]) {
    throw new UserException("Le document demandé '{$document['titre']}' n'a pas été trouvé.");
}

// Répertoire du document.
$fichier = DOSSIER_DOCUMENT . DIRECTORY_SEPARATOR . $document['fichier'];

// Affichage du PDF.
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . $document['fichier'] . '"');
header('Content-Length: ' . filesize($fichier));

readfile($fichier);
exit;