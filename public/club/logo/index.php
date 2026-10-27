<?php

declare(strict_types=1);

use ClasseMetier\Club;
use ClasseTechnique\Config;
use ClasseTechnique\Page;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";

// Récupération des clubs via ClasseMetier\Club
$lesClubs = Club::getAll();

// Chargement des paramètres d'upload du club
$lesParametres = Config::chargerPhp('club');

// Alimentation et affichage de l'interface
$page = new Page();
$page->setTitre("Changement de logo")
    ->setDonnee('lesClubs', $lesClubs)
    ->setDonnee('lesParametres', $lesParametres)
    ->setDonnee('repertoire', substr(DOSSIER_CLUB, strlen(DOSSIER_WWW)))
    ->avecJeton()
    ->afficher();