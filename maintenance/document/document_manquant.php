<?php

declare(strict_types=1);

/**
 * Vérification des fichiers de document.
 *
 * Vérifie que chaque fichier de document référencé dans la base de données
 * existe physiquement dans le répertoire des classements.
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
// Récupération des fichiers enregistrés dans la table document
// -----------------------------------------------------------------------------

$sql = <<<SQL
    select id, titre, fichier
    from document
    order by titre
SQL;

$cmd = $pdo->query($sql);
$lesDocuments = $cmd->fetchAll();

// -----------------------------------------------------------------------------
// Vérification des fichiers
// -----------------------------------------------------------------------------

$repertoire = '../../public/data/document';

echo "Vérification des fichiers de document...\n";
echo "Répertoire : $repertoire\n";

$nb = 0;
$nbNonTrouve = 0;

foreach ($lesDocuments as $document) {

    $nb++;

    $fichier = $repertoire . DIRECTORY_SEPARATOR . $document['fichier'];

    if (!is_file($fichier)) {

        $nbNonTrouve++;

        echo "FICHIER ABSENT\n";
        echo "  ID      : " . $document['id'] . "\n";
        echo "  Date    : " . $document['date'] . "\n";
        echo "  Titre   : " . $document['titre'] . "\n";
        echo "  Fichier : " . $document['fichier'] . "\n";
        echo "\n";
    }
}

// -----------------------------------------------------------------------------
// Bilan
// -----------------------------------------------------------------------------

echo "Classements enregistrés en base : $nb\n";
echo "Fichiers absents                : $nbNonTrouve\n";

if ($nbNonTrouve === 0) {
    echo "OK : tous les fichiers de document enregistrés en base existent.\n";
} else {
    echo "ATTENTION : des fichiers de document enregistrés en base sont absents du répertoire.\n";
}

echo "\n";

// -----------------------------------------------------------------------------
// Code retour CLI
//
// 0 = aucune anomalie
// 1 = au moins un fichier absent
// -----------------------------------------------------------------------------

exit($nbNonTrouve === 0 ? 0 : 1);
