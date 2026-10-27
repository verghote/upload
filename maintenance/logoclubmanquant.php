<?php
declare(strict_types=1);

use ClasseTechnique\Select;

// Ce script doit impérativement être exécuté en ligne de commande.

if (PHP_SAPI !== 'cli') {
    die("Ce script doit être exécuté en mode CLI.\n");
}

// -----------------------------------------------------------------------------
// Chargement de l'application
// -----------------------------------------------------------------------------
require dirname(__DIR__) . '/bootstrap/bootstrap.php';

// -----------------------------------------------------------------------------
// Récupération des logos enregistrés dans la table club
// -----------------------------------------------------------------------------
$sql = <<<SQL
    select id, logo
    from club
    where logo is not null
      and logo <> ''
SQL;
$select = new Select();
$lesclubs = $select->getRows($sql);

// -----------------------------------------------------------------------------
// Vérification des fichiers
// -----------------------------------------------------------------------------
echo "Vérification des logos des clubs...\n";
echo "Répertoire : " . DOSSIER_CLUB . "\n";
echo str_repeat('-', 70) . "\n";
$nb = 0;
$nbNonTrouve = 0;
foreach ($lesclubs as $club) {
    $nb++;
    $fichier = DOSSIER_CLUB . DIRECTORY_SEPARATOR . $club['logo'];
    if (!is_file($fichier)) {
        $nbNonTrouve++;
        echo "logo ABSENTE\n";
        echo "  ID      : " . $club['id'] . "\n";
        echo "  club  : " . $club['nom'] . ' ' . $club['prenom'] . "\n";
        echo "  Fichier : " . $club['logo'] . "\n";
        echo "\n";
    }
}

// -----------------------------------------------------------------------------
// Bilan
// -----------------------------------------------------------------------------
echo str_repeat('-', 70) . "\n";
echo "logos enregistrés en base : $nb\n";
echo "logos absents             : $nbNonTrouve\n";
if ($nbNonTrouve === 0) {
    echo "OK : toutes les logos enregistrés en base existent.\n";
} else {
    echo "ATTENTION : des logos enregistrés en base sont absents du répertoire.\n";
}
echo "\n";

// -----------------------------------------------------------------------------
// Code retour CLI
// 0 = aucune anomalie
// 1 = au moins une logo absente
// -----------------------------------------------------------------------------
exit($nbNonTrouve === 0 ? 0 : 1);

