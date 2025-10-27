<?php
// Contrôle de l'existence du paramètre attendu : id
if (!isset($_POST['id'])) {
    Erreur::envoyerReponse("Paramètre manquant", 'global');
}

$id = $_POST['id'];

// vérification de l'existence du club
$ligne = Club::getById($id);
if (!$ligne) {
    Erreur::envoyerReponse("Ce club n'existe pas", 'global');
}

// suppression de l'enregistrement en base de données
Club::supprimer($id);

// suppression du fichier image associé
if (!empty($ligne['logo'])) {
    Club::supprimerFichier($ligne['logo']);
}

$reponse = ['success' => "Le Club a été supprimé"];
echo json_encode($reponse, JSON_UNESCAPED_UNICODE);
