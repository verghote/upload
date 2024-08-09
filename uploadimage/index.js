"use strict";

import {
    configurerFormulaire,
    afficherSucces,
    afficherErreur,
    fichierValide,
    confirmer, afficherErreurSaisie,
} from "https://cdn.jsdelivr.net/gh/verghote/composant/fonction.js"

// variables globales
/* global lesPhotos, lesParametres, token */

// fichier téléversé
let leFichier = null;

// récupération des élements sur l'interface
const cible = document.getElementById('cible');
const fichier = document.getElementById('fichier');
const listePhoto = document.getElementById('listePhoto');
const add = document.getElementById('add');
const formulaire =  document.getElementById('formulaire');
const btnAjouter = document.getElementById('btnAjouter');

// procédures événementielles

// Déclencher le clic sur le champ de type file lors d'un clic dans la zone cible
cible.onclick = () => fichier.click();

// // ajout du glisser déposer dans la zone cible
cible.ondragover = (e) => e.preventDefault();
cible.ondrop = (e) => {

};

// Lancer la fonction controlerFichier si un fichier a été sélectionné dans l'explorateur
fichier.onchange = () => {

};

// Lancer la demande d'ajout
btnAjouter.onclick = () => {

};

// afficher le formulaire d'ajout
add.onclick = () => {
    if (formulaire.style.display === 'block') {
        formulaire.style.display = 'none';
    } else {
        formulaire.style.display = 'block';
    }
};

add.onmouseover = () => {
    formulaire.style.display = 'block';
};

// contrôle des données
configurerFormulaire(true);

// initialisation des données sur l'interface
fichier.accept = lesParametres.accept;
afficher();

/**
 * Affichage des fichiers du répertoire
 */
function afficher() {
    listePhoto.innerHTML = '';
    const row = document.createElement('div');
    row.classList.add('row');
    for (const fichier of lesPhotos) {
        let nomFichier = fichier.nomFichier;
        let src = fichier.src;
        const col = document.createElement('div');
        col.classList.add("col-xl-4", "col-lg-6");

        const carte = document.createElement('div');
        carte.id = nomFichier;
        carte.classList.add('card', 'mb-3');

        const entete = document.createElement('div');
        entete.classList.add('card-header');

        // génération de l'icône de suppression avec un alignement à droite
        let i = document.createElement('i');


        // intégration du nom du fichier dans l'entête avec un alignement à gauche
        const nom = document.createElement('div');
        nom.classList.add('float-start');
        nom.innerText = nomFichier;
        entete.appendChild(nom);

        // intégration de l'entête dans la carte
        carte.appendChild(entete);

        // génération du corps de la carte
        const corps = document.createElement('div');
        corps.classList.add('card-body');
        corps.style.height = '180px';

        // génération d'une balise img pour afficher la photo dans le corps de la carte
        const img = document.createElement('img');


        // intégration de l'image dans le corps
        corps.appendChild(img);

        // intégration du corps dans la carte
        carte.appendChild(corps);

        col.appendChild(carte);
        row.appendChild(col);
    }
    listePhoto.appendChild(row);
}

/**
 * Contrôle le document sélectionné au niveau de son extension et de sa taille
 * Affiche le nom du fichier dans le champ nomFichier ou un message d'erreur sous le champ fichier
 * Renseigne la variable globale leFichier
 * @param file Objet file téléversé
 */
function controlerFichier(file) {
    // mise en forme de l'interface


    // définition des contraintes sur le fichier téléversé
    const controle = {
        taille: lesParametres.maxSize,
        lesExtensions: lesParametres.extensions,
    };
    if (!fichierValide(file, controle)) {


    }
    // vérification des dimensions
    // création d'un objet image

    // chargement de l'image

    // il faut attendre que l'image soit chargée pour effectuer les contrôles
    img.onload = function () {
        if (1) {
            let msg = "Les dimensions de l'image (" + img.width + " * " + img.height + ") dépassent les dimensions autorisées (" + lesParametres.width + " * " + lesParametres.height + ")";
            afficherErreurSaisie('fichier', msg);
        } else {

        }
    };
    // si l'image n'est pas chargée (il ne s'agit donc pas  d'un fichier image)
    img.onerror = function () {
        afficherErreurSaisie('fichier', "Il ne s'agit pas d'un fichier image");
    };
}

function ajouter() {
    let monFormulaire = new FormData();
    monFormulaire.append('fichier', leFichier);
    monFormulaire.append('token', token);
    $.ajax({
        url: 'ajax/ajouter.php',
        method: 'post',
        async : false,
        data: monFormulaire,
        processData: false,
        contentType: false,
        dataType: "json",
        success: (data) => {
            if (data.success) {
                afficherSucces("Le fichier a été ajouté dans la photothèque ");
                // ajouter  dans le tableau

                // trier le tableau sur le nom

                // Mise à jour de l'interface

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


/**
 * Lance la suppression côté serveur
 * @param {string} nomFichier  nom du fichier à supprimer
 */
function supprimer(nomFichier) {
    $.ajax({
        url: 'ajax/supprimer.php',
        method: 'POST',
        data: {
            nomFichier: nomFichier,
            token : token
        },
        dataType: 'json',
        success: (data) => {
            if (data.success) {
                afficherSucces(data.success);
                // suppression dans le tableau des photos :


                // mise à jour de l'interface

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




