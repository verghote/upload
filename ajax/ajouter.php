 <?php
// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . "/include/autoload.php";

// Vérification du jeton
Jeton::verifier();

// Contrôle sur le nom de la classe
if (!isset($_POST['table']) || ! class_exists($_POST['table'])) {
    Erreur::envoyerReponse("La table n'est pas transmise ou n'existe pas.", 'system');
}

// récupération des données
$table = $_POST['table'];

// création d'une instanciation dynamique de classe
$table = new $table();
// Ajout dans la table en vérifiant que tous les champs sont corrects
if (!$table->donneesTransmises()) {
    $reponse = ['error' => $table->getLesErreurs()];
} elseif (!$table->checkAll()) {
    $reponse = ['error' => $table->getLesErreurs()];
} elseif (!$table->insert()) {
    $reponse = ['error' => $table->getLesErreurs()];
} else {
    if($table->getLastInsertId()) {
        $reponse = ['success' => $table->getLastInsertId()];
    } else {
        $reponse = ['success' => "Opération réalisée avec succès"];
    }
}
echo json_encode($reponse, JSON_UNESCAPED_UNICODE);
