"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {afficherToast, confirmer} from '/composant/fonction/afficher.js';
import {fichierValide, effacerLesErreurs, creerBoutonRemplacer, creerBoutonSuppression } from "/composant/fonction/formulaire.js";
import {getTd, getTr} from "/composant/fonction/trtd.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesDocuments, lesParametres */

// conserver le nom du fichier à remplacer
let nomFichier;

const lesLignes = document.getElementById('lesLignes');
const fichier = document.getElementById('fichier');
fichier.accept = lesParametres.accept;

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

// sur la sélection d'un fichier
fichier.onchange = () => {
    effacerLesErreurs();
    if (fichier.files.length > 0) {
        let file = fichier.files[0];
        if (fichierValide(file, lesParametres)) {
            remplacer(file);
        }
    }
};

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Demande de suppression
 * @param {int} id id de l'enregistrement
 */
function supprimer(id) {
    appelAjax({
        url: 'ajax/supprimer.php',
        data: { id: id  },
        success: () => document.getElementById(id.toString())?.remove()
    });
}

/**
 * Remplace le fichier sur le serveur
 * @param file
 */
function remplacer(file) {
    // transfert du fichier vers le serveur dans le répertoire sélectionné
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('nomFichier', nomFichier);
    appelAjax({
        url: 'ajax/remplacer.php',
        data: formData,
        success: () => afficherToast("Opération réalisée avec succès")
    });
}

/**
 * Demande de modification de la valeur de la colonne titre
 * @param {object} input balise input
 * @param {int} id identifiant du document à modifier
 */
function modifierTitre(input, id) {
    appelAjax({
        url: '/ajax/modifiercolonne.php',
        data: {
            table: 'document',
            colonne: 'titre',
            valeur: input.value,
            id: id
        },
        success: () => input.style.color = 'green'
    });
}

/**
 * Crée la colonne des actions
 * @param {number} id
 * @param {string} fichierNom
 * @returns {HTMLTableCellElement}
 */
function creerColonneAction(id, fichierNom) {
    const actionRemplacer = () => {
        nomFichier = fichierNom;
        fichier.click();
    };

    const actionSupprimer = () => confirmer(() => supprimer(id));

    const btnRemplacer = creerBoutonRemplacer(actionRemplacer);
    const btnSupprimer = creerBoutonSuppression(actionSupprimer);

    btnRemplacer.setAttribute('aria-label', 'Remplacer le document');
    btnSupprimer.setAttribute('aria-label', 'Supprimer le document');

    const tdAction = getTd('');
    tdAction.appendChild(btnRemplacer);
    tdAction.appendChild(btnSupprimer);

    return tdAction;
}

/**
 * Crée la colonne du titre
 * @param {number} id
 * @param {string} titre
 * @returns {HTMLTableCellElement}
 */
function creerColonneTitre(id, titre) {
    const inputTitre = document.createElement('input');
    inputTitre.type = 'text';
    inputTitre.maxLength = 100;
    inputTitre.minLength = 10;
    inputTitre.required = true;
    inputTitre.value = titre;
    inputTitre.setAttribute('aria-label', 'Titre du document');

    inputTitre.onchange = function () {
        if (this.checkValidity()) {
            modifierTitre(this, id);
        } else {
            this.style.color = 'red';
            this.reportValidity();
        }
    };

    const tdTitre = getTd('');
    tdTitre.appendChild(inputTitre);

    return tdTitre;
}

/**
 * Crée une ligne de tableau représentant un document
 * @param {Object} document
 * @returns {HTMLTableRowElement}
 */
function creerLigneDocument(document) {
    const {id, titre, fichier} = document;

    const tr = getTr([]);
    tr.id = id;

    // Création et ajout des colonnes
    tr.appendChild(creerColonneAction(id, fichier));
    tr.appendChild(creerColonneTitre(id, titre));

    return tr;
}


// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

// afficher le tableau des documents
for (const document of lesDocuments) {
    lesLignes.appendChild(creerLigneDocument(document));
}


