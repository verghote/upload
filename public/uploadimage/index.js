"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {configurerFormulaire, effacerLesErreurs} from "/composant/fonction/formulaire.js";
import {fichierValide, verifierImage} from "/composant/fonction/fichier.js";
import {afficherToast, confirmer} from "/composant/fonction/afficher.js";
import {getData} from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

const lesFichiers = getData('lesFichiers');
const lesParametres = getData("lesParametres");
const repertoire = getData('repertoire');

// Extraction des paramètres
const lesExtensions = lesParametres.lesExtensions;
const maxSize = lesParametres.maxSize;
const redimensionner = lesParametres.resized;
const maxWidth = lesParametres.maxWidth;
const maxHeight = lesParametres.maxHeight;

// Récupération des éléments de l'interface
const cible = document.getElementById('cible');
const fichier = document.getElementById('fichier');
const lesCartes = document.getElementById('lesCartes');
const tplCartePhoto = document.getElementById('tplCartePhoto');

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

// Déclencher le clic sur le champ de type file lors d'un clic dans la zone cible
cible.onclick = () => fichier.click();

// Ajout du glisser-déposer dans la zone cible avec feedback visuel
cible.ondragover = (e) => {
    e.preventDefault();
    cible.classList.add('dragover');
};

cible.ondragleave = (e) => {
    e.preventDefault();
    cible.classList.remove('dragover');
};

cible.ondrop = (e) => {
    e.preventDefault();
    cible.classList.remove('dragover');
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

/**
 * Affichage des fichiers du répertoire
 * @param {Array<string>} data - Liste des noms de fichiers
 */
function afficher(data) {
    const fragment = document.createDocumentFragment();
    for (const nomFichier of data) {
        fragment.appendChild(creerCartePhoto(nomFichier));
    }
    // Vide l'élément 'lesCartes' et y insère le fragment en une seule opération
    lesCartes.replaceChildren(fragment);
}

/**
 * Crée une carte affichant une photo à partir de la balise <template>.
 *
 * @param {string} nomFichier - Le nom du fichier image à afficher.
 * @returns {HTMLElement} - Élément DOM représentant la carte.
 */
function creerCartePhoto(nomFichier) {
    // Clonage du contenu du template
    const clone = tplCartePhoto.content.firstElementChild.cloneNode(true);

    // Identification de la carte
    clone.id = nomFichier;

    // Récupération des éléments internes du template
    const nom = clone.querySelector('.nom-fichier');
    const img = clone.querySelector('img');
    const btnSupprimer = clone.querySelector('.bouton-supprimer');

    // Définition des contenus et attributs
    nom.textContent = nomFichier;
    img.src = `${repertoire}/${nomFichier}`;
    img.alt = nomFichier;

    // Configuration de la suppression
    btnSupprimer.onclick = () => {
        confirmer(() => supprimer(nomFichier));
    };

    return clone;
}

/**
 * Contrôle le fichier sélectionné
 * @param {File} file
 */
function controlerFichier(file) {
    effacerLesErreurs();

    if (!fichierValide(file, maxSize, lesExtensions)) {
        return;
    }
    verifierImage(file, redimensionner, maxWidth, maxHeight, () => ajouter(file));
}

/**
 * Ajoute un fichier via AJAX
 * @param {File} file
 */
function ajouter(file) {
    const formData = new FormData();
    formData.append('fichier', file);

    appelAjax({
        url: 'ajax/ajouter.php',
        data: formData,
        success: (data) => {
            afficherToast("La photo a été ajoutée dans la bibliothèque");
            afficher(data);
        }
    });
}

/**
 * Lance la suppression côté serveur
 * @param {string} nomFichier
 */
function supprimer(nomFichier) {
    effacerLesErreurs();

    appelAjax({
        url: 'ajax/supprimer.php',
        data: {
            nomFichier: nomFichier,
        },
        success: (data) => {
            afficherToast("La photo a été supprimée de la bibliothèque");
            afficher(data);
        }
    });
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

configurerFormulaire();
afficher(lesFichiers);