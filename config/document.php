<?php
declare(strict_types=1);

return [
    // Taille maximale (512 Ko)
    'maxSize' => 512 * 1024,

    // Extensions autorisées
    'lesExtensions' => ['pdf'],

    // Types MIME autorisés
    'lesTypes' => ['application/pdf'],

    // Si le fichier existe déjà, doit-il être renommé ?
    'renommerSiExiste' => false,
];