SET default_storage_engine = InnoDb;

use upload;

-- La gestion des documents

drop table if exists document;

create table document
(
    id      int auto_increment,
    titre   varchar(100) NOT NULL,
    fichier varchar(100) not null unique,
    constraint pk_document primary key (id),
    constraint uk_document_titre unique (titre),
    constraint uk_document_fichier unique (fichier)

);


