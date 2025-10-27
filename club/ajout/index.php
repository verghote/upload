<?php
// récupération des paramètres de configuration pour le logo des clubs
$lesParametres = json_encode(Club::getConfig());

$head = <<<HTML
    <script>
        const lesParametres = $lesParametres;
    </script>
HTML;

// chargement de l'interface
require RACINE . "/include/interface.php";
