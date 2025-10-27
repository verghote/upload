SET default_storage_engine=InnoDb;

Drop database if exists upload;

-- Rappel utf8 est actuellement un alias pour le jeu de caractères UTF8MB3, mais sera un alias pour UTF8MB4 dans une prochaine version.
-- Utiliser UTF8MB4 est recommandé mais pas utilisable avec la collation unicode_ci qui ne distingue pas les accents
-- Utiliser UTF8MB4_0900_AI_CI pour distinguer les accents mais cette collation n'existe pas pour

/*
Cette collation fait partie d'un ensemble de nouvelles collations introduites avec MySQL 8.0, spécifiquement conçues pour le jeu de caractères utf8mb4.
Le "0900" dans le nom fait référence à la version 9.0.0 de l'Unicode Collation Algorithm (UCA) sur laquelle elle est basée.
"AI" signifie "accent-insensitive", ce qui veut dire que cette collation ne fait pas de distinction entre les caractères accentués et non accentués.
"CI" signifie "case-insensitive", indiquant qu'elle ne fait pas de distinction entre les majuscules et les minuscules.
*/


create database upload
    character set utf8mb4
    collate utf8mb4_0900_ai_ci;



