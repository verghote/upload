SET default_storage_engine = InnoDb;

use upload;

-- La gestion des documents

drop table if exists club;

create table club
(
    id   char(6) primary key,
    nom  varchar(70)  NOT NULL unique,
    logo varchar(100) null
);


-- trigger sur la table club
-- le champ id doit se composer de 6 chiffres en commençant par 080
-- le champ id doit être unique
-- le nom se compose uniquement de lettre en majuscule avec possibilité d'un espace, d'un point ou d'un tiret entre chaque mot
-- le nom comporte entre 3 et 60 caractères
-- le nom doit être unique
-- unicité sur le champ nom

create trigger avantAjoutClub
    before insert
    on club
    for each row
begin
    -- Vérification sur l'id
    IF new.id REGEXP '^[0-8]{3}[0-9]{3}$' = 0 then
        signal sqlstate '45000' set message_text =
                '~Le numéro du club doit être un nombre de 6 chiffres commençant par 080';
    end if;

    if exists(select 1 from club where id = new.id) then
        signal sqlstate '45000' set message_text = '~Ce numéro est déjà attribué';
    end if;

    -- Mise en forme et vérification sur le nom
    set new.nom = ucase(new.nom);

    if char_length(new.nom) not between 3 and 60 then
        signal sqlstate '45000' set message_text = '~Le nom doit comprendre entre 3 et 60 caractères';
    end if;

    if new.nom not regexp '^[A-Za-z]+([ ''\-.]?[A-Za-z0-9])*$' then
        signal sqlstate '45000' set message_text = '~Le format du nom est invalide.';
    end if;

    if exists(select 1 from club where nom = new.nom) then
        signal sqlstate '45000' set message_text = '~Ce nom est déjà utilisé';
    end if;
end;


create trigger avantModificationClub
    before update
    on club
    for each row
begin
    -- Vérification sur l'id
    if new.id != old.id then
        signal sqlstate '45000' set message_text =
                '~Le numéro du club n\'est pas modfiable';
    end if;

    -- Mise en forme et vérification sur le nom

    if new.nom != old.nom then
        set new.nom = ucase(new.nom);

        if char_length(new.nom) not between 3 and 60 then
            signal sqlstate '45000' set message_text = '~Le nom doit comprendre entre 3 et 60 caractères';
        end if;

        if new.nom not regexp '^[A-Za-z]+([ ''\-.]?[A-Za-z0-9])*$' then
            signal sqlstate '45000' set message_text = '~Le format du nom est invalide.';
        end if;

        if exists(select 1 from club where nom = new.nom) then
            signal sqlstate '45000' set message_text = '~Ce nom est déjà utilisé';
        end if;

    end if;
end;

INSERT INTO club (id, nom, logo)
VALUES ('080004', 'AMIENS UC', 'auc.png'),
       ('080014', 'US CAMON', 'us camon.png'),
       ('080021', 'AMICALE DU VAL DE SOMME', 'vds.png'),
       ('080027', 'SAINT-OUEN DSL', 'dsl.png'),
       ('080028', 'ALBERT MEAULTE AEROSPA.AC', 'amaac.png'),
       ('080044', 'RUNNING CLUB DE CORBIE', 'rcc.png'),
       ('080049', 'ESPRIT RUN', 'esprit run.webp'),
       ('080061', 'VYTAJOG', 'vytajog.png'),
       ('080071', 'SPORTING CLUB ABBEVILLOIS ATHL', 'sca.png'),
       ('080045', 'PERONNE ATHLETISME CLUB', 'peronne.png'),
       ('080060', 'RUNNING CLUB ABBEVILLOIS', 'rca.png');

