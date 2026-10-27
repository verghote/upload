<?php

declare(strict_types=1);

use ClasseTechnique\Config;
use ClasseTechnique\FileManager;
use ClasseTechnique\Page;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";

// Instanciation d'un objet FileManager afin de récupérer les fichiers PDF contenu dans le dossier data/pdf
$fileManager = new FileManager(DOSSIER_PDF);

// Alimentation et affichage de l'interface
$page = new Page();

$page->setTitre("Téléversement d'un classement PDF")
    ->setDonnee('lesFichiers', $fileManager->getLesFichiers())
    ->setDonnee('lesParametres', Config::chargerPhp('pdf'))
    ->setDonnee('repertoire', substr(DOSSIER_PDF, strlen(DOSSIER_WWW)))
    ->avecJeton()
    ->afficher();