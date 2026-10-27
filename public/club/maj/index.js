"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {afficherToast, confirmer} from "/composant/fonction/afficher.js";
import {enleverAccent} from "/composant/fonction/chaine.js";
import {getData} from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

const lesClubs = getData('lesClubs');

const lesLignes = document.getElementById('lesLignes');
const modeleLigneClub = document.getElementById('modeleLigneClub');

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Demande de suppression d'un club.
 *
 * @param {string} id
 */
function supprimer(id) {
    appelAjax({
        url: 'ajax/supprimer.php',
        data: {primaryKey: id},
        success: (data) => {
            document.getElementById('club' + id.toString()).remove();
            afficherToast(data.message);
        }
    });
}


/**
 * Demande de modification du nom d'un club.
 *
 * @param {HTMLInputElement} input
 * @param {string} id
 */
function modifierNom(input, id) {
    appelAjax({
        url: 'ajax/modifiernom.php',
        data: {
            primaryKey: id,
            nom: input.value
        },
        success: () => input.style.color = 'green'
    });
}
/**
 * Configure le bouton de suppression d'une ligne.
 *
 * @param {HTMLButtonElement} bouton
 * @param {string} id
 */
function configurerBoutonSuppression(bouton, id) {
    bouton.addEventListener('click', () => {confirmer(() => supprimer(id)); });
}


/**
 * Configure le champ permettant de modifier le nom.
 *
 * @param {HTMLInputElement} input
 * @param {string} id
 */
function configurerInputNom(input, id) {
    input.addEventListener('change', function () {
        this.value = enleverAccent(this.value).toUpperCase();

        if (this.checkValidity()) {
            modifierNom(this, id);
        } else {
            this.style.color = 'red';
            this.reportValidity();
        }
    });
}


/**
 * Crée une ligne de tableau à partir du template HTML.
 *
 * @param {Object} club
 * @param {string} club.id
 * @param {string} club.nom
 * @returns {DocumentFragment}
 */
function creerLigneClub(club) {
    const {id, nom} = club;

    // Clone du contenu du template
    const fragment = modeleLigneClub.content.cloneNode(true);

    // Récupération des éléments de la ligne
    const tr = fragment.querySelector('tr');
    const colonneNumero = fragment.querySelector('.colonne-numero');
    const inputNom = fragment.querySelector('.colonne-nom input');
    const boutonSupprimer = fragment.querySelector('.bouton-supprimer');

    // Identifiant de la ligne
    tr.id = 'club' + id;

    // Numéro du club
    colonneNumero.textContent = id;

    // Nom du club
    inputNom.value = nom;

    // Évènements
    configurerInputNom(inputNom, id);
    configurerBoutonSuppression(boutonSupprimer, id);

    return fragment;
}


// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

for (const club of lesClubs) {
    lesLignes.appendChild(creerLigneClub(club));
}
