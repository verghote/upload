<?php
declare(strict_types=1);

namespace ClasseMetier;

use ClasseTechnique\ColumnInt;
use ClasseTechnique\ColumnText;
use ClasseTechnique\Select;
use ClasseTechnique\Table;


/**
 * Classe Document
 *
 * Gestion des documents PDF associés à l'application.
 *
 * Responsabilités :
 * - définition des colonnes métier ;
 * - validation des données ;
 * - gestion CRUD de la table document ;
 * - consultations des documents.
 *
 * La gestion physique des fichiers PDF est déléguée à PdfManager.
 *
 * @author Guy Verghote
 * @version 2026.1
 */
class Document extends Table
{

    /**
     * Configuration de la table.
     */
    protected function configure(): void
    {
        $this->table = 'document';
        $this->primaryKey = 'id';

        $this->addColumn('titre', new ColumnText(
            required: true,
            insertable: true,
            updatable: true,
            pattern: "^[a-zA-ZÀ-ÿçÇ0-9]([ '\-]?[a-zA-ZÀ-ÿçÇ0-9]*)*$",
            minLength: 10,
            maxLength: 100,
            supprimerEspaceSuperflu: true
        ));

        $this->addColumn('fichier', new ColumnText(
            required: true,
            insertable: true,
            updatable: false,
            maxLength: 100
        ));

        $this->addColumn('rang', new ColumnInt(
            required: false,
            insertable: false,
            updatable: true,
        ));
    }



    // -----------------------------------------------------------------------
    // Méthodes statiques de consultation
    // -----------------------------------------------------------------------

    /**
     * Retourne tous les documents.
     */
    public static function getAll(): array
    {
        $sql = <<<SQL
            SELECT id, titre, fichier
            FROM document
            ORDER BY rang, titre
        SQL;
        $select = new Select();
        $lesLignes = $select->getRows($sql);
        // Ajout d'une colonne permettant de vérifier l'existence réelle de l'affiche
        foreach ($lesLignes as &$ligne) {
            $ligne['present'] = ($ligne['fichier'] !== null && $ligne['fichier'] !== '' && is_file(DOSSIER_DOCUMENT . DIRECTORY_SEPARATOR . $ligne['fichier']));
        }
        unset($ligne);

        return $lesLignes;
    }


    /**
     * Récupère un document par son identifiant.
     */
    public static function getById(int $id): ?array
    {
        $sql = <<<SQL
            SELECT id, titre, fichier
            FROM document
            WHERE id = :id
        SQL;
        $select = new Select();
        $ligne = $select->getRow($sql, ['id' => $id]);
        if ($ligne !== null) {
            $ligne['present'] = $ligne['fichier'] !== '' && is_file(DOSSIER_DOCUMENT . DIRECTORY_SEPARATOR . $ligne['fichier']);
        }
        return $ligne;
    }
}