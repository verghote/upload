<?php
// vérification de la transmission du paramètre
if (!isset($_POST["nomFichier"])) {
    Erreur::envoyerReponse("Le nom du fichier à supprimer n'est pas transmis", 'global');
}

// récupération du nom du fichier
$nomFichier = $_POST['nomFichier'];

// suppression du fichier
$resultat = FichierPDF::supprimer($nomFichier);

// renvoi de la liste des fichiers PDF ou d'une erreur
if (!$resultat['success']) {
    Erreur::envoyerReponse($resultat['message'], 'global');
}
echo json_encode($resultat['fichiers'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);



