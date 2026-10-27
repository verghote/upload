<?php
declare(strict_types=1);

use ClasseMetier\Document;

use ClasseTechnique\ReponseJson;
use ClasseTechnique\Requete;

// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . '/../bootstrap/bootstrap.php';

// Vérification d'un appel AJAX par la méthode POST sécurisé par un jeton
Requete::exigerPost();

// récupération controlée des paramètres transmis
$id = Requete::postInt('primarykey');
$columns = Requete::postArray('columns');

// création de l'objet métier
$document = new Document();

// modification du document
$resultat = $document->modify($id, $columns);


if ($resultat === true) {
    ReponseJson::envoyerMessage("Le rang du document a été modifié");
}

// en cas d'erreur
ReponseJson::envoyerLesErreurs($document->getErrors());




