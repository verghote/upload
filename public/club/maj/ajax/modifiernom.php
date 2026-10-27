<?php
declare(strict_types=1);

use ClasseMetier\Club;

use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

// Chargement automatique des classes
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST sécurisé par un jeton
Requete::exigerPost();

// récupération des données transmises
$id = Requete::postString('primaryKey');
$nom = Requete::postString('nom');


// création de l'objet métier
$club = new Club();

// modification du nom du club dans la base de données
$resultat = $club->modify($id, ['nom' => $nom]);

if ($resultat === true) {
    ReponseJson::envoyerMessage("Club mis à jour");
}

// en cas d'erreur
ReponseJson::envoyerLesErreurs($club->getErrors());