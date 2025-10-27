<?php
// récupération des paramètres de configuration pour le logo des clubs
$lesParametres = json_encode(Club::getConfig());
$lesClubs = json_encode(Club::getAll());

$head = <<<HTML
    <script src="/composant/autocomplete/autocomplete.min.js"></script>
    <link rel="stylesheet" href="/composant/autocomplete/autocomplete.css">
    <script>
        const lesParametres = $lesParametres;
        const lesClubs = $lesClubs;
    </script>
HTML;

require RACINE . "/include/interface.php";

