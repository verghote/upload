SET default_storage_engine=InnoDb;

Drop database if exists upload;

-- jeu de caractères utf8mb4 sur 4 octets intégrant les émoticônes
-- collation insensible à la casse et aux accents et non spécifique à MySQL


create database upload
    character set utf8mb4
    collate utf8mb4_unicode_ci;



