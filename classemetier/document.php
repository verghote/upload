<?php

// table document(id, titre, fichier)

// le champ fichier correspond au nom du fichier pdf correspondant
// La création d'un objet ne peut se faire si un fichier n'est pas téléversé

class Document extends Table
{
    const DIR = RACINE . "/data/gestiondocument/";

    public function __construct()
    {
        // appel du contructeur de la classe parent
        parent::__construct('document');

        // le titre du document doit être renseigné
        // commencer par une lettre ou un chiffre
        // se terminer par une lettre ou un chiffre ou ! . ?
        // contenir entre 10 et 70 caractères
        $input = new InputText();
        $input->Pattern = "^[a-zA-ZÀ-ÿçÇ0-9]([ '\-]?[a-zA-ZÀ-ÿçÇ0-9]*)*$";
        $input->MinLength = 10;
        $input->MaxLength = 100;
        $input->SupprimerEspaceSuperflu = true;
        $this->columns['titre'] = $input;

        // un enregistrement est associé à un fichier pdf
        // initialisation de l'objet File qui contiendra le fichier téléversé
        $lesParametres = require dirname(__FILE__)  . '/configdocument.php';
        $input = new InputFile();
        $input->Require = $lesParametres['require'];
        $input->Rename = $lesParametres['rename'];;
        $input->SansAccent = $lesParametres['sansAccent'];
        $input->Extensions = $lesParametres['extensions'];
        $input->Types = $lesParametres['types'];
        $input->MaxSize = $lesParametres['maxSize'];
        $input->Directory = self::DIR;
        $this->columns['fichier'] = $input;

        // Définition des colonnes pouvant être modifiée unitairement
        $this->listOfColumns->Values = ['titre'];
    }


    public static function getAll() : array
    {
        $sql = <<<EOD
        Select id, titre, fichier
        from document 
        order by titre;
EOD;
        $select = new Select();
        $lesLignes = $select->getRows($sql);
        // Vérification de l'existence des fichiers associés : ajout de la colonne present dans le résultat renvoyé
        $nb = count($lesLignes);
        for ($i = 0; $i < $nb; $i++) {
            $lesLignes[$i]['present'] = file_exists(self::DIR . $lesLignes[$i]['fichier']) ? 1 : 0;
        }
        return $lesLignes;
    }

}

