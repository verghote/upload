<?php

declare(strict_types=1);

/**
 * Nettoyage des logos de clubs orphelins.
 *
 * Un logo est considéré comme orphelin si elle existe
 * physiquement dans le répertoire data/club mais n'est
 * référencée par aucun club dans la base de données.
 *
 * Ce script est exclusivement destiné à une exécution CLI.
 */

// -----------------------------------------------------------------------------
// Vérification du mode CLI
// -----------------------------------------------------------------------------

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Erreur : ce script doit être exécuté en ligne de commande.\n");
    exit(1);
}

// -----------------------------------------------------------------------------
// Chargement du bootstrap
// -----------------------------------------------------------------------------

require __DIR__ . '/../bootstrap/bootstrap.php';

// -----------------------------------------------------------------------------
// Récupération des logos référencés dans la base de données
// -----------------------------------------------------------------------------

$select = new \ClasseTechnique\Select();

$sql = <<<SQL
    select logo
    from club
    where logo is not null
      and logo <> '';
SQL;
$leslogos = $select->getRows($sql);

// -----------------------------------------------------------------------------
// Construction d'un tableau des logos utilisés
// -----------------------------------------------------------------------------

$logosReferencees = [];
foreach ($leslogos as $ligne) {
    $logosReferencees[$ligne['logo']] = true;
}

// -----------------------------------------------------------------------------
// Vérification du répertoire des logos
// -----------------------------------------------------------------------------
$repertoire = DOSSIER_CLUB;
if (!is_dir($repertoire)) {
    fwrite(STDERR, "Erreur : le répertoire des logos n'existe pas : $repertoire\n");
    exit(1);
}

// -----------------------------------------------------------------------------
// Lecture du répertoire
// -----------------------------------------------------------------------------

$elements = scandir($repertoire);

if ($elements === false) {
    fwrite(STDERR, "Erreur : impossible de lire le répertoire : $repertoire\n");
    exit(1);
}

// -----------------------------------------------------------------------------
// Recherche des logos orphelins
// -----------------------------------------------------------------------------

$lesFichiersOrphelins = [];
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
    // Le logo est référencée dans la base :
    // elle doit être conservée.
    if (isset($logosReferencees[$element])) {
        continue;
    }
    // Le fichier n'est référencé par aucun club :
    // il est considéré comme orphelin.
    $lesFichiersOrphelins[] = $element;
}

// -----------------------------------------------------------------------------
// Aucun logo orphelin
// -----------------------------------------------------------------------------

if (count($lesFichiersOrphelins) === 0) {
    echo "Aucun logo orphelin trouvé.\n";
    exit(0);
}

// -----------------------------------------------------------------------------
// Affichage des logos qui seront supprimées
// -----------------------------------------------------------------------------
echo "\n";
echo "============================================================\n";
echo "          LOGOS ORPHELINS À SUPPRIMER\n";
echo "============================================================\n";
echo "\n";
foreach ($lesFichiersOrphelins as $logo) {
    echo "  - $logo\n";
}
echo "\n";
echo "Nombre de logos à supprimer : " . count($lesFichiersOrphelins) . "\n";
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
foreach ($lesFichiersOrphelins as $logo) {
    $fichier = $repertoire . DIRECTORY_SEPARATOR . $logo;
    if (unlink($fichier)) {
        echo "logo supprimée : $logo\n";
        $nbSuppression++;
    } else {
        fwrite(STDERR, "Erreur : impossible de supprimer la logo : $logo\n");
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

echo "logos détectés comme orphelins : "    . count($lesFichiersOrphelins)    . "\n";
echo "logos supprimées                  : "    . $nbSuppression    . "\n";
echo "Erreurs de suppression             : "    . $nbErreur    . "\n";

// -----------------------------------------------------------------------------
// Code retour CLI
//
// 0 = traitement terminé sans erreur
// 1 = au moins une erreur technique
// -----------------------------------------------------------------------------
exit($nbErreur === 0 ? 0 : 1);

