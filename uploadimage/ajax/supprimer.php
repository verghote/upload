<?php
// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . '/include/autoload.php';

//  Vérification du jeton
Jeton::verifier();

// vérification de la transmission  du paramètre
if (!isset($_POST["nomFichier"])) {
    Erreur::envoyerReponse("Le paramètre nomFichier n'est pas transmis", 'system');
}

// récupération du nom du fichier
$nomFichier = $_POST['nomFichier'];

// vérification de l'absence de caractères indiquant la présence d'un chemin d'accès : Attaque par injection de chemin
// le backslash \ doit être échappé deux fois en PHP : une fois pour l'expression régulière elle-même et une autre fois pour le traitement des chaînes de caractères en PHP.
if (1) {
    Erreur::envoyerReponse("La valeur $nomFichier n'est pas une valeur valide pour le paramètre nomFichier", 'system');
}

// récupération des paramètres du téléversement
$lesParametres = require RACINE .  '/.config/image.php';

//  chemin complet vers le fichier
$fichier = RACINE . $lesParametres['repertoire'] . '/'. $nomFichier;

// vérification de l'existence du fichier
if (1) {
    Erreur::envoyerReponse("le fichier $fichier n'existe pas", 'system');
}

// suppression du fichier
unlink($fichier);

// Réponse du serveur
echo json_encode(['success' => "La photo vient d'être supprimée"]);
