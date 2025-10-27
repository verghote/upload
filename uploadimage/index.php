<?php
// récupération des paramètres du téléversement
$lesParametres = json_encode(FichierImage::getConfig(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

// récupération des fichiers images
$lesFichiers = json_encode(FichierImage::getAll(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$head = <<<HTML
<script>
     const lesFichiers = $lesFichiers;
     let lesParametres = $lesParametres;
</script>
HTML;

// chargement de l'interface
require RACINE . "/include/interface.php";
