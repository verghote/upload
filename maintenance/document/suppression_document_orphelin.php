<?php

declare(strict_types=1);

/**
 * Nettoyage des fichiers PDF de document orphelins.
 *
 * Un fichier PDF est considéré comme orphelin s'il existe
 * physiquement dans le répertoire des classements mais n'est
 * référencé par aucun enregistrement de la table document.
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
// Récupération des fichiers référencés dans la base de données
// -----------------------------------------------------------------------------

$sql = <<<SQL
    select fichier
    from document
SQL;

$cmd = $pdo->query($sql);

$lesFichiers = $cmd->fetchAll();


// -----------------------------------------------------------------------------
// Construction d'un tableau des fichiers utilisés
// -----------------------------------------------------------------------------

$fichiersReferences = [];
foreach ($lesFichiers as $ligne) {
    $fichiersReferences[$ligne['fichier']] = true;
}

// -----------------------------------------------------------------------------
// Lecture du répertoire
// -----------------------------------------------------------------------------
$repertoire = '../../public/data/document';
$elements = scandir($repertoire);
if ($elements === false) {
    fwrite(STDERR, "Erreur : impossible de lire le répertoire : $repertoire\n");
    exit(1);
}

// -----------------------------------------------------------------------------
// Recherche des fichiers PDF orphelins
// -----------------------------------------------------------------------------

$fichiersOrphelins = [];
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

    // Vérification de l'extension du fichier (PDF uniquement).
    $extension = strtolower(pathinfo($element, PATHINFO_EXTENSION));
    if ($extension !== 'pdf') {
        continue;
    }

    // Le fichier est référencé dans la base :
    // il doit être conservé.
    if (isset($fichiersReferences[$element])) {
        continue;
    }
    // Le fichier n'est référencé par aucun document :
    // il est considéré comme orphelin.
    $fichiersOrphelins[] = $element;
}

// -----------------------------------------------------------------------------
// Aucun fichier PDF orphelin
// -----------------------------------------------------------------------------

if (count($fichiersOrphelins) === 0) {
    echo "Aucun fichier PDF orphelin trouvé.\n";
    exit(0);
}

// -----------------------------------------------------------------------------
// Affichage des fichiers qui seront supprimés
// -----------------------------------------------------------------------------

echo "\n";
echo "============================================================\n";
echo "       FICHIERS PDF ORPHELINS À SUPPRIMER\n";
echo "============================================================\n";
echo "\n";
foreach ($fichiersOrphelins as $fichier) {
    echo "  - $fichier\n";
}
echo "\n";
echo "Nombre de fichiers à supprimer : " . count($fichiersOrphelins) . "\n";
echo "\n";

// -----------------------------------------------------------------------------
// Demande de confirmation
// -----------------------------------------------------------------------------

echo "ATTENTION : cette opération est irréversible.\n";
echo "Voulez-vous supprimer ces fichiers ? [o/N] : ";
$confirmation = trim(fgets(STDIN) ?: '');

// -----------------------------------------------------------------------------
// Annulation
// -----------------------------------------------------------------------------

if (!in_array(strtolower($confirmation), ['o', 'oui'], true)) {
    echo "Suppression annulée. Aucun fichier n'a été supprimé.\n";
    exit(0);
}

// -----------------------------------------------------------------------------
// Suppression des fichiers
// -----------------------------------------------------------------------------

echo "\n";
echo "Suppression des fichiers...\n";
echo "\n";
$nbSuppression = 0;
$nbErreur = 0;
foreach ($fichiersOrphelins as $fichier) {
    $chemin = $repertoire . DIRECTORY_SEPARATOR . $fichier;
    if (unlink($chemin)) {
        echo "Fichier supprimé : $fichier\n";
        $nbSuppression++;
    } else {
        fwrite(STDERR, "Erreur : impossible de supprimer le fichier : $fichier\n");
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
echo "Fichiers PDF détectés comme orphelins : " . count($fichiersOrphelins) . "\n";
echo "Fichiers supprimés                    : " . $nbSuppression . "\n";
echo "Erreurs de suppression                : " . $nbErreur . "\n";

// -----------------------------------------------------------------------------
// Code retour CLI
//
// 0 = traitement terminé sans erreur
// 1 = au moins une erreur technique
// -----------------------------------------------------------------------------

exit($nbErreur === 0 ? 0 : 1);
