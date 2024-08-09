<?php
// paramètre de l'upload
return [
    'repertoire' => '/data/document',
    'extensions' => ['pdf'],
    'types' => ["application/pdf"],
    'maxSize' => 1024 * 1024,
    'require' => true,
    'rename' => false,
    'sansAccent' => false,
    'accept' => '.pdf'
];
