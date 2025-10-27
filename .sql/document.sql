SET default_storage_engine = InnoDb;

use upload;

-- La gestion des documents

drop table if exists document;

create table document
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
        SIGNAL sqlstate '45000' set message_text = '~Ce titre est déjà attribué à un autre document';
    end if;
end;


create trigger avantModificationDocument
    before update
    on document
    for each row
    if exists(select 1
              from document
              where titre = new.titre
                and id != new.id) then
        SIGNAL sqlstate '45000' set message_text = '~Ce titre est déjà attribué à un autre document';
    end if;


insert into document (titre, fichier)
values ('La gestion des erreurs', 'La gestion des erreurs.pdf'),
       ('Le chargement dynamique des classes', 'Le chargement dynamique des classes.pdf'),
       ('Les cookies', 'Les cookies.pdf'),
       ('Les entêtes HTTP', 'Les entêtes HTTP.pdf'),
       ('Les jetons d\'authentification', 'Les jetons d\'authentification.pdf');