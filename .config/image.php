<?php
return [
    'repertoire' => '/data/image',
    'extensions' => ["jpg", "png", "webp", "avif"] ,
    'types' => ["image/pjpeg", "image/jpeg", "x-png", "image/png", "image/webp",  "image/avif", "image/heif"],
    'maxSize' => 150 * 1024,
    'require' => true,
    'rename' => false,
    'sansAccent' => false,
    'accept' => '.jpg, .png, .webp, .avif',
    'redimensionner' => false,
    'height'=> 150,
    'width' => 150,
];
