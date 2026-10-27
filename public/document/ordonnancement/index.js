"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {messageBox, retournerVersApresConfirmation} from "/composant/fonction/afficher.js";
import {ordonnerElement} from "/composant/fonction/ordonnancement.js";
import {getData} from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

const lesDocuments  =  getData('lesDocuments');

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

const modifierRang = async (data) => {
    const resultats = await Promise.all(data.map((id, index) =>
        appelAjax({
            url: 'ajax/modifierrang.php',
            data: {
                columns : {rang: index + 1},
                primarykey: id
            }
        })
    ));

    if (resultats.some((resultat) => resultat === null)) {
        messageBox("L'ordre des documents n'a pas pu être entièrement enregistré.", 'error');
        return;
    }

    retournerVersApresConfirmation("Les documents ont été réordonnés", '../liste');
};

ordonnerElement(lesDocuments, modifierRang, {cle : 'id', champ: 'titre'});
