<?php
// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . "/include/autoload.php";

// Vérification du jeton
Jeton::verifier();

// vérification de la transmission des données attendues
if (!Std::existe('table', 'id') ) {
    Erreur::envoyerReponse('Requête invalide', 'system');
}

// récupération des données
$id = $_POST["id"];
$table = $_POST['table'];

// Contrôle sur le nom de la classe
if (! class_exists($table)) {
    Erreur::envoyerReponse("La classe $table n'existe pas.", 'system');
}

// Réalisation de la suppression
$table = new $table();
$table->delete($_POST['id']);

// Réponse du serveur
echo json_encode(['success' => "Opération réalisée avec succès"], JSON_UNESCAPED_UNICODE);
