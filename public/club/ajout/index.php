<?php
declare(strict_types=1);

use ClasseTechnique\Config;
use ClasseTechnique\Page;

/** @noinspection PhpIncludeInspection */
require $_SERVER['DOCUMENT_ROOT'] . "/../bootstrap/bootstrap.php";

// Chargement des paramètres d'upload
$lesParametres = Config::chargerPhp('club');

// Alimentation et affichage de l'interface
$page = new Page();
$page->setTitre("Nouveau club")
    ->setDonnee('lesParametres', $lesParametres)
    ->avecJeton()
    ->afficher();