<?php
// récupération des clubs
$lesClubs = json_encode(Club::getAll(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// récupération du répertoire contenant les logos des clubs
$repertoire = json_encode(Club::getConfig()['repertoire'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$head = <<<HTML
    <script>
        const lesClubs = $lesClubs ;
        const repertoire = $repertoire;
    </script>
HTML;

// chargement de l'interface
require RACINE . "/include/interface.php";
