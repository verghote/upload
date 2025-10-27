"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {retournerVers, afficherSousLeChamp} from '/composant/fonction/afficher.js';
import {
    configurerFormulaire,
    donneesValides,
    fichierValide,
    effacerLesErreurs
} from "/composant/fonction/formulaire.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesParametres */

let leFichier = null; // contient le fichier uploadé pour l'ajout

// récupération des élements sur l'interface
const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const titre = document.getElementById('titre');
const btnFichier = document.getElementById('btnFichier');
const btnAjouter = document.getElementById('btnAjouter');

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

// Déclencher le clic sur le champ de type file lors d'un clic sur le bouton btnFichier
btnFichier.onclick = () => fichier.click();

// ajout du glisser déposer sur le champ nomFichier
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

btnAjouter.onclick = () => {
    effacerLesErreurs();
    if (leFichier === null) {
        afficherSousLeChamp('fichier', 'Veuillez sélectionner ou faire glisser un fichier pdf');
    }
    if (donneesValides() && leFichier !== null) {
        ajouter();
    }
};

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Contrôle le document sélectionné au niveau de son extension et de sa taille
 * Affiche le nom du fichier dans la balise 'nomFichier' ou un message d'erreur sous le champ fichier
 * Renseigne la variable globale leFichier
 * @param file Objet file téléversé
 */
function controlerFichier(file) {
    effacerLesErreurs();
    if (fichierValide(file, lesParametres)) {
        nomFichier.textContent = file.name;
        leFichier = file;
        if (titre.value.length === 0) {
            titre.value = file.name.slice(0, -4);
        }
    } else {
        leFichier = null;
        nomFichier.textContent = '';
    }
}

/**
 * ajout d'un document dans la table document et du document pdf associé dans le répertoire correspondant
 * En cas de succès retour sur la page index
 */
function ajouter() {
    effacerLesErreurs();
    let formData = new FormData();
    formData.append('fichier', leFichier);
    formData.append('titre', titre.value);
    appelAjax({
        url: 'ajax/ajouter.php',
        data: formData,
        success: () => retournerVers("Document ajouté", '../liste')
    });
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

// Contrôle des données
configurerFormulaire();

// initialisation des données sur l'interface
fichier.accept = lesParametres.accept;

let label = document.querySelector(`label[for="nomFichier"]`);
label.innerText = lesParametres.label;

