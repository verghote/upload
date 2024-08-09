"use strict";

import {
    verifier,
    afficherErreur,
    fichierValide,
    confirmer, corriger, afficherErreurSaisie
} from "https://cdn.jsdelivr.net/gh/verghote/composant/fonction.js";

// variable globale
/* global lesEtudiants, lesParametres, token */

// idEtudiant de l'étudiant en cours de modification
let idEtudiant;

const listeEtudiants = document.getElementById('listeEtudiants');
const fichier = document.getElementById('fichier');

// traitement du champ file associé aux modifications de photos
fichier.onchange = function () {
    if (this.files.length > 0) {
        controlerFichier(this.files[0]);
    }
};

afficher();

/**
 * Affichage des coordfoné&es des étudiants et de leur photo dans des cadres
 * Utilisation de balises input pour permettre la modification des coordonnées
 */
function afficher() {
    listeEtudiants.innerHTML = '';
    const row = document.createElement('div');
    row.classList.add('row');
    for (const etudiant of lesEtudiants) {
        const id = etudiant.id;
        const col = document.createElement('div');
        col.classList.add('col-xl-3', 'col-lg-4', 'col-md-4', 'col-sm-6', 'col-12');
        const carte = document.createElement('div');
        carte.id = id;
        carte.classList.add('card', 'mb-3');

        // génération de l'entête : comprenant 2 icônes pour supprimer l'étudiant et effacer la photo
        const entete = document.createElement('div');
        entete.classList.add('card-header', 'bg-text-center', 'd-flex', 'justify-content-around');
        // ajout de l'icône de suppression en haut à droite du cadre
        let i = document.createElement('i');


        // ajout de l'icône permettant de supprimer la photo
        // l'icône sera cachée s'il n'y a pas de photo
        // l'icône doit posséder un identifiant afin de pouvoir le masquer/afficher


        carte.appendChild(entete);

        // génération du corps de la carte : comprenant 2 balises input pour le nom et le prénom
        const corps = document.createElement('div');
        corps.classList.add('card-body', 'p-3', 'd-flex', 'flex-column', 'align-items-center');

        // ajout d'une balise input pour la modification du nom
        const inputNom = document.createElement('input');
        inputNom.classList.add('form-control');
        inputNom.type = 'text';
        inputNom.value = etudiant.nom;
        inputNom.dataset.old = etudiant.nom;
        inputNom.pattern = '^[A-Z]([A-Z\' ]*[A-Z])*$';
        inputNom.maxlength = 20;
        inputNom.onchange = function () {
            this.value = this.value.replace(/\s{2,}/, ' ').trim().toUpperCase();
            if (this.value !== this.dataset.old && verifier(this)) {
                modifierColonne('nom', this, etudiant.id);
            }
        };
        corps.appendChild(inputNom);

        //ajout d'une balise input pour la modification du prénom
        const inputPrenom = document.createElement('input');
        inputPrenom.classList.add('form-control', 'mt-2');
        inputPrenom.type = 'text';
        inputPrenom.value = etudiant.prenom;
        inputPrenom.dataset.old = etudiant.prenom;

        inputPrenom.maxlength = 20;
        inputPrenom.onchange = function () {
            this.value = this.value.replace(/\s{2,}/, ' ').trim();
            if (this.value !== this.dataset.old && verifier(this)) {
                modifierColonne('prenom', this, etudiant.id);
            }
        };
        corps.appendChild(inputPrenom);

        // Ajout de la zone d'upload
        let div = document.createElement('div');


        // Si la photo existe on la place dans la zone
        if (etudiant.present) {

        }
        // définition des événements pour gérer le téléversement et le glisser déposer
        div.onclick = function () {

        };
        div.ondragover = function (e) {

        };
        div.ondrop = function (e) {

        };
        corps.appendChild(div);
        carte.appendChild(corps);
        col.appendChild(carte);
        row.appendChild(col);
        listeEtudiants.appendChild(row);
    }
}

function modifierColonne(colonne, input, id) {
    $.ajax({
        url: '/ajax/modifiercolonne.php',
        method: 'post',
        data: {
            table : 'etudiant',
            colonne: colonne,
            valeur: input.value,
            id: id,
            token: token
        },
        dataType: 'json',
        success: data => {
            if (data.success) {
                input.dataset.old = input.value;
                input.style.color = 'green';
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
 * Suppression de l'étudiant dans la table etudiant et suppression du fichier associé dans le répertoire photo
 * @param id  identifiant de l'étudiant à supprimer
 */
function supprimer(id) {
    $.ajax({
        url: '/ajax/supprimer.php',
        method: 'POST',
        data: {
            table: 'etudiant',
            id: id,
            token: token
        },
        dataType: 'json',
        success: data => {
            if (data.success) {
                // Mise à jour de l'interface : on retire l'étudiant dans la liste et on relance l'affichage
                lesEtudiants.splice(lesEtudiants.findIndex(x => x.id === id), 1);
                afficher();
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


function controlerFichier(file) {
    // définition des contraintes sur le fichier téléversé
    const controle = {
        taille: lesParametres.maxSize,
        lesExtensions: lesParametres.extensions,
    };
    if (!fichierValide(file, controle)) {
        afficherErreur(controle.reponse);
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
            afficherErreur(msg);
            return false;
        } else {

        }
    };
    // si l'image n'est pas chargée (cas d'un fichier non image)
    img.onerror = function () {
        afficherErreur("Il ne s'agit pas d'un fichier image");
    };
}

/**
 * contrôle la photo sélectionnée et lance la demande de modification côté serveur
 * @param   {object} file objet de type file contenant l'image à contrôler
 * @param   {object} img objet de type image contenant l'image à afficher
 */
function remplacer(file, img) {
    const monFormulaire = new FormData();

    monFormulaire.append('token', token);
    $.ajax({
        url: 'ajax/remplacer.php',
        type: 'POST',
        data: monFormulaire,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function (data) {
            if (data.success) {
                // on place la nouvelle photo dans le cadre cible correspondant


                // on affiche l'icône d'effacement

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
        error: (reponse) => {
            console.log(reponse.responseText);
        }
    });
}


// ------------------------------------------------
// fonction de traitement concernant la suppression de la photo
// ------------------------------------------------

/**
 * Demande d'effacement de la photo de l'étudiant
 * @param {int}id : identifiant de l'étudiant
 */
function supprimerPhoto(id) {
    $.ajax({
        url: 'ajax/supprimer.php',
        type: 'POST',
        data: {
            id: id,
            token : token
        },
        dataType: 'json',
        success: data => {
            if (data.success) {
                // On efface l'image de la cible 'photo' + id sur l'interface

                // on efface l'icône de la poubelle

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

