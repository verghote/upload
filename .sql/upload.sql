SET default_storage_engine = InnoDb;

drop database if exists upload;

create database upload character set utf8mb4 collate utf8mb4_unicode_ci;

use upload;

-- La gestion des documents

CREATE TABLE document
(
    id      int auto_increment primary key,
    titre   varchar(100) NOT NULL unique,
    fichier varchar(100) not null unique
);


-- vérification de l'unicité du titre avant celle réalisée par l'index unique afin de renvoyer un message clair


create trigger avantAjoutDocument
    before insert
    on document
    for each row
begin
    if exists(select 1 from document where titre = new.titre) then
        SIGNAL sqlstate '45000' set message_text = '#Ce titre est déjà attribué à un autre document';
    end if;
end;


create trigger avantMajDocument
    before update
    on document
    for each row
    if exists(select 1
              from document
              where titre = new.titre
                and id != new.id) then
        SIGNAL sqlstate '45000' set message_text = '#Ce titre est déjà attribué à un autre document';
    end if;


INSERT INTO document (id, titre, fichier)
VALUES (1, 'Modèle certificat médical', 'Modèle certificat médical.pdf'),
       (2, 'Les minimas pour les Frances', 'les minimas pour les Frances.pdf'),
       (3, 'Règlement de l\'épreuve des 4 saisons', 'Règlement 4 saisons.pdf'),
       (4, 'Les catégories d\'âge', 'Les catégories d''âge pour la saison 2022-2023.pdf'),
       (5, 'Autorisation parentale', 'Autorisation parentale.pdf'),
       (6, 'Calendrier des courses 2023 dans la Somme', 'Calendrier Courses80 2023.pdf');

select *
from document;

create table etudiant
(
    id      int auto_increment primary key,
    nom     varchar(20)        not null,
    prenom  varchar(20)        NOT NULL,
    fichier varchar(50)        null,
    unique (nom, prenom)
);


create trigger avantAjoutEtudiant
    before insert
    on etudiant
    for each row
begin
    set new.nom = upper(new.nom);
    if exists(select 1 from etudiant where nom = new.nom and prenom = new.prenom) then
        SIGNAL sqlstate '45000' set message_text = '#Cet étudiant existe déjà';
    end if;
end;


create trigger avantModificationEtudiant
    before update
    on etudiant
    for each row
begin
    set new.nom = upper(new.nom);
    if exists(select 1 from etudiant where nom = new.nom and prenom = new.prenom and id != new.id) then
        SIGNAL sqlstate '45000' set message_text = '#Un étudiant de même nom et même prénom existe déjà';
    end if;
end;

insert into etudiant(id, nom, prenom, fichier)
values (1, 'BOULONGNE', 'Alexandre', 'boulongne alexandre.jpg'),
       (2, 'COLLINAS', 'Mathéo', 'collina matheo.jpg'),
       (3, 'CREUZOT', 'Jules', 'creuzot jules.jpg'),
       (4, 'CUISINIER', 'Hugo', 'cuisinier hugo.jpg'),
       (5, 'DAWAGNE', 'Jérémy', 'dawagne jeremy.jpg'),
       (6, 'DELAPORTE', 'Pierre', 'delaporte pierre.jpg'),
       (7, 'DELAPORTE', 'Théo', 'delaporte theo.jpg'),
       (8, 'DESSOUT', 'Jérémie', 'dessout jeremie.jpg'),
       (9, 'DUMOULIN', 'Florian', 'dumoulin florian.jpg'),
       (10, 'DURIEZ', 'Dimitri', 'duriez dimitri.jpg'),
       (11, 'FOURDAIN', 'Océance', 'fourdain oceance.jpg'),
       (12, 'HERBET', 'Kévin', 'herbet kevin.jpg'),
       (13, 'HMIDI', 'Karim', 'hmidi karim.jpg'),
       (14, 'HUSIAUX', 'Valentin', 'husiaux valentin.jpg'),
       (15, 'KABA', 'Théo', 'kaba theo.jpg'),
       (16, 'KREMER', 'Anton', 'kremer anton.jpg'),
       (17, 'LASORNE', 'Lucas', 'lasorne lucas.jpg'),
       (18, 'LEGUAY', 'Théo', 'leguay theo.jpg'),
       (19, 'LEMAIRE', 'Gauthier', 'lemaire gauthier.jpg'),
       (20, 'MAILLARD', 'Grégoire', 'maillard gregoire.jpg'),
       (21, 'MAILLET', 'Arnaud', 'maillet arnaud.jpg'),
       (22, 'MARTIN', 'Aurelien', 'martin aurelien.jpg'),
       (23, 'MEZGHACHE', 'Yanis', 'mezghache yanis.jpg'),
       (24, 'NANCELLE', 'Alexis', 'nancelle alexis.jpg'),
       (25, 'NEVES', 'Dylan', 'neves dylan.jpg'),
       (26, 'OUTREBON', 'Pierre', 'outrebon pierre.jpg'),
       (27, 'POSSON', 'Corentin', 'posson corentin.jpg'),
       (28, 'PYRAM', 'Leonard', 'pyram leonard.jpg'),
       (29, 'TRICOTET', 'Baptiste', 'tricotet baptiste.jpg');

select *
from etudiant;