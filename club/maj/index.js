"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {confirmer} from '/composant/fonction/afficher.js';
import {creerBoutonSuppression, enleverAccent} from "/composant/fonction/formulaire.js";
import {getTd, getTr} from "/composant/fonction/trtd.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesClubs */

const lesLignes = document.getElementById('lesLignes');

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Demande de suppression
 * @param id
 */
function supprimer(id) {
    appelAjax({
        url: 'ajax/supprimer.php',
        data: {id: id},
        success: () => document.getElementById(id.toString())?.remove()
    });
}

/**
 * Demande de modification de la valeur de la colonne nom
 * @param {HTMLInputElement} input
 * @param {number} id
 */
function modifierNom(input, id) {
    appelAjax({
        url: '/ajax/modifiercolonne.php',
        data: {
            table: 'club',
            colonne: 'nom',
            valeur: input.value,
            id: id
        },
        success: () => input.style.color = 'green'
    });
}


/**
 * Crée la colonne des actions : bouton supprimer
 * @param id
 * @returns {HTMLTableCellElement}
 */
function creerColonneAction(id) {
    const actionSupprimer = () => confirmer(() => supprimer(id));
    const btnSupprimer = creerBoutonSuppression(actionSupprimer);
    btnSupprimer.setAttribute('aria-label', 'Supprimer le club');

    const tdAction = getTd('');
    tdAction.appendChild(btnSupprimer);
    return tdAction;
}


/**
 * Crée la colonne du nom
 * @param id
 * @param nom
 * @returns {HTMLTableCellElement}
 */
function creerColonneNom(id, nom) {
    const inputNom = document.createElement('input');
    inputNom.type = 'text';
    inputNom.value = nom;
    inputNom.required = true;
    inputNom.maxLength = 70;
    inputNom.pattern = "^[A-Za-z]+([ '\\-.]?[A-Za-z0-9])*$";

    inputNom.onchange = function () {
        this.value = enleverAccent(this.value).toUpperCase();
        if (this.checkValidity()) {
            modifierNom(this, id);
        } else {
            this.style.color = 'red';
            this.reportValidity();
        }
    };

    const tdNom = getTd('');
    tdNom.appendChild(inputNom);
    return tdNom;
}


/**
 * Crée une ligne du tableau des clubs
 * @param club
 * @returns {HTMLTableRowElement}
 */
function creerLigneClub(club) {
    const {id, nom} = club;

    // Création de la ligne (nécessaire pour la référence circulaire)
    const tr = getTr([]);
    tr.id = id;

    // Création des colonnes
    const tdAction = creerColonneAction(id);
    const tdId = getTd(id);
    const tdNom = creerColonneNom(id, nom);

    // Ajout des cellules à la ligne
    tr.appendChild(tdAction);
    tr.appendChild(tdId);
    tr.appendChild(tdNom);

    return tr;
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

for (const club of lesClubs) {
    lesLignes.appendChild(creerLigneClub(club));
}

