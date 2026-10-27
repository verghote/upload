<?php
declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Contraintes SQL de l'application
|--------------------------------------------------------------------------
|
| Ce fichier associe le nom d'une contrainte SQL à un message destiné
| à l'utilisateur.
|
| Les noms correspondent aux contraintes définies dans le script SQL.
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Contraintes Primary key
    |--------------------------------------------------------------------------
    */

    'primary@club' => "Un club avec le même identifiant est déjà enregistré.",
    'primary@document' => "Un document avec le même identifiant est déjà enregistré.",
    'primary' => "Un enregistrement avec cette clé primaire existe déjà.",


    /*
    |--------------------------------------------------------------------------
    | Contraintes UNIQUE
    |--------------------------------------------------------------------------
    */


    'uk_club_nom' => "Un club portant ce nom existe déjà.",

    'uk_document_titre' => "Ce titre est déjà utilisé.",

    'uk_document_fichier' => "Ce fichier est déjà utilisé.",


    /*
    |--------------------------------------------------------------------------
    | Contraintes CHECK
    |--------------------------------------------------------------------------
    */

    'ck_club_id' => "L'identifiant du club est invalide.",
    'ck_club_nom' => "Le nom du club est invalide.",


    /*
    |--------------------------------------------------------------------------
    | Contraintes FOREIGN KEY
    |--------------------------------------------------------------------------
    */
];
