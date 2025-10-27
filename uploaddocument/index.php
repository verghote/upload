<?php
// récupération des paramètres du téléversement
$lesParametres = json_encode(FichierPDF::getConfig(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

// récupération des fichiers PDF
$lesFichiers = json_encode(FichierPDF::getAll(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$head = <<<HTML
<script>
     const lesFichiers = $lesFichiers;
     const lesParametres = $lesParametres;
</script>
HTML;

 // chargement de l'interface
require RACINE . "/include/interface.php";
