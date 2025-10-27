<?php
// Contrôle sur le fichier téléversé
if (!isset($_FILES['fichier'])) {
    Erreur::envoyerReponse("Le fichier n'a pas été transmis", 'global');
}

// instanciation et paramétrage d'un objet InputFile
$file = new InputFile($_FILES['fichier'], FichierPDF::getConfig());
$resultat = FichierPDF::ajouter($file);

if (!$resultat['success']) {
    Erreur::envoyerReponse($resultat['message'], 'global');
}

echo json_encode($resultat['fichiers'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
