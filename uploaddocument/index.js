"use strict";

import {
    configurerFormulaire,
    fichierValide,
    afficherErreur,
    confirmer,
    effacerLesErreurs, afficherSucces, afficherErreurSaisie,
} from "https://cdn.jsdelivr.net/gh/verghote/composant/fonction.js"

// variables globales
/* global lesFichiers, lesParametres, token */

// récupération des élements sur l'interface
const fichier = document.getElementById('fichier');
fichier.accept = lesParametres.accept;
const btnAjouter = document.getElementById('btnAjouter');
const lesLignes = document.getElementById('lesLignes');
const nb = document.getElementById('nb');



// Les procédures événementielles

// Déclencher le clic sur le champ de type file lors d'un clic sur le bouton btnFichier
btnAjouter.onclick = () => fichier.click();

// sur la sélection d'un fichier
fichier.onchange = () => {
    if (fichier.files.length > 0) {
        let file = fichier.files[0];
        if (controlerFichier(file)) {
            ajouter(file);
        }
    }
};


// ajout du glisser déposer dans le corps du tableau
lesLignes.ondragover = (e) => e.preventDefault();
lesLignes.ondrop = (e) => {
    e.preventDefault();
    let file = e.dataTransfer.files[0];
    if (controlerFichier(file)) {
        ajouter(file);
    }
};

// Contrôle des données
configurerFormulaire(true);

// initialisation des données sur l'interface
fichier.accept = lesParametres.accept;
afficher();

/**
 * Affichage des fichiers du répertoire
 */
function afficher(data) {
    lesLignes.innerHTML = '';
    nb.innerText = data.length;
    for (const nomFichier of data) {
        const tr = lesLignes.insertRow();
        tr.id = nomFichier;

        let td = tr.insertCell();
        // ajout dans la première colonne d'une icône déclenchant la demande de suppression du fichier
        const i = document.createElement('i');
        i.classList.add('bi', 'bi-x', 'text-danger');
        i.style.fontSize = '1.5rem';
        i.title = 'Supprimer le fichier';
        i.onclick = () => confirmer(() => supprimer(nomFichier));
        td.appendChild(i);

        td = tr.insertCell();
        const a = document.createElement('a');
        a.href = lesParametres.repertoire + '/' + nomFichier;
        a.target = 'doc';
        a.innerText = nomFichier;
        td.appendChild(a);
    }
}

/**
 * Contrôle le document sélectionné au niveau de son extension et de sa taille
 * Affiche le nom du fichier ou un message d'erreur
 * Renseigne la variable globale leFichier
 * @param file Objet file téléversé
 */
function controlerFichier(file) {

}

function ajouter() {

    $.ajax({




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

/**
 * Demande du suppression d'un fichier
 * @param nomFichier {string} Nom du fichier à supprimer
 */
function supprimer(nomFichier) {
    $.ajax({

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
