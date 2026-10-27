"use strict";

// -----------------------------------------------------------------------------------
// Import des fonctions nécessaires
// -----------------------------------------------------------------------------------

import { getData } from "/composant/fonction/page.js";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------

const lesDocuments = getData('lesDocuments');
const repertoire = getData('repertoire');
const lesLignes = document.getElementById('lesLignes');
const tplLigneDocument = document.getElementById('tplLigneDocument');

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Vérifie si un fichier existe réellement sur le serveur (Requête HEAD)
 * @param {string} url - Chemin ou URL du fichier
 * @returns {Promise<boolean>}
 */
async function verifierExistenceFichier(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok; // Renvoie true si le statut HTTP est entre 200 et 299
    } catch (erreur) {
        return false; // Erreur réseau ou fichier inaccessible
    }
}

/**
 * Crée une ligne de tableau à partir du template HTML
 * @param {Object} document - Le document à afficher
 * @returns {Promise<HTMLTableRowElement>}
 */
async function creerLigneDocument(document) {
    const clone = tplLigneDocument.content.firstElementChild.cloneNode(true);

    const lienAfficher = clone.querySelector('.lien-afficher-pdf');
    const iconeAbsent = clone.querySelector('.icone-fichier-absent');
    const tdTitre = clone.querySelector('.col-titre');
    const tdFichier = clone.querySelector('.col-fichier');

    tdTitre.textContent = document.titre ?? '';
    tdFichier.textContent = document.fichier ?? '';

    // Construction du chemin d'accès au fichier PDF
    const urlFichier = `${repertoire}/${document.fichier}`;

    // Vérification réelle sur le réseau / serveur
    const fichierExiste = await verifierExistenceFichier(urlFichier);

    if (fichierExiste) {
        lienAfficher.href = `../afficher.php?id=${document.id}`;
        lienAfficher.classList.remove('d-none');
    } else {
        iconeAbsent.classList.remove('d-none');
        tdFichier.classList.add('fichier-absent');
        tdFichier.title = "Fichier manquant sur le serveur";
    }

    return clone;
}

/**
 * Affiche la liste des documents dans le tableau
 * @param {Array<Object>} listeDocuments
 */
async function afficher(listeDocuments) {
    const fragment = window.document.createDocumentFragment();

    // Traitement de tous les documents en parallèle pour accélérer l'affichage
    const promessesLignes = listeDocuments.map(document => creerLigneDocument(document));
    const lignes = await Promise.all(promessesLignes);

    for (const tr of lignes) {
        fragment.appendChild(tr);
    }

    lesLignes.replaceChildren(fragment);
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

afficher(lesDocuments);