<?php
declare(strict_types=1);

use ClasseMetier\Club;
use ClasseTechnique\Page;

// Activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";

// Récupération des clubs
$lesClubs = Club::getAll();

// Alimentation et affichage de l'interface
$page = new Page();
$page->setTitre("Modification des clubs")
    ->setDonnee('lesClubs', $lesClubs)
    ->avecJeton()
    ->afficher();