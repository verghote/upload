<?php
// chargement des données
$lesDocuments = json_encode(Document::getAll());

$head =<<<HTML
    <script >
        const lesDocuments = $lesDocuments;
    </script>
HTML;

// chargement interface
require RACINE . '/include/interface.php';



