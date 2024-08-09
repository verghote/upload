"use strict";

import {
    configurerFormulaire,
    afficherErreurSaisie,
    fichierValide,
    donneesValides,
    effacerLesErreurs,
    afficherErreur, retournerVers
} from "https://cdn.jsdelivr.net/gh/verghote/composant/fonction.js"

// variables globales
/* global lesParametres, token*/
let leFichier = null; // contient le fichier uploadé pour l'ajout

// récupération des élements sur l'interface
const fichier = document.getElementById('fichier');
const nomFichier = document.getElementById('nomFichier');
const btnFichier = document.getElementById('btnFichier');
const btnAjouter = document.getElementById('btnAjouter');

const titre = document.getElementById('titre');

// Procédures événementielles

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

};

// Contrôle des données
configurerFormulaire(true);

/**
 * Contrôle le document sélectionné au niveau de son extension et de sa taille
 * Affiche le nom du fichier ou un message d'erreur
 * Renseigne la variable globale leFichier
 * @param file Objet file téléversé
 */
function controlerFichier(file) {
    effacerLesErreurs();
    // définition des contraintes sur le fichier téléversé
    const controle = {

    };
    if (fichierValide(file, controle)) {

    } else {

    }
}

/**
 * ajout d'un document dans la table document et du document pdf associé dans le répertoire correspondant
 * En cas de succès retour sur la page index
 */
function ajouter() {
    let monFormulaire = new FormData();

    monFormulaire.append('fichier', leFichier);

    monFormulaire.append('token', token);
    $.ajax({
        url: '/ajax/ajouter.php',
        method: 'POST',
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

