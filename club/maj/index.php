<?php
// récupération des clubs pour alimenter la zone de liste
$lesClubs = json_encode(Club::getAll());

$head = <<<HTML
<script>
    const lesClubs = $lesClubs;
</script>
HTML;

// chargement de l'interface
require RACINE . "/include/interface.php";

