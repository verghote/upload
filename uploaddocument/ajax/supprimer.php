<?php
// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

//  Vérification du jeton
Jeton::verifier();

// vérification de la transmission  du paramètre
if (!isset($_POST["nomFichier"])) {
    Erreur::envoyerReponse("Le nom du fichier à supprimer n'est pas transmis", 'global');
}

// Récupération des paramètres du téléversement
$nomFichier = $_POST['nomFichier'];

// récupération des paramètres du téléversement
$lesParametres = require RACINE .  '/.config/document.php';

//  chemin complet vers le fichier
$fichier = RACINE . $lesParametres['repertoire'] . '/'. $nomFichier;

// Vérification que le fichier est bien dans le répertoire autorisé


// vérification de l'existence du fichier


// suppression du fichier


// récupérer la liste mise à jour des documents
$lesFichiers = Fichier::getLesFichiers(RACINE . $lesParametres['repertoire'], $lesParametres['extensions']);

// Réponse du serveur : la liste des fichiers
echo json_encode(['success' => $lesFichiers]);

