<?php
// Récupération des paramètres du téléversement
$lesParametres = json_encode(Document::getConfig());

$head =<<<HTML
    <script >
         const lesParametres = $lesParametres;
    </script>
HTML;

// affichage de l'interface
require RACINE . '/include/interface.php';
