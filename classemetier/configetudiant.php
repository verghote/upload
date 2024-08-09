<?php
// paramètres de l'upload
return [
    'repertoire' => '/data/photoetudiant/',
    'extensions' => ["jpg", "png"],
    'types' => ["image/pjpeg", "image/jpeg", "x-png", "image/png"],
    'maxSize' => 150 * 1024,
    'require' => false,
    'rename' => true,
    'sansAccent' => true,
    'redimensionner' => true,
    'height' => 150,
    'width' => 150,
    'accept' => '.jpg, .png',
];
