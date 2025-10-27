"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import {
    configurerFormulaire,
    effacerLesErreurs,
    fichierValide,
    verifierImage
} from "/composant/fonction/formulaire.js";
import {appelAjax} from "/composant/fonction/ajax";
import {afficherToast} from "/composant/fonction/afficher";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------
/* global lesParametres, lesClubs, autoComplete */

const fichier = document.getElementById('fichier');
const cible = document.getElementById('cible');
const label = document.getElementById('label');
const nomR = document.getElementById('nomR');
const formulaire = document.getElementById('formulaire');

// objet contenant les données du club sélectionné
let club;

// -----------------------------------------------------------------------------------
// Procédures évènementielles
// -----------------------------------------------------------------------------------

// Déclencher le clic sur le champ de type file lors d'un clic dans la zone cible
cible.onclick = () => fichier.click();

// // ajout du glisser déposer dans la zone cible
cible.ondragover = (e) => e.preventDefault();
cible.ondrop = (e) => {
    e.preventDefault();
    controlerFichier(e.dataTransfer.files[0]);
};

// traitement du champ file associé aux modifications de photos
fichier.onchange = function () {
    if (this.files.length > 0) {
        controlerFichier(this.files[0]);
    }
};

// sur la réception du focus sur le champ de recherche de club il faut vider le champ et masquer le formulaire
nomR.onfocus = () => {
    // on efface les erreurs précédentes
    effacerLesErreurs();
    // on masque le formulaire
    formulaire.style.display = 'none';
    // on vide la zone cible
    cible.innerHTML = '';
    // on vide le champ
    nomR.value = '';
};


// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------


/**
 * Affiche le logo du club sélectionné
 * @param data {object} données du club sélectionné
 */
function afficher(data) {
    // Récupération du club sélectionné
    club = data;
    cible.innerHTML = '';
    if (club.present) {
        const img = document.createElement('img');
        img.src = lesParametres.repertoire + '/' + club.logo;
        img.alt = 'logo du club';
        cible.appendChild(img);
    }
    nomR.blur();
    // afficher le formulaire
    formulaire.style.display = 'block';
    effacerLesErreurs();
}


/**
 * Contrôle le fichier sélectionné au niveau de son extension et de sa taille
 * Contrôle les dimensions de l'image si le redimensionnement n'est pas demandé
 * lancer lad demande de remplacement de l'image
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
    // la fonction de rappel reçoit le fichier et l'image éventuellement redimensionnée si le redimensionnement est demandé
    verifierImage(file, lesParametres, majLogo);
}

/**
 * Remplace le fichier sélectionné par le nouveau fichier téléversé
 * @param file
 * @param img
 */
function majLogo(file, img) {
    // transfert du fichier vers le serveur dans le répertoire sélectionné
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('id', club.id);
    appelAjax({
        url: 'ajax/modifier.php',
        data: formData,
        success: () => {
            afficherToast("Le logo a été mis à jour");
            cible.innerHTML = "";
            cible.appendChild(img);
        }
    });
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

// initialisation de l'interface
configurerFormulaire();

fichier.accept = lesParametres.accept;
label.innerText = lesParametres.label;

// paramétrage du composant autoComplete
const options = {
    data: {
        // source des données pour l'autoComplete
        src: lesClubs,
        // la propriété utilisée pour la recherche
        keys: ["nom"]
    },
    // le champ dans lequel on va afficher les suggestions
    selector: "#nomR",
    //  Nombre minimal de caractères à saisir avant d'afficher des suggestions
    threshold: 1,
    // Personnalisation de l'affichage de chaque résultat
    resultItem: {
        // Mettre en surbrillance les parties du texte qui correspondent à la recherche
        highlight: true,
    },
    // Thème de l'autoComplete
    theme: 'round',
    //  Gérer les accents/diacritiques (permet de matcher "é" avec "e", par exemple)
    diacritics: true,
    // Personnalisation de la liste des résultats
    resultsList: {
        // active l'événement noResults
        noResults: true,
        // Nombre maximal de résultats à afficher
        maxResults: 10,
        element: (list, data) => {
            // Afficher uniquement un message s’il n’y a aucun résultat
            if (!data.results.length) {
                const info = document.createElement("p");
                info.style.padding = "4px 6px";
                info.style.fontStyle = "italic";
                info.style.fontSize = "0.8em";
                info.style.color = "#666";
                info.textContent = "Aucun club correspondant";
                list.appendChild(info);
            }
        }
    },
    events: {
        input: {
            // lorsque l'utilisateur clique sur un élément de la liste affichée
            selection: (event) => {
                const selection = event.detail.selection.value;
                nomR.value = selection.nom;
                afficher(selection);
            },
        }
    },
};
new autoComplete(options);
