"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {appelAjax} from "/composant/fonction/ajax.js";
import {configurerFormulaire, effacerLesErreurs, fichierValide, creerBoutonSuppression } from "/composant/fonction/formulaire.js";
import {afficherSousLeChamp, confirmer} from "/composant/fonction/afficher";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

/* global lesParametres, lesFichiers */

let leFichier = null; // contient le fichier uploadé pour l'ajout

const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const btnFichier = document.getElementById('btnFichier');
const btnAjouter = document.getElementById('btnAjouter');
const lesLignes = document.getElementById('lesLignes');

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
 * Affiche le nom du fichier dans la balise 'nomFichier' ou un message d'erreur sous le champ fichier
 * Renseigne la variable globale leFichier
 * @param file Objet file téléversé
 */
function controlerFichier(file) {
    effacerLesErreurs();
    if (fichierValide(file, lesParametres)) {
        nomFichier.textContent = file.name;
        leFichier = file;
    } else {
        leFichier = null;
        nomFichier.textContent = '';
    }
}

/**
 * Affichage des fichiers du répertoire
 */
function afficher(data) {
    lesLignes.innerHTML = '';
    for (const nomFichier of data) {
        const tr = lesLignes.insertRow();

        // Création de la cellule pour le bouton de suppression
        let  td = tr.insertCell();
        const btnSupprimer = creerBoutonSuppression(() => confirmer(() => supprimer(nomFichier)));
        td.appendChild(btnSupprimer);
        td.style.width = "30px";
        td.style.textAlign = "center";

        // Création de la cellule pour le nom du fichier avec lien
        td = tr.insertCell();
        const a = document.createElement('a');
        a.href = lesParametres.repertoire + '/' + nomFichier;
        a.target = 'doc';
        a.innerText = nomFichier;
        td.appendChild(a);
    }
}


/**
 * Demande l'ajout d'un fichier
 * En cas de succès la réponse contient la liste des fichiers du répertoire
 */
function ajouter() {
    effacerLesErreurs();
    // transfert du fichier vers le serveur dans le répertoire sélectionné
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
 * @param {string} nomFichier  nom du fichier à supprimer
 */
function supprimer(nomFichier) {
    effacerLesErreurs();
    appelAjax({
        url: 'ajax/supprimer.php',
        data : {nomFichier: nomFichier},
        success: (data) => afficher(data)
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

afficher(lesFichiers);