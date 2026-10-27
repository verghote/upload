"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {getData} from "/composant/fonction/page.js";
import {appelAjax} from "/composant/fonction/ajax.js";
import {
    configurerFormulaire,
    effacerLesErreurs,
    filtrerLaSaisie,
    donneesValides,
} from "/composant/fonction/formulaire.js";
import {fichierValide, verifierImage} from "/composant/fonction/fichier.js";
import {retournerVersApresConfirmation} from "/composant/fonction/afficher.js";

// -----------------------------------------------------------------------------------
// Récupération de la configuration
// -----------------------------------------------------------------------------------

const lesParametres = getData('lesParametres');

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

// Paramètres du téléversement issus de config/club.php
const lesExtensions = lesParametres.lesExtensions;
const maxSize = lesParametres.maxSize;
const redimensionner = lesParametres.resized;
const width = lesParametres.maxWidth;
const height = lesParametres.maxHeight;

// Récupération des éléments de l'interface
const id = document.getElementById('id');
const nom = document.getElementById('nom');

const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const cible = document.getElementById('cible');

const btnAjouter = document.getElementById('btnAjouter');

// Fichier téléversé
let leFichier = null;

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

// Demande d'ajout d'un club
btnAjouter.onclick = () => {
    effacerLesErreurs();
    if (donneesValides()) {
        ajouter();
    }
};

// Déclencher le clic sur le champ de type file lors d'un clic dans la zone cible
cible.onclick = () => fichier.click();

// Ajout du glisser-déposer dans la zone cible
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
    effacerLesErreurs();
    const formData = new FormData();
    formData.append('id', id.value);
    formData.append('nom', nom.value);

    // La photo n'est pas obligatoire
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
    effacerLesErreurs();

    // Vérification de taille et d'extension
    if (!fichierValide(file, maxSize, lesExtensions)) {
        return;
    }

    // Vérifications spécifiques pour un fichier image
    verifierImage(file, redimensionner, width, height,
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

// Initialisation du code
id.value = '080';