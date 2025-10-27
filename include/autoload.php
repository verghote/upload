<?php
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

    // Récupérer le chemin complet du script actuel
    $chemin = $_SERVER['SCRIPT_FILENAME'];

// Extraire le dernier répertoire du chemin
    $dernierRepertoire = basename(dirname($chemin)); // Récupère le dernier répertoire du chemin

// Vérifier si le dernier répertoire est 'ajax' pour mettre en place la protection CSRF et définir le type de contenu
    if ($dernierRepertoire === 'ajax') {
        // Vérification du jeton CSRF pour les requêtes AJAX
        Jeton::verifier();
        // Tous les scripts dans le répertoire ajax renvoient du JSON
        header('Content-Type: application/json; charset=utf-8');
    } else {
        // Pour les autres pages, créer un jeton CSRF valable pour 10 minutes
        Jeton::creer(600);
        // Tous les autres scripts renvoient du HTML
        header('Content-Type: text/html; charset=utf-8');
    }

    // Recherche dans le répertoire modele
    $fichier = RACINE . "/modele/class.$name.php";
    if (file_exists($fichier)) {
        require $fichier;
        return;
    }

    // Si la classe n'est trouvée nulle part
    Erreur::envoyerReponse("Impossible de charger la classe $name", 'global');
});