"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {effacerLesErreurs} from "/composant/fonction/formulaire.js";
import {fichierValide, verifierImage} from "/composant/fonction/fichier.js";
import {appelAjax} from "/composant/fonction/ajax.js";
import {afficherToast} from "/composant/fonction/afficher.js";
import {getData} from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

const lesClubs = getData("lesClubs");
const lesParametres = getData("lesParametres");
const repertoire = getData("repertoire");

// Extraction des paramètres
const lesExtensions = lesParametres.lesExtensions;
const maxSize = lesParametres.maxSize;
const redimensionner = lesParametres.resized;
const largeurMax = lesParametres.maxWidth;
const hauteurMax = lesParametres.maxHeight;

const fichier = document.getElementById("fichier");
const lesCartes = document.getElementById("lesCartes");
const tplCarte = document.getElementById("tplCarteClub");

let idClub;

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

fichier.addEventListener("change", () => {
    if (fichier.files.length > 0) {
        controlerFichier(fichier.files[0]);
    }

    // Permet de sélectionner à nouveau le même fichier.
    fichier.value = "";
});

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Crée une carte pour un club.
 *
 * @param {Object} club
 * @returns {HTMLElement}
 */
function creerCarte(club) {
    const carte = tplCarte.content.firstElementChild.cloneNode(true);
    const cible = carte.querySelector(".cible-logo");
    const image = carte.querySelector(".carte-img");
    const zoneVide = carte.querySelector(".logo-vide");

    // Identification de la zone.
    cible.id = `cible${club.id}`;

    // Nom du club.
    carte.querySelector(".carte-header").textContent = club.nom;

    // Logo.
    image.alt = `Logo du club ${club.nom}`;

    // Vérification de la présence du logo via la chaîne club.logo
    if (club.logo) {
        image.src = `${repertoire}/${encodeURIComponent(club.logo)}?t=${Date.now()}`;
        image.hidden = false;
        zoneVide.hidden = true;
    } else {
        image.removeAttribute("src");
        image.hidden = true;
        zoneVide.hidden = false;
    }

    // Sélection d'un nouveau logo.
    cible.addEventListener("click", () => {
        idClub = club.id;
        fichier.click();
    });

    // Glisser-déposer.
    cible.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    cible.addEventListener("drop", (event) => {
        event.preventDefault();
        idClub = club.id;
        const file = event.dataTransfer.files[0];
        if (file) {
            controlerFichier(file);
        }
    });

    return carte;
}

/**
 * Contrôle le fichier sélectionné.
 *
 * @param {File} file
 */
function controlerFichier(file) {
    // Efface les erreurs précédentes.
    effacerLesErreurs();

    // Vérification de la taille et de l'extension.
    if (!fichierValide(file, maxSize, lesExtensions)) {
        return;
    }

    // Vérification de l'image et redimensionnement éventuel.
    verifierImage(file, redimensionner, largeurMax, hauteurMax, majLogo);
}

/**
 * Remplace le logo du club.
 *
 * @param {File} file
 */
function majLogo(file) {
    const formData = new FormData();
    formData.append("fichier", file);
    formData.append("primaryKey", idClub);

    appelAjax({
        url: "ajax/majlogo.php",
        data: formData,
        success: (data) => {
            const cible = document.getElementById(`cible${idClub}`);
            const image = cible.querySelector(".carte-img");
            const zoneVide = cible.querySelector(".logo-vide");

            // Construction de l'URL du nouveau logo.
            image.src = `${repertoire}/${encodeURIComponent(data.logo)}?t=${Date.now()}`;

            // Force le navigateur à prendre en compte la nouvelle image.
            image.onload = () => {
                image.hidden = false;
                zoneVide.hidden = true;
            };
            afficherToast("Le logo a été mis à jour");
        }
    });
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

const fragment = document.createDocumentFragment();

for (const club of lesClubs) {
    fragment.appendChild(creerCarte(club));
}

lesCartes.appendChild(fragment);