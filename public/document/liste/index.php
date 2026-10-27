<?php
declare(strict_types=1);

use ClasseMetier\Document;
use ClasseTechnique\Config;
use ClasseTechnique\Page;

// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";


// alimentation et affichage de l'interface
$page = new Page();
$page->setTitre("Liste des documents")
    ->setDonnee('lesDocuments',Document::getAll())
    ->setDonnee('repertoire', substr(DOSSIER_DOCUMENT, strlen(DOSSIER_WWW)))
    ->avecJeton()
    ->afficher();