<?php
declare(strict_types=1);

/**
 * Classe Club - Gestion des clubs de sport
 * Table : id, nom, logo
 */
class Club extends Table
{
    /**
     * Configuration intégrée pour l'upload des logos.
     */
    private const CONFIG = [
        'repertoire' => '/data/club',
        'extensions' => ["jpg", "png"],
        'types' => ["image/pjpeg", "image/jpeg", "x-png", "image/png"],
        'maxSize' => 150 * 1024,
        'require' => false,
        'rename' => true,
        'sansAccent' => true,
        'redimensionner' => false,
        'height' => 0,
        'width' => 350,
        'accept' => '.jpg, .png',
        'label' => '(150 Ko max, jpg ou png)',
    ];

    private const DIR = RACINE . self::CONFIG['repertoire'];

    public function __construct()
    {
        parent::__construct('club');

        // Colonne id : clé primaire non auto-incrémentée (6 chiffres)
        $input = new inputText();
        $input->Require = true;
        $input->Pattern = "^[0-9]{6}$";
        $input->MaxLength = 6;
        $input->MinLength = 6;
        $this->columns['id'] = $input;

        // Colonne nom
        $input = new inputText();
        $input->Require = true;
        $input->Casse = 'U';
        $input->SupprimerAccent = true;
        $input->SupprimerEspaceSuperflu = true;
        $input->Pattern = "^[A-Z0-9]+([ .\-]?[A-Z0-9]+)*$";
        $input->MaxLength = 70;
        $this->columns['nom'] = $input;

        // Colonne logo
        $input = new InputText();
        $input->Require = false;
        $this->columns['logo'] = $input;

        // Définition des colonnes modifiables en mode colonne
        $this->listOfColumns->Values = ['nom'];
    }

    // ------------------------------------------------------------------------------------------------
    // Méthodes de consultation
    // ------------------------------------------------------------------------------------------------

    /**
     * Renvoie la configuration du logo des clubs
     * @return array<string, mixed>
     */
    public static function getConfig(): array
    {
        return self::CONFIG;
    }

    /**
     * Retourne l'ensemble des clubs
     * Champs retournés : id, nom, logo, present
     * @return array
     */
    public static function getAll(): array
    {
        $sql = "select id, nom, logo from club order by nom;";
        $select = new Select();
        $lesClubs = $select->getRows($sql);

        // Ajouter l'information si le logo existe pour chaque club
        foreach ($lesClubs as &$club) {
            $club['present'] = !empty($club['logo']) && is_file(self::DIR . '/' . $club['logo']);
        }
        unset($club);

        return $lesClubs;
    }

    /**
     * Retourne les informations sur un club
     * @param string $id
     * @return array|false
     */
    public static function getById(string $id): array|false
    {
        $sql = "select id, nom, logo from club where id = :id;";
        $select = new Select();
        $club = $select->getRow($sql, ['id' => $id]);

        if ($club) {
            $club['present'] = !empty($club['logo']) && is_file(self::DIR . '/' . $club['logo']);
        }

        return $club;
    }

    // ------------------------------------------------------------------------------------------------
    // Méthodes de mise à jour
    // ------------------------------------------------------------------------------------------------

    /**
     * Supprime le fichier logo associé au club
     * @param string $fichier
     * @return void
     */
    public static function supprimerFichier(string $fichier): void
    {
        $chemin = self::DIR . '/' . $fichier;
        if (is_file($chemin)) {
            unlink($chemin);
        }
    }

    /**
     * Supprime un enregistrement de la table club
     * @param string $id
     * @return void
     */
    public static function supprimer(string $id): void
    {
        $db = Database::getInstance();
        $sql = "delete from club where id = :id;";
        $cmd = $db->prepare($sql);
        $cmd->bindValue('id', $id);
        $cmd->execute();
        try {
            $cmd->execute();
        } catch (Exception $e) {
            Erreur::traiterReponse($e->getMessage());
        }
    }

    /**
     * Met à jour le logo d'un club
     * @param string $id
     * @param string $logo
     * @return void
     */
    public static function majLogo(string $id, string $logo): void
    {
        $sql = "update club set logo = :logo where id = :id;";
        $db = Database::getInstance();
        $cmd = $db->prepare($sql);
        $cmd->bindValue('id', $id);
        $cmd->bindValue('logo', $logo);
        try {
            $cmd->execute();
        } catch (Exception $e) {
            Erreur::traiterReponse($e->getMessage());
        }
    }
}
