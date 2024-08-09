<?php
// définition du jeu de caractères
header('Content-type: text/html; charset=utf-8');

// initialisation du fuseau horaire
date_default_timezone_set('Europe/Paris');

// accès aux variables de session
session_start();

// Définition d'une constante indiquant la racine du site
define('RACINE', $_SERVER['DOCUMENT_ROOT']);

spl_autoload_register(function ($name) {
    $name = strtolower($name);

    // Recherche dans le répertoire classetechnique
    $fichier = RACINE . "/classetechnique/$name.php";
    if (file_exists($fichier)) {
        require $fichier;
        return;
    }

    // Recherche dans le répertoire classemetier
    $fichier = RACINE . "/classemetier/$name.php";
    if (file_exists($fichier)) {
        require $fichier;
        return;
    }

    // Si la classe n'est trouvée nulle part
    Erreur::envoyerReponse("Impossible de charger la classe $name", 'global');
});