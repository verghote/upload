<?php
declare(strict_types=1);

class Etudiant extends Table
{

    const DIR = RACINE . "/data/photoetudiant/";

    public function __construct()
    {
        parent::__construct('etudiant');

        // colonne nom
        // Que des lettres et l'espace en séparateur en majuscule sans espace superflu
        // contenir 20 caractères
        $input = new inputText();
        $input->Require = true;
        $input->Casse = 'U';
        $input->SupprimerAccent = true;
        $input->SupprimerEspaceSuperflu = true;
        $input->Pattern = "^[a-zA-Z]+([' \-]?[a-zA-Z]+)*$";
        $input->MaxLength = 20;
        $this->columns['nom'] = $input;

        // colonne prénom
        $input = new inputText();
        $input->Require = true;
        $input->Casse = '';
        $input->SupprimerAccent = false;
        $input->SupprimerEspaceSuperflu = true;
        $input->Pattern = "^[a-zA-ZÀ-ÿÂ-üçÇ]+([ '\-][a-zA-ZÀ-ÿÂ-üçÇ]+)*$";
        $input->MaxLength = 20;
        $this->columns['prenom'] = $input;

        // un enregistrement est associé à un fichier image
        $lesParametres = require dirname(__FILE__) . '/configetudiant.php';
        $input = new InputFileImg($lesParametres);
        $input->Directory = self::DIR;
        $this->columns['fichier'] = $input;

        // colonne modifiable en mode colonne
        $this->listOfColumns->Values = ['nom', 'prenom'];
    }


    /**
     * Retourner le nom, prénom et date de naissance des étudiants afin de contrôler l'unicité
     * @return array
     */

    public static function getAll(): array
    {
        $sql = <<<EOD
        Select id, nom, prenom, fichier
        from etudiant
        order by nom, prenom;
EOD;
        $select = new Select();
        $lesLignes = $select->getRows($sql);
        // Vérification de l'existence des photos : ajout de la colonne present dans le résultat renvoyé
        $nb = count($lesLignes);
        for ($i = 0; $i < $nb; $i++) {
            // la photo n'est pas obligatoire
            $lesLignes[$i]['present'] = (!empty($lesLignes[$i]['fichier']) && file_exists(self::DIR . $lesLignes[$i]['fichier'])) ? 1 : 0;
        }
        return $lesLignes;
    }

    /**
     * Retourne les informations sur l'étudiant dont l'id est passé en paramètre
     *
     * @param int $id : identifiant de l'étudiant
     * @return mixed
     */
    public static function getById(int $id): array|null
    {
        // récupération des informations sur l'étudiant
        $sql = <<<EOD
            SELECT id, nom, prenom, fichier
            FROM etudiant
            Where id = :id
EOD;
        $select = new Select();
        return $select->getRow($sql, ['id' => $id]);
    }

    // ------------------------------------------------------------------------------------------------
    // Méthodes relatives aux opérations de mise à jour
    // ------------------------------------------------------------------------------------------------

    // mise à jour du champ fichier et remplacement de la photo
    public static function remplacerPhoto(int $id, InputFileImg $file): void
    {

        // vérifier l'existence de l'étudiant
        $ligne = self::getById($id);
        if (!$ligne) {
            Erreur::envoyerReponse("L'étudiant $id n'existe pas", 'global');
        }
        // suppression de l'ancienne photo dans le répertoire
        if (!empty($ligne['fichier'])) {
            @unlink(self::DIR . $ligne['fichier']);
        }

        // copie de la nouvelle photo
        $file->copy();
        // mise à jour de la table etudiant
        try {
            $sql = <<<EOD
            update etudiant 
            set fichier = :nomFichier
            where id = :id
EOD;
            $db = Database::getInstance();
            $curseur = $db->prepare($sql);
            $curseur->bindValue('id', $id);
            $curseur->bindValue('nomFichier',  $file->Value);
            $curseur->execute();
        } catch (Exception $e) {
            Erreur::envoyerReponse($e->getMessage());
        }
    }

    // effacer la photo associée à l'étudiant
    public static function supprimerPhoto(int $id): void
    {
        // vérifier l'existence de l'étudiant
        $ligne = self::getById($id);
        if (!$ligne) {
            Erreur::envoyerReponse("L'étudiant $id n'existe pas", 'global');
        }
        // suppression de la photo dans la table et dans le répertoire
        if (!empty($ligne['fichier'])) {

            try {
                $sql = <<<EOD
            update etudiant 
            set fichier = null
            where id = :id
EOD;
                $db = Database::getInstance();
                $curseur = $db->prepare($sql);
                $curseur->bindValue('id', $id);
                $curseur->execute();
            } catch (Exception $e) {
                Erreur::envoyerReponse($e->getMessage());
            }
            // suppression de la photo si elle existe
            @unlink(self::DIR . $ligne['fichier']);
        }
    }
}