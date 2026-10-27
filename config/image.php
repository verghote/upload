<?php

declare(strict_types=1);

return [
    // Taille maximale (300 Ko)
    'maxSize' => 300 * 1024,

    // Dimensions maximales
    'maxWidth' => 350,
    'maxHeight' => 0,

    // L'image doit-elle être redimensionnée si elle dépasse la largeur ou la hauteur maximale.
    'resized' => true,

    // Extensions autorisées
    'lesExtensions' => ['jpg', 'jpeg', 'png', 'gif'],

    // Types MIME autorisés
    'lesTypes' => ['image/jpeg', 'image/png', 'image/gif'],

    // Si le fichier existe déjà, doit-il être renommé ?
    'renommerSiExiste' => true,
];