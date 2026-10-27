<?php

declare(strict_types=1);

/**
 * Nettoyage des logos de membres orphelines.
 *
 * Une logoest considérée comme orpheline si elle existe
 * physiquement dans le répertoire des logos mais n'est
 * référencée par aucun membre dans la base de données.
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
// Récupération des logos référencés dans la base de données
// -----------------------------------------------------------------------------

$sql = <<<SQL
    select logo
    from club
    where logo is not null
      and logo <> '';
SQL;

$cmd = $pdo->query($sql);
$lesLogos = $cmd->fetchAll();

// -----------------------------------------------------------------------------
// Construction d'un tableau des logos utilisées
// -----------------------------------------------------------------------------

$logosReferences = [];

foreach ($lesLogos as $ligne) {
    $logosReferences[$ligne['logo']] = true;
}


// -----------------------------------------------------------------------------
// Lecture du répertoire
// -----------------------------------------------------------------------------

$repertoire = '../../public/data/club';
$elements = scandir($repertoire);

// -----------------------------------------------------------------------------
// Recherche des logos orphelines
// -----------------------------------------------------------------------------

$logosOrphelins = [];

foreach ($elements as $element) {

    // Ignorer les entrées spéciales.
    if ($element === '.' || $element === '..') {
        continue;
    }

    $fichier = $repertoire . DIRECTORY_SEPARATOR . $element;

    // Ne traiter que les fichiers.
    if (!is_file($fichier)) {
        continue;
    }

    // Le logo est référencé dans la base :
    // il doit être conservé.
    if (isset($logosReferences[$element])) {
        continue;
    }

    // Le fichier n'est référencé par aucun membre :
    // il est considéré comme orphelin.
    $logosOrphelins[] = $element;
}

// -----------------------------------------------------------------------------
// Aucune logoorpheline
// -----------------------------------------------------------------------------

if (count($logosOrphelins) === 0) {
    echo "Aucune logo orpheline trouvée.\n";
    exit(0);
}

// -----------------------------------------------------------------------------
// Affichage des logos qui seront supprimés
// -----------------------------------------------------------------------------

echo "\n";
echo "============================================================\n";
echo "          LOGOS ORPHELINS À SUPPRIMER\n";
echo "============================================================\n";
echo "\n";

foreach ($logosOrphelins as $logo) {
    echo "  - $logo\n";
}

echo "\n";
echo "Nombre de logos à supprimer : " . count($logosOrphelins) . "\n";
echo "\n";

// -----------------------------------------------------------------------------
// Demande de confirmation
// -----------------------------------------------------------------------------

echo "ATTENTION : cette opération est irréversible.\n";
echo "Voulez-vous supprimer ces fichiers ? [o/N] : ";
fflush(STDOUT);

$confirmation = trim(fgets(STDIN) ?: '');

// -----------------------------------------------------------------------------
// Annulation
// -----------------------------------------------------------------------------

if (!in_array(strtolower($confirmation), ['o', 'oui'], true)) {
    echo "\nSuppression annulée. Aucun fichier n'a été supprimé.\n";
    exit(0);
}

// -----------------------------------------------------------------------------
// Suppression des logos
// -----------------------------------------------------------------------------

echo "\n";
echo "Suppression des logos...\n";
echo "\n";

$nbSuppression = 0;
$nbErreur = 0;

foreach ($logosOrphelins as $logo) {

    $fichier = $repertoire . DIRECTORY_SEPARATOR . $logo;

    if (unlink($fichier)) {
        echo "logo supprimé : $logo\n";
        $nbSuppression++;
    } else {
        fwrite(STDERR, "Erreur : impossible de supprimer le logo: $logo\n");
        $nbErreur++;
    }
}

// -----------------------------------------------------------------------------
// Bilan
// -----------------------------------------------------------------------------

echo "\n";
echo "============================================================\n";
echo "                     BILAN\n";
echo "============================================================\n";
echo "\n";
echo "logos détectés comme orphelins : " . count($logosOrphelins) . "\n";
echo "logos supprimés                   : " . $nbSuppression . "\n";
echo "Erreurs de suppression             : " . $nbErreur . "\n";

// -----------------------------------------------------------------------------
// Code retour CLI
//
// 0 = traitement terminé sans erreur
// 1 = au moins une erreur technique
// -----------------------------------------------------------------------------

exit($nbErreur === 0 ? 0 : 1);