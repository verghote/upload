"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {afficherToast, confirmer} from "/composant/fonction/afficher.js";
import {effacerLesErreurs} from "/composant/fonction/formulaire.js";
import {fichierValide} from "/composant/fonction/fichier.js";
import {getData} from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

// Données des documents
const lesDocuments = getData('lesDocuments');
const lesParametres = getData('lesParametres');

// Paramètres du téléversement
const maxSize = lesParametres.maxSize ;
const lesExtensions = lesParametres.extensions;

// Identifiant du document dont le fichier PDF doit être remplacé
let idDocument;

// Éléments du DOM
const lesLignes = document.getElementById('lesLignes');
const fichier = document.getElementById('fichier');
const templateLigneDocument = document.getElementById('templateLigneDocument');

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

// Sur la sélection d'un fichier
fichier.onchange = () => {
    effacerLesErreurs();
    if (fichier.files.length > 0) {
        const file = fichier.files[0];
        if (fichierValide(file, maxSize, lesExtensions)) {
            remplacer(file);
        }
    }
};

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Demande de suppression d'un document.
 *
 * @param {number} id Identifiant du document.
 */
function supprimer(id) {
    appelAjax({
        url: 'ajax/supprimer.php',
        data: {
            primaryKey: id
        },
        success: (data) => {
            document.getElementById('document' + id.toString())?.remove();
            afficherToast(data.message);
        }
    });
}

/**
 * Remplace le fichier sur le serveur.
 *
 * @param {File} file Fichier à téléverser.
 */
function remplacer(file) {
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('primaryKey', idDocument);
    appelAjax({
        url: 'ajax/remplacer.php',
        data: formData,
        success: (data) => afficherToast(data.message)
    });
}

/**
 * Demande de modification du titre d'un document.
 *
 * @param {HTMLInputElement} input Champ contenant le nouveau titre.
 * @param {number} id Identifiant du document.
 */
function modifierTitre(input, id) {
    appelAjax({
        url: 'ajax/modifiertitre.php',
        data: {
            primarykey: id,
            columns: {
                titre: input.value
            }
        },
        success: (data) => {
            afficherToast(data.message);
            input.style.color = 'green';
        }
    });
}

/**
 * Crée une ligne de tableau à partir du template HTML.
 *
 * Le template définit la structure HTML de la ligne.
 * JavaScript se contente d'y injecter les données et les comportements.
 *
 * @param {Object} doc Document à afficher.
 * @returns {HTMLTableRowElement} Ligne de tableau créée.
 */
function creerLigneDocument(doc) {

    // Déstructuration de l'objet pour extraire les propriétés nécessaires
    const {id, titre} = doc;

    // Clone du contenu du template
    const fragment = templateLigneDocument.content.cloneNode(true);

    // Récupération des éléments de la ligne
    const tr = fragment.querySelector('tr');
    tr.id = 'document' + id;

    // Récupération des éléments dynamiques du template.
    const btnRemplacer = tr.querySelector('.btn-remplacer');
    const btnSupprimer = tr.querySelector('.btn-supprimer');
    const inputTitre = tr.querySelector('[data-champ="titre"]');

    const lienAfficher = tr.querySelector('.lien-afficher-pdf');
    const iconeAbsent = tr.querySelector('.icone-fichier-absent');

    // Vérification de la présence du fichier sur le serveur
    if (doc.present) {
        lienAfficher.href = `../afficher.php?id=${doc.id}`;
        lienAfficher.classList.remove('d-none');
    } else {
        iconeAbsent.classList.remove('d-none');
        iconeAbsent.title = "Fichier non trouvé sur le serveur";
        iconeAbsent.setAttribute('aria-label', "Fichier non trouvé sur le serveur");
        tr.querySelector('td').classList.add('fichier-absent');
        tr.querySelector('td').title = "Fichier manquant sur le serveur";
    }

    // -------------------------------------------------------------------------------
    // Événement bouton remplacer
    // -------------------------------------------------------------------------------
    btnRemplacer.onclick = () => {
        idDocument = id;
        fichier.click();
    };

    // -------------------------------------------------------------------------------
    // Événement bouton supprimer
    // -------------------------------------------------------------------------------
    btnSupprimer.onclick = () => {
        confirmer(() => supprimer(id));
    };

    // -------------------------------------------------------------------------------
    // Champ titre
    // -------------------------------------------------------------------------------
    inputTitre.value = titre;
    inputTitre.onchange = function () {
        if (this.checkValidity()) {
            modifierTitre(this, id);
        } else {
            this.style.color = 'red';
            this.reportValidity();
        }
    };

    return tr;
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------


for (const document of lesDocuments) {
    lesLignes.appendChild(creerLigneDocument(document));
}