<?php
declare(strict_types=1);

use ClasseTechnique\Config;
use ClasseTechnique\Erreur;



// ==========================================================
// Initialisation générale
// ==========================================================

date_default_timezone_set('Europe/Paris');


// ==========================================================
// Gestion de session
// ==========================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


// ==========================================================
// Définition des chemins du projet
// ==========================================================

// Répertoire public accessible par le navigateur
define('DOSSIER_WWW', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'public');


// DOSSIER_RACINE complète du projet
define('DOSSIER_RACINE', dirname(DOSSIER_WWW));


// constantes.php pour les dossiers comprenant des resources externes
const DOSSIER_CONFIG    = DOSSIER_RACINE . '/config';
const DOSSIER_PDF       = DOSSIER_WWW . '/data/pdf';
const DOSSIER_DOCUMENT  = DOSSIER_WWW . '/data/document';
const DOSSIER_IMAGE     = DOSSIER_WWW . '/data/image';
const DOSSIER_CLUB      = DOSSIER_WWW . '/data/club';

// ==========================================================
// Chargement automatique des classes
// ==========================================================

require DOSSIER_RACINE . '/vendor/autoload.php';


// ==========================================================
// Gestion globale des erreurs
// ==========================================================

Erreur::installerGestionnaire();


// ==========================================================
// Chargement des contraintes SQL
// ==========================================================

try {

    $contraintes = Config::chargerPhp('contrainte');

    Erreur::definirLesContraintes($contraintes);

} catch (Exception $e) {

    // Pas de contrainte configurée
    // ou configuration absente :
    // on laisse l'application démarrer.
}
