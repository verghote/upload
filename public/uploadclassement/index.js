"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {configurerFormulaire, effacerLesErreurs} from "/composant/fonction/formulaire.js";
import {fichierValide} from "/composant/fonction/fichier.js";
import {afficherSousLeChamp, confirmer} from "/composant/fonction/afficher.js";
import {getData} from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

const lesFichiers = getData('lesFichiers');
const repertoire = getData('repertoire');
const lesParametres = getData('lesParametres');

// Extraction des paramètres
const maxSize = lesParametres.maxSize;
const lesExtensions = lesParametres.lesExtensions;

let leFichier = null; // contient le fichier uploadé pour l'ajout

const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const btnFichier = document.getElementById('btnFichier');
const btnAjouter = document.getElementById('btnAjouter');
const lesLignes = document.getElementById('lesLignes');
const tplLigneDocument = document.getElementById('tplLigneDocument');

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

// Déclencher le clic sur le champ de type file lors d'un clic sur le bouton btnFichier ou sur nomFichier
btnFichier.onclick = () => fichier.click();
nomFichier.onclick = () => fichier.click();

// Ajout du glisser-déposer sur le champ nomFichier
nomFichier.ondragover = (e) => e.preventDefault();
nomFichier.ondrop = (e) => {
    e.preventDefault();
    controlerFichier(e.dataTransfer.files[0]);
};

// Lancer la fonction controlerFichier si un fichier a été sélectionné dans l'explorateur
fichier.onchange = () => {
    if (fichier.files.length > 0) {
        controlerFichier(fichier.files[0]);
    }
};

// Lancer la demande d'ajout
btnAjouter.onclick = () => {
    if (leFichier === null) {
        afficherSousLeChamp('fichier', 'Veuillez sélectionner ou faire glisser un fichier');
    } else {
        ajouter();
    }
};

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Contrôle le document sélectionné au niveau de son extension et de sa taille
 * @param {File} file Objet file téléversé
 */
function controlerFichier(file) {
    effacerLesErreurs();
    if (fichierValide(file, maxSize, lesExtensions)) {
        nomFichier.textContent = file.name;
        leFichier = file;
    } else {
        leFichier = null;
        nomFichier.textContent = '';
    }
}

/**
 * Affichage des fichiers du répertoire dans le tableau
 * @param {Array<string>} data - Liste des noms de fichiers
 */
function afficher(data) {
    const fragment = document.createDocumentFragment();

    for (const nomFichier of data) {
        fragment.appendChild(creerLigneDocument(nomFichier));
    }

    lesLignes.replaceChildren(fragment);
}

/**
 * Crée un élément <tr> à partir du template HTML
 * @param {string} nomFichier
 * @returns {HTMLTableRowElement}
 */
function creerLigneDocument(nomFichier) {
    const clone = tplLigneDocument.content.firstElementChild.cloneNode(true);

    const lien = clone.querySelector('.lien-document');
    const btnSupprimer = clone.querySelector('.btn-supprimer');

    lien.href = `${repertoire}/${nomFichier}`;
    lien.textContent = nomFichier;

    btnSupprimer.onclick = () => confirmer(() => supprimer(nomFichier));

    return clone;
}

/**
 * Demande l'ajout d'un fichier
 */
function ajouter() {
    effacerLesErreurs();
    const formData = new FormData();
    formData.append('fichier', leFichier);

    appelAjax({
        url: 'ajax/ajouter.php',
        data: formData,
        success: afficher
    });
}

/**
 * Lance la suppression côté serveur
 * @param {string} nomFichier - Nom du fichier à supprimer
 */
function supprimer(nomFichier) {
    effacerLesErreurs();
    appelAjax({
        url: 'ajax/supprimer.php',
        data: {nomFichier: nomFichier},
        success: afficher
    });
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

configurerFormulaire();
afficher(lesFichiers);