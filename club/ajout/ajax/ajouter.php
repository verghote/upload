<?php
// Si un fichier est téléversé, il faut le controler
if (isset($_FILES['fichier'])) {
    // instanciation et paramétrage d'un objet InputFile
    $file = new InputFile($_FILES['fichier'], Club::getConfig());
    // vérifie la validité du fichier
    if (!$file->checkValidity()) {
        Erreur::envoyerReponse($file->getValidationMessage(), 'global');
    }
}
// création d'un objet Club pour réaliser les contrôles sur les données
$Club = new Club();

// Les données ont-elles été transmises ?
if (!$Club->donneesTransmises()) {
    Erreur::envoyerReponse("Toutes les données attendues ne sont pas transmises", 'global');
}

// Toutes les données sont-elles valides ?
if (!$Club->checkAll()) {
    Erreur::envoyerReponse("Certaines données transmises ne sont pas valides", 'global');
}

// Alimentation éventuelle de la colonne 'logo'  : sa valeur  est stockée dans la propriété  Value de  l'objet $file
if (isset($file)) {
    $Club->setValue('logo', $file->Value);
}
// Ajout dans la table Club
$Club->insert();

// Récupération de l'identifiant du Club ajouté
$id =  $Club->getLastInsertId();

// copie  éventuelle du fichier dans le répertoire de stockage
if (isset($file)) {
    $ok = $file->copy();
    // en cas d'échec (peu probable) il faut supprimer l'enregistrement créé afin de conserver une cohérence
    if (!$ok) {
        $Club->delete($id);
        Erreur::envoyerReponse("L'ajout a échoué car le logo n'a pas pu être téléversé", 'global');
    }
}
// Tout est OK
$reponse = ['success' => $id];
echo json_encode($reponse, JSON_UNESCAPED_UNICODE);
