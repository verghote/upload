"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {
    configurerFormulaire,
    filtrerLaSaisie,
    donneesValides,
    fichierValide,
    verifierImage,
    effacerLesErreurs
} from "/composant/fonction/formulaire.js";
import {retournerVersApresConfirmation} from "/composant/fonction/afficher.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesParametres */

// récupération des éléments de l'interface
let id = document.getElementById('id');
let nom = document.getElementById('nom');

const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const cible = document.getElementById('cible');
const label = document.getElementById('label');

let btnAjouter = document.getElementById('btnAjouter');

// fichier téléversé
let leFichier = null;


// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------
// demande d'ajout d'un club
btnAjouter.onclick = () => {
    effacerLesErreurs();
    if (donneesValides()) {
        ajouter();
    }
};


// Déclencher le clic sur le champ de type file lors d'un clic dans la zone cible
cible.onclick = () => fichier.click();

// // ajout du glisser déposer dans la zone cible
cible.ondragover = (e) => e.preventDefault();
cible.ondrop = (e) => {
    e.preventDefault();
    controlerFichier(e.dataTransfer.files[0]);
};

// Lancer la fonction controlerFichier si un fichier a été sélectionné dans l'explorateur
fichier.onchange = () => {
    if (fichier.files.length > 0) {
        controlerFichier(fichier.files[0]);
    }
};

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

function ajouter() {
    // Efface les erreurs précédentes
    effacerLesErreurs();
    const formData = new FormData();
    formData.append('id', id.value);
    formData.append('nom', nom.value);
    // la photo n'est pas obligatoire
    if (leFichier !== null) {
        formData.append('fichier', leFichier);
    }
    appelAjax({
        url: 'ajax/ajouter.php',
        data: formData,
        success: () => retournerVersApresConfirmation("Le club a été ajouté", '../liste')
    });
}

/**
 * Contrôle le fichier sélectionné au niveau de son extension et de sa taille
 * Contrôle les dimensions de l'image si le redimensionnement n'est pas demandé
 * Affiche le nom du fichier ou un message d'erreur
 * @param file {object} fichier à ajouter
 */

function controlerFichier(file) {
    // Efface les erreurs précédentes
    effacerLesErreurs();
    // Vérification de taille et d'extension
    if (!fichierValide(file, lesParametres)) {
        return;
    }
    // Vérifications spécifiques pour un fichier image
    // la fonction de rappel reçoit le fichier et l'image éventuellement redimensionnée si le  redimensionnement est demandé
    verifierImage(file, lesParametres,
        (file, img) => {
            nomFichier.innerText = file.name;
            leFichier = file;
            cible.innerHTML = "";
            cible.appendChild(img);
        }
    );
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

configurerFormulaire();
filtrerLaSaisie('nom', /[0-9A-Za-zÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿ '-.]/);

fichier.accept = lesParametres.accept;
label.innerText = lesParametres.label;

// initialisation code
id.value = '080';
