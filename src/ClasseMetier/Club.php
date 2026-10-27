<?php

declare(strict_types=1);

namespace ClasseMetier;

use ClasseTechnique\ColumnText;
use ClasseTechnique\Select;
use ClasseTechnique\Table;


/**
 * Classe Club
 *
 * Gestion des données métier de la table club.
 *
 * Responsabilités :
 * - définition des colonnes métier ;
 * - validation des données ;
 * - contraintes métier ;
 * - gestion CRUD de la table club ;
 * - consultations des clubs.
 *
 * La gestion physique du logo est déléguée à ImageManager
 * et au ServiceClub.
 *
 * @author Guy Verghote
 * @version 2026.1
 */
class Club extends Table
{
    /**
     * Configuration de la table.
     */
    protected function configure(): void
    {
        $this->table = 'club';
        $this->primaryKey = 'id';

        $this->addColumn('id', new ColumnText(
            required: true,
            insertable: true,
            updatable: false,
            pattern: "^080[0-9]{3}$",
            minLength: 6,
            maxLength: 6
        ));

        $this->addColumn('nom', new ColumnText(
            required: true,
            insertable: true,
            updatable: true,
            pattern: "^[A-Za-z]+([ '\-.]?[A-Za-z0-9])*$",
            minLength: 3,
            maxLength: 60,
            supprimerEspaceSuperflu: true
        ));

        $this->addColumn('logo', new ColumnText(
            required: false,
            insertable: true,
            updatable: true,
            maxLength: 100,
            supprimerEspaceSuperflu: true
        ));
    }


    // -----------------------------------------------------------------------
    // Méthodes statiques de consultation
    // -----------------------------------------------------------------------

    /**
     * Retourne tous les clubs.
     */
    public static function getAll(): array
    {
        $sql = <<<SQL
            SELECT id, nom, logo
            FROM club
            ORDER BY nom
        SQL;

        $select = new Select();

        return $select->getRows($sql);
    }


    /**
     * Retourne un club à partir de son identifiant.
     */
    public static function getById(string $id): ?array
    {
        $sql = <<<SQL
            SELECT id, nom, logo
            FROM club
            WHERE id = :id
        SQL;

        $select = new Select();

        return $select->getRow($sql, ['id' => $id]);
    }
}