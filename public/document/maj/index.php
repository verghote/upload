<?php
declare(strict_types=1);

use ClasseMetier\Document;
use ClasseTechnique\Config;
use ClasseTechnique\Page;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";


// alimentation et affichage de l'interface
$page = new Page();
$page->setTitre("Modification des documents")
    ->setDonnee('lesDocuments', Document::getAll())
    ->setDonnee('lesParametres', Config::chargerPhp('document'))
    ->avecJeton()
    ->afficher();