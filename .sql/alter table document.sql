use upload;

# alter table document drop column if exists rang;  // l'otpion 'if exists' n'est pas supportée par MySQL 9.1

# alter table document drop column  rang;

alter table document
   add rang int not null default 0;

-- Mise à jour des rangs
set @r := 0;
update document set rang = (@r := @r + 1) order by id;

select * from document;