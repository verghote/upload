<?php

declare(strict_types=1);

/**
 * Vérification des photos de membres.
 *
 * Vérifie que chaque logo référencée dans la base de données
 * existe physiquement dans le répertoire des photos.
 *
 * Ce script est exclusivement destiné à une exécution CLI.
 *
 */

// -----------------------------------------------------------------------------
// Vérification du mode CLI
// -----------------------------------------------------------------------------

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Erreur : ce script doit être exécuté en ligne de commande.\n");
    exit(1);
}

// -----------------------------------------------------------------------------
// Connexion à la base de données
// -----------------------------------------------------------------------------

$dbHost = 'localhost';
$dbPort = 3306;
$dbName = 'upload';
$dbUser = 'root';
$dbPassword = '';

$pdo = new PDO(
    "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4",
    $dbUser,
    $dbPassword,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

// -----------------------------------------------------------------------------
// Récupération des photos enregistrées dans la table membre
// -----------------------------------------------------------------------------

$sql = <<<SQL
    select id, nom, logo
    from club
    where logo is not null
      and logo <> ''
    order by nom
SQL;

$cmd = $pdo->query($sql);
$lesClubs = $cmd->fetchAll();

// -----------------------------------------------------------------------------
// Vérification des fichiers
// -----------------------------------------------------------------------------

$repertoire = '../../public/data/club';

echo "Vérification des photos des membres...\n";
echo "Répertoire : $repertoire\n";

$nb = 0;
$nbNonTrouve = 0;

foreach ($lesClubs as $club) {

    $nb++;

    $fichier = $repertoire . DIRECTORY_SEPARATOR . $club['logo'];

    if (!is_file($fichier)) {

        $nbNonTrouve++;

        echo "PHOTO ABSENTE\n";
        echo "  ID      : " . $club['id'] . "\n";
        echo "  Membre  : " . $club['nom'] . ' ' . $club['prenom'] . "\n";
        echo "  Fichier : " . $club['logo'] . "\n";
        echo "\n";
    }
}

// -----------------------------------------------------------------------------
// Bilan
// -----------------------------------------------------------------------------

echo "Photos enregistrées en base : $nb\n";
echo "Photos absentes             : $nbNonTrouve\n";

if ($nbNonTrouve === 0) {
    echo "OK : toutes les photos enregistrées en base existent.\n";
} else {
    echo "ATTENTION : des photos enregistrées en base sont absentes du répertoire.\n";
}

echo "\n";

// -----------------------------------------------------------------------------
// Code retour CLI
//
// 0 = aucune anomalie
// 1 = au moins une logo absente
// -----------------------------------------------------------------------------

exit($nbNonTrouve === 0 ? 0 : 1);