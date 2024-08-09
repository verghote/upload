<?php
// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . "/include/autoload.php";

// Vérification du jeton
Jeton::verifier();

// vérification de la transmission des données attendues


// récupération des données ; ne pas encoder avec htmlspecialchar sinon pb avec checkvalidity (' par exemple)
$id = trim($_POST['id']);

// Récupération des paramètres du téléversement

// instanciation et paramétrage d'un objet InputFile


// contrôle de l'objet $file


// remplacement de la photo


// réponse du serveur
echo json_encode(['success' => "La nouvelle photo a été enregistrée"]);

