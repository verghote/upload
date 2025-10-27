<?php
// Récupération des paramètres du téléversement
$lesParametres = json_encode(Document::getConfig());

// récupération des documents pour alimenter la zone de liste
$lesDocuments = json_encode(Document::getAll());

$head =<<<HTML
    <script >
        const lesDocuments = $lesDocuments;
        const lesParametres = $lesParametres;
    </script>
HTML;

// chargement interface
require RACINE . '/include/interface.php';