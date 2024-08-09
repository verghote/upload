"use strict";

import {
    confirmer,
    afficherSucces,
    genererMessage,
    fichierValide,
    afficherErreur, corriger, effacerLesErreurs, afficherErreurSaisie
} from "https://cdn.jsdelivr.net/gh/verghote/composant/fonction.js"

/* global data, lesParametres, token */

// conserver le nom du fichier à remplacer
let nomFichier;

// récupération des élements sur l'interface
const lesLignes = document.getElementById('lesLignes');
const msg = document.getElementById('msg');
const fichier = document.getElementById('fichier');
fichier.accept = lesParametres.accept;

// sur la sélection d'un fichier
fichier.onchange = () => {

};

// afficher le tableau des documents
for (const element of data) {
    let id = element.id;
    let tr = lesLignes.insertRow();
    tr.style.verticalAlign = 'middle';
    tr.id = element.id;

    // première colonne : les icônes de traitement : voir (si le fichier existe), supprimer, remplacer
    let td = tr.insertCell();
    td.classList.add('d-flex', 'justify-content-center', 'align-items-center');
    if (element.present) {
        let a = document.createElement("a");
        a.classList.add("p-1");
        a.target = 'pdf';
        // pour obliger la mise à jour du cache, on ajoute un paramètre à la fin de l'URL
        // a.href = lesParametres.repertoire + '/' + element.fichier + '?t=' + Date.now();
        a.href = lesParametres.repertoire + '/' + element.fichier;
        // Ajout d'une balise i pour identifier le type de document
        let i = document.createElement("i");
        i.classList.add("bi", "bi-file-pdf");
        i.title = "Cliquez ici pour ouvrir le document PDF";
        i.style.color = "#FF0000";
        a.appendChild(i);
        td.appendChild(a);
    } else {
        let i = document.createElement('i');
        i.classList.add("bi", "bi-emoji-frown-fill", "text-danger");
        i.style.cursor = 'pointer';
        td.appendChild(i);
        console.log("Le document " + element.id + " n'a pas été trouvé");
    }
    // icône pour téléverser un nouveau document
    let i = document.createElement('i');


    i = document.createElement('i');
    i.classList.add('m-1', 'bi', 'bi-x');
    i.style.paddingLeft = "10px";
    i.style.color = 'red';
    i.title = "Cliquez ici pour supprimer le document";
    i.style.cursor = "pointer";
    i.onclick = () => confirmer(() => supprimer(id));
    td.appendChild(i);


    // seconde colonne : le titre du document qui peut être directement modifié
    let titre = document.createElement("input");
    titre.type = 'text';
    titre.classList.add('form-control');
    titre.maxLength = 100;
    titre.minLength = 10;
    titre.required = true;
    titre.value = element.titre;
    titre.dataset.old = element.titre;
    titre.onkeydown = (e) => !/[<>]/.test(e.key);
    titre.onchange = function () {
        if (this.value !== this.dataset.old) {
            if (this.checkValidity()) {
                modifierColonne('titre', this, id);
            } else {
                corriger(this);
            }
        }
    };
    tr.insertCell().appendChild(titre);
}

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
        taille: lesParametres.maxSize,
        lesExtensions: lesParametres.extensions,
    };
    if (fichierValide(file, controle)) {
        return true;
    } else {
        afficherErreur(controle.reponse);
        return false;
    }
}

function remplacer(file) {
    // transfert du fichier vers le serveur dans le répertoire sélectionné
    const monFormulaire = new FormData();

    monFormulaire.append('token', token);
    $.ajax({
        url: 'ajax/remplacer.php',
        method: 'POST',
        async: false,
        data: monFormulaire,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: (data) => {
            if (data.success) {
               afficherSucces(data.success);
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
 * Demande de suppression
 * @param {int} id id de l'enregistrement
 */
function supprimer(id) {
    msg.innerText = "";
    $.ajax({
        url: '/admin/ajax/supprimer.php',
        method: 'POST',
        data: {
            table : 'document',
            id: id
        },
        dataType: "json",
        success: data => {
            if (data.success) {
                afficherSucces(data.success);
                // Mise à jour de l'interface
                const ligne = document.getElementById(id);
                ligne.parentNode.removeChild(ligne);
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
 * Demande de modification de la valeur d'une colonne
 * @param {string} colonne
 * @param {object} input balise input
 * @param {int} id identifiant du document à modifier
 */
function modifierColonne(colonne, input, id) {
    $.ajax({
        url: '/ajax/modifiercolonne.php',
        method: 'POST',
        data: {
            table : 'document',
            colonne: colonne,
            valeur: input.value,
            id: id
        },
        dataType: 'json',
        success: data => {
            if (data.success) {
                input.style.color = 'green';
                // modifier l'ancienne valeur
                input.dataset.old = input.value;
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

