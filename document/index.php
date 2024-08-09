<?php
// activation du chargement dynamique des ressources
require $_SERVER['DOCUMENT_ROOT'] . "/include/autoload.php";

// génération d'un token pour garantir l'origine des appels vers les autres scripts du module
$token = Jeton::creer();

// chargement des données utilisées par l'interface



$head =<<<EOD
<script >

    const token = '$token';
</script>
EOD;

// chargement interface
require RACINE . '/include/interface.php';