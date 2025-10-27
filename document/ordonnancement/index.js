"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {retournerVersApresConfirmation} from "/composant/fonction/afficher.js";
import {ordonnerElement} from "/composant/fonction/ordonnancement.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesDocuments */

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

const modifierRang = (data) => {
    let rang = 1;
    for (const id of data) {
        // on modifie le rang de chaque document
        appelAjax({
            url: '/ajax/modifiercolonne.php',
            data: {
                table: 'document',
                colonne: 'rang',
                valeur: rang,
                id: id
            }
        });
        rang++;
    }
    retournerVersApresConfirmation("Les documents ont été réordonnés", '../liste');
};

ordonnerElement(lesDocuments, modifierRang, {cle : 'id', champ: 'titre'});

