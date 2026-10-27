"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {getData} from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

const lesClubs = getData('lesClubs');
const repertoire = getData('repertoire');

const lesCartes = document.getElementById('lesCartes');
const carteClubTemplate = document.getElementById('carteClubTemplate');

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Crée une carte pour afficher les informations d'un club
 * @param {Object} club - Données du club
 * @returns {HTMLDivElement}
 */
function creerCarte(club) {
    const carte = carteClubTemplate.content.firstElementChild.cloneNode(true);
    const entete = carte.querySelector('.enteteClub');
    const logo = carte.querySelector('.logoClub');

    entete.innerText = club.nom;

    if (club.logo !== null && club.logo !== '') {
        logo.src = repertoire + '/' + club.logo;
        logo.alt = `${club.nom} logo`;

        // Si le fichier image n'existe pas physiquement sur le serveur
        logo.onerror = () => {
            logo.remove();
        };
    } else {
        logo.remove();
    }

    return carte;
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

// Création des cartes
for (const club of lesClubs) {
    lesCartes.appendChild(creerCarte(club));
}