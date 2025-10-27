"use strict";

// -----------------------------------------------------------------------------------
// Déclaration des variables globales
// -----------------------------------------------------------------------------------
/* global lesClubs, repertoire*/

const lesCartes = document.getElementById('lesCartes');

// -----------------------------------------------------------------------------------
// Fonctions de traitement
// -----------------------------------------------------------------------------------

/**
 * Crée une carte pour afficher les informations d'un club
 * @param {Object} element - Données du club
 * @returns {HTMLDivElement}
 */
function creerCarte(element) {
    // Création de la carte avec classe spécifique
    const carte = document.createElement('div');
    carte.classList.add('card', 'carte-club', 'shadow-sm');

    // En-tête
    const entete = document.createElement('div');
    entete.classList.add('card-header', 'text-center');
    entete.style.height = '80px';
    entete.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color-header').trim();
    entete.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color-header').trim();
    entete.innerText = element.nom;

// Création du corps de la carte contenant le logo
    const corps = document.createElement('div');
    corps.classList.add("card-body");
    corps.style.height = '250px'; // Hauteur fixe pour uniformiser les cartes

    if (element.present) {
        const img = document.createElement('img');
        img.src = repertoire + '/' + element.logo;
        img.alt = `${element.nom} logo`;
        // Ajoute les styles pour que l'image reste dans le conteneur
        img.style.maxHeight = '100%';
        img.style.maxWidth = '100%';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        img.style.margin = '0 auto'; // centrer horizontalement
        corps.appendChild(img);
    }
    carte.appendChild(entete);
    carte.appendChild(corps);
    return carte;
}

// -----------------------------------------------------------------------------------
// Programme principal
// -----------------------------------------------------------------------------------

// Création d'un conteneur flex
let conteneur = document.createElement('div');
conteneur.style.display = 'flex';
conteneur.style.flexWrap = 'wrap';
conteneur.style.gap = '1rem'; // Espacement entre les cartes
conteneur.style.justifyContent = 'flex-start';
// Création des cartes
for (const element of lesClubs) {
    const carte = creerCarte(element);
    // Limite de taille et comportement responsif
    carte.style.flex = '0 1 300px'; // Ne grandit pas, peut rétrécir, base 300px
    carte.style.maxWidth = '100%';
    conteneur.appendChild(carte);
}
lesCartes.appendChild(conteneur);

