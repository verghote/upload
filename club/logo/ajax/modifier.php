<?php
// contrôle de la présence du fichier transmis
if (!isset($_FILES['fichier'])) {
    Erreur::envoyerReponse("Le nouveau logo du club n'est pas transmis", 'global');
}

// instanciation et paramétrage d'un objet InputFile
$file = new InputFileImg($_FILES['fichier'], Club::getConfig());

// vérifie la validité du fichier
if (!$file->checkValidity()) {
    Erreur::envoyerReponse($file->getValidationMessage(), 'global');
}

// vérification du paramètre id :
if (!isset($_POST['id']) || empty($_POST['id'])) {
    Erreur::afficherReponse("L'identifiant du club concerné n'est pas transmis", 'global');
}

// récupération de l'identifiant du club
$id = $_POST['id'];

// contrôle de la validité du paramètre
if (!preg_match('/^080[0-9]{3}$/', $id)) {
    Erreur::bloquerVisiteur();
}

// vérifier l'existence du club
$club = Club::getById($id);

if (!$club) {
    Erreur::traiterReponse("Ce club n'existe pas", 'global');
}

// copier le nouveau logo
$ok = $file->copy();
if (!$ok) {
    Erreur::envoyerReponse("Le téléversement du nouveau logo a échoué", 'global');
}

// supprimer l'ancien logo s'il existe et si son nom est différent de celui du nouveau logo
if (!empty($club['logo']) && $club['logo'] !== $file->Value) {
    Club::supprimerFichier($club['logo']);
}

// mettre à jour le champ logo de l'enregistrement
Club::majLogo($id, $file->Value);
echo json_encode(['success' => 'Le logo a été enregistré']);
