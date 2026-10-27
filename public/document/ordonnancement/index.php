<?php
declare(strict_types=1);

use ClasseMetier\Document;
use ClasseTechnique\Page;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";

// récupération des documents
$lesDocuments = Document::getAll();

// alimentation et affichage de l'interface
$page = new Page();
$page->setTitre("Ordonner les documents")
    ->setDonnee('lesDocuments', $lesDocuments)
    ->avecJeton()
    ->afficher();