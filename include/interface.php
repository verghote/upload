<?php
$lesOptionsVerticales = file_get_contents(RACINE . '/.config/menuvertical.json');
// chargement des options du menu horizontal si le module en possède un
if (is_file('../.config/menuhorizontal.json')) {
    $lesOptionsHorizontales = file_get_contents('../.config/menuhorizontal.json');
    $menuHorizontal = <<<HTML
    <script type='module'>
        import {initialiserMenuHorizontal} from "/composant/menuhorizontal/menu.js";
        initialiserMenuHorizontal($lesOptionsHorizontales);
    </script>
HTML;
}
?>
<!DOCTYPE HTML>
<html lang="fr">
<head>
    <title>Le téléversement</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="data:,">
    <!-- Script Bootstrap  -->
    <link rel="stylesheet" href="/composant/bootstrap/bootstrap.min.css">
    <script src="/composant/bootstrap/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="/css/style.css">
    <script type='module'>
        // Initialisation du menu vertical
        import {initialiserMenuVertical} from "/composant/menuvertical/menu.js";
        initialiserMenuVertical(<?=$lesOptionsVerticales;?>, 150);
    </script>
    <?php
    // chargement du menu horizontal si les options sont définies
    if (isset($menuHorizontal)) {
        echo $menuHorizontal;
    }
    // récupération du nom du fichier php appelant cela va permettre de charger l'interface correspondante : fichier html portant le même nom ou le fichier de même nom dans le dossier interface
    if (!isset($file)) {
        $file = pathinfo($_SERVER['PHP_SELF'], PATHINFO_FILENAME);
    }
    if (is_file("$file.js")) {
        $v = filemtime("$file.js");
        echo "<script type='module' src='$file.js?t=$v'></script>";
    }
    if (isset($head)) {
        echo $head;
    }
    ?>
</head>
<body>
<main>
    <div style="margin: 10px;">
        <?php
        if (is_file("$file.html")) {
            require "$file.html";
        }
        ?>
    </div>
</main>
</body>
</html>