use upload;

set default_storage_engine = innodb;

set foreign_key_checks = 0;

drop table if exists club;

create table club
(
    id   char(6)      not null,
    nom  varchar(70)  not null,
    logo varchar(100) null,
    constraint pk_club primary key (id),
    constraint uk_club_nom unique (nom),
    constraint ck_club_id check (id regexp '^080[0-9]{3}$'),
    constraint ck_club_nom check ( char_length(nom) between 3 and 60 and nom regexp '^[A-Za-z]+([ ''\-.]?[A-Za-z0-9])*$' )
)
    engine = innodb
    default character set = utf8mb4
    collate = utf8mb4_unicode_ci;

set foreign_key_checks = 1;

use upload;

drop trigger if exists avantmodificationclub;

delimiter $$

create trigger avantmodificationclub
    before update
    on club
    for each row
begin

    if new.id <> old.id then
        signal sqlstate '45000'
            set message_text = 'Le numéro du club n''est pas modifiable';
    end if;

end$$

delimiter ;


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

