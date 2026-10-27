<?php

declare(strict_types=1);

return [
    // Taille maximale (300 Ko)
    'maxSize' => 300 * 1024,

    // Dimensions maximales
    'maxWidth' => 350,
    'maxHeight' => 350,

    // Pas de redimensionnement : une image trop grande est refusée
    'resized' => false,

    // Extensions autorisées
    'lesExtensions' => ['jpg', 'png' ],

    // Types MIME autorisés
    'lesTypes' => ['image/jpeg', 'image/png' ],

    // Si le fichier existe déjà, doit-il être renommé ?
    'renommerSiExiste' => true,
];