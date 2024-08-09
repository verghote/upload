"use strict";

import {
    afficherErreur,
    afficherErreurSaisie,
    configurerFormulaire,
    donneesValides,
    effacerLesErreurs,
    fichierValide,
    filtrerLaSaisie,
    retournerVers,
} from "https://cdn.jsdelivr.net/gh/verghote/composant/fonction.js";

/* global lesParametres, token */

// variable globale

// fichier téléversé
let leFichier = null;

// récupération des élements sur l'interface
const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const cible = document.getElementById('cible');
const btnAjouter = document.getElementById('btnAjouter');

const nom = document.getElementById('nom');
const prenom = document.getElementById('prenom');

// procédures événementielles

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

btnAjouter.onclick = () => {
    effacerLesErreurs();
    if (donneesValides()) {
        ajouter();
    }
};

// controle des données
configurerFormulaire();
filtrerLaSaisie('nom', /[A-Za-z ]/);
nom.onkeyup = () => nom.value = nom.value.toUpperCase();
nom.focus();

// traitements associés au champ prenom
filtrerLaSaisie('prenom', /[A-Za-zÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿ '-]/);

/**
 * Contrôle le fichier sélectionné au niveau de son extension et de sa taille
 * @param file {object} fichier à ajouter
 */
function controlerFichier(file) {
    // mise en forme de l'interface
    afficherErreurSaisie('fichier', '');
    leFichier = null;
    nomFichier.innerText = '';
    cible.innerHTML = "";
    // définition des contraintes sur le fichier téléversé
    const controle = {
        taille: lesParametres.maxSize,
        lesExtensions: lesParametres.extensions,
    };
    if (!fichierValide(file, controle)) {
        afficherErreurSaisie('fichier', controle.reponse);
        return false;
    }
    // vérification des dimensions
    // création d'un objet image
    let img = new Image();
    // chargement de l'image
    img.src = window.URL.createObjectURL(file);
    // il faut attendre que l'image soit chargée pour effectuer les contrôles
    img.onload = function () {
        if (img.width > lesParametres.width || img.height > lesParametres.height) {
            let msg = "Les dimensions de l'image (" + img.width + " * " + img.height + ") dépassent les dimensions autorisées (" + lesParametres.width + " * " + lesParametres.height + ")";
            afficherErreurSaisie('fichier', msg);
        } else {
            nomFichier.innerText = file.name;
            leFichier = file;
            cible.appendChild(img);
        }
    };
    // si l'image n'est pas chargée (cas d'un fichier non image)
    img.onerror = function () {
        afficherErreurSaisie('fichier', "Il ne s'agit pas d'un fichier image");
    };
}

/**
 * contrôle et demande d'ajout d'un nouvel étudant
 * La photo est optionnelle
 */
function ajouter() {
    const monFormulaire = new FormData();
    monFormulaire.append('table', 'etudiant');
    monFormulaire.append('nom', nom.value);
    monFormulaire.append('prenom', prenom.value);
    monFormulaire.append('token', token);
    // la photo n'est pas obligatoire



    $.ajax({
        url: '/ajax/ajouter.php',
        type: 'POST',
        async : false,
        data: monFormulaire,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: (data) => {
            if (data.success) {

            } else if (data.error) {
                for (const key in data.error) {
                    const message = data.error[key];
                    if (key === 'system') {
                        afficherErreur("Erreur système détectée, contacter l'administrateur du site");
                    } else if (key === 'global') {
                        afficherErreur(message);
                    } else {
                        afficherErreurSaisie(key, message);
                    }
                }
            }
        },
        error: reponse => {
            afficherErreur('Une erreur imprévue est survenue');
            console.log(reponse.responseText);
        }
    });
}



