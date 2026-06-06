insert into public.categories (name, sort_order)
values
  ('Pizza', 10),
  ('Pizza štangle', 20),
  ('Focaccio', 30),
  ('Prílohy', 40)
on conflict (name) do update set sort_order = excluded.sort_order, is_active = true;

insert into public.delivery_zones (village, fee, minimum_order, sort_order)
values
  ('Hlohovec', 0, 0, 10),
  ('Šulekovo', 2, 20, 20),
  ('Leopoldov', 2, 20, 30),
  ('Koplotovce', 3, 20, 40),
  ('Červeník', 3, 20, 50),
  ('Bojničky', 3, 20, 60),
  ('Kľačany', 4, 20, 70),
  ('Tepličky', 4, 20, 80),
  ('Dvorníky', 4, 20, 90),
  ('Otrokovce', 4, 20, 100),
  ('Trhovište', 4, 20, 110),
  ('Sasinkovo', 4.5, 20, 120)
on conflict (village) do update
set fee = excluded.fee,
    minimum_order = excluded.minimum_order,
    sort_order = excluded.sort_order,
    is_active = true;

with category as (select id from public.categories where name = 'Pizza')
insert into public.products (slug, category_id, name, description, price, icon, is_popular, sort_order)
select slug, category.id, name, description, price, icon, is_popular, sort_order
from category,
(values
  ('pizza-01', '1. Margerita', 'Pomodoro, bazalka, syr. 530g, alergény: 1,7.', 7.20, '1', true, 10),
  ('pizza-02', '2. Šunková', 'Pomodoro, šunka, syr. 580g, alergény: 1,7.', 7.90, '2', true, 20),
  ('pizza-03', '3. Salámová', 'Pomodoro, salám, syr. 580g, alergény: 1,7.', 7.90, '3', false, 30),
  ('pizza-04', '4. Šampiňónová', 'Pomodoro, šunka, šampiňóny, syr. 650g, alergény: 1,7.', 7.90, '4', false, 40),
  ('pizza-05', '5. Študentská', 'Pomodoro, šunka, kukurica, syr. 630g, alergény: 1,7.', 7.90, '5', false, 50),
  ('pizza-06', '6. Hawai', 'Pomodoro, šunka, ananás, syr. 630g, alergény: 1,7.', 7.90, '6', false, 60),
  ('pizza-07', '7. Quatro Formaggi', 'Pomodoro, 4 druhy syra: niva, údený syr, mozarella, eidam. 720g, alergény: 1,7.', 9.00, '7', true, 70),
  ('pizza-08', '8. Provinciále', 'Pomodoro, šunka, kukurica, šampiňóny, feferóny, slanina, syr. 680g, alergény: 1,7.', 8.40, '8', false, 80),
  ('pizza-09', '9. Gazdovská', 'Pomodoro, salám, klobása, slanina, cibuľa, feferóny, syr. 710g, alergény: 1,7.', 8.80, '9', false, 90),
  ('pizza-10', '10. Diavola', 'Pomodoro, šunka, pikantný salám, chilli, paprika, syr. 680g, alergény: 1,7.', 8.30, '10', false, 100),
  ('pizza-11', '11. Pikante', 'Pomodoro, pikantný salám, chilli, cibuľa, syr. 630g, alergény: 1,7.', 8.30, '11', false, 110),
  ('pizza-12', '12. Vegetariánska', 'Pomodoro, šampiňóny, kukurica, brokolica, paradajky, olivy, syr. 710g, alergény: 1,7.', 8.50, '12', false, 120),
  ('pizza-13', '13. Špek', 'Pomodoro, šunka, kukurica, slanina, tavený syr, syr. 650g, alergény: 1,7.', 8.40, '13', false, 130),
  ('pizza-14', '14. Talianská', 'Pomodoro, paradajky, prosciutto, rucola, parmezán, syr. 580g, alergény: 1,7.', 9.50, '14', false, 140),
  ('pizza-15', '15. Tuniaková', 'Pomodoro, tuniak, cibuľa, olivy, syr. 630g, alergény: 1,4,7.', 8.40, '15', false, 150),
  ('pizza-16', '16. Hermelínová', 'Pomodoro, šunka, hermelín, syr, brusnicová omáčka. 650g, alergény: 1,7.', 8.60, '16', false, 160),
  ('pizza-17', '17. Jašterka', 'Pomodoro, kuracie mäso, niva, hermelín, rucola, syr, sweet chilli omáčka. 710g, alergény: 1,7.', 9.90, '17', true, 170)
) as seed(slug, name, description, price, icon, is_popular, sort_order)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    icon = excluded.icon,
    is_popular = excluded.is_popular,
    sort_order = excluded.sort_order,
    is_active = true;

insert into public.product_variants (product_id, name, price_delta, sort_order)
select p.id, variant.name, variant.price_delta, variant.sort_order
from public.products p
cross join (values ('Rajčinový základ', 0, 10), ('Smotanový základ', 0, 20)) as variant(name, price_delta, sort_order)
where p.slug like 'pizza-%'
on conflict do nothing;

with category as (select id from public.categories where name = 'Prílohy')
insert into public.products (slug, category_id, name, description, price, icon, sort_order)
select slug, category.id, name, 'Samostatná príloha alebo doplnok k jedlu.', price, '+', sort_order
from category,
(values
  ('extra-1', 'Šampiňóny 70g', 1.00, 10),
  ('extra-2', 'Kukurica 50g', 1.00, 20),
  ('extra-3', 'Ananás 50g', 1.00, 30),
  ('extra-4', 'Brokolica 50g', 1.00, 40),
  ('extra-5', 'Olivy 40g', 1.00, 50),
  ('extra-6', 'Baranie rohy 50g', 1.00, 60),
  ('extra-7', 'Cibuľa 30g', 1.00, 70),
  ('extra-8', 'Paprika 50g', 1.00, 80),
  ('extra-9', 'Paradajky 70g', 1.00, 90),
  ('extra-10', 'Feferóny 20g', 1.00, 100),
  ('extra-11', 'Rucola 40g', 1.00, 110),
  ('extra-12', 'Vajce 40g', 1.00, 120),
  ('extra-13', 'Šunka 50g', 1.30, 130),
  ('extra-14', 'Salám 50g', 1.30, 140),
  ('extra-15', 'Pikantný salám 50g', 1.30, 150),
  ('extra-16', 'Klobása 50g', 1.30, 160),
  ('extra-17', 'Slanina 50g', 1.30, 170),
  ('extra-18', 'Kuracie mäso 70g', 1.50, 180),
  ('extra-19', 'Kečup 80ml', 1.50, 190),
  ('extra-20', 'Tatárska omáčka 80ml', 1.50, 200),
  ('extra-21', 'Cesnakový dresing 80ml', 1.50, 210),
  ('extra-22', 'Americký dresing 80ml', 1.50, 220),
  ('extra-23', 'Pikantný dresing 80ml', 1.50, 230),
  ('extra-24', 'Slaninový dresing 80ml', 1.50, 240),
  ('extra-25', 'Sweet chilli omáčka 80ml', 1.50, 250),
  ('extra-26', 'Mozzarella 80g', 1.80, 260),
  ('extra-27', 'Niva 80g', 1.80, 270),
  ('extra-28', 'Údený syr 80g', 1.80, 280),
  ('extra-29', 'Hermelín 80g', 1.80, 290),
  ('extra-30', 'Tuniak 50g', 2.00, 300),
  ('extra-31', 'Prosciutto 50g', 2.00, 310),
  ('extra-32', 'Parmezán 50g', 2.50, 320)
) as seed(slug, name, price, sort_order)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    sort_order = excluded.sort_order,
    is_active = true;

insert into public.product_variants (product_id, name, price_delta, sort_order)
select p.id, '1 porcia', 0, 10
from public.products p
where p.slug like 'extra-%'
on conflict do nothing;

insert into public.product_extras (product_id, extra_product_id)
select pizza.id, extra.id
from public.products pizza
cross join public.products extra
where pizza.slug like 'pizza-%' and extra.slug like 'extra-%'
on conflict do nothing;

with category as (select id from public.categories where name = 'Pizza štangle')
insert into public.products (slug, category_id, name, description, price, icon, sort_order)
select slug, category.id, name, description, price, icon, sort_order
from category,
(values
  ('stangle-01', '1. Pizza štangle s dresingom', '250g, alergény: 1,3,7.', 4.50, 'Š1', 10),
  ('stangle-02', '2. Pizza štangle syrové', 'Pomodoro, syr. 450g, alergény: 1,7.', 7.20, 'Š2', 20),
  ('stangle-03', '3. Pizza štangle šunkové', 'Pomodoro, šunka, syr. 470g, alergény: 1,7.', 7.40, 'Š3', 30),
  ('stangle-04', '4. Pizza štangle slaninové', 'Pomodoro, slanina, údený syr. 470g, alergény: 1,7.', 7.80, 'Š4', 40),
  ('stangle-05', '5. Pizza štangle nivové', 'Pomodoro, slanina, niva. 470g, alergény: 1,7.', 8.00, 'Š5', 50),
  ('stangle-06', '6. Pizza štangle gazdovské', 'Pomodoro, slanina, klobása, kukurica, syr. 500g, alergény: 1,7.', 8.60, 'Š6', 60)
) as seed(slug, name, description, price, icon, sort_order)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    icon = excluded.icon,
    sort_order = excluded.sort_order,
    is_active = true;

with category as (select id from public.categories where name = 'Focaccio')
insert into public.products (slug, category_id, name, description, price, icon, sort_order)
select slug, category.id, name, description, price, icon, sort_order
from category,
(values
  ('focaccio-01', '1. Focaccio s kuracím mäsom', 'Dresing, zelenina, kuracie mäso. 2ks 500g, alergény: 1,3,7.', 8.20, 'F1', 10),
  ('focaccio-02', '2. Focaccio s prosciuttom', 'Dresing, šalát, mozzarella, prosciutto. 2ks 480g, alergény: 1,3,7.', 9.30, 'F2', 20)
) as seed(slug, name, description, price, icon, sort_order)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    icon = excluded.icon,
    sort_order = excluded.sort_order,
    is_active = true;

insert into public.product_variants (product_id, name, price_delta, sort_order)
select p.id, 'Štandard', 0, 10
from public.products p
where p.slug like 'stangle-%' or p.slug like 'focaccio-%'
on conflict do nothing;

insert into public.product_extras (product_id, extra_product_id)
select base.id, extra.id
from public.products base
cross join public.products extra
where (base.slug like 'stangle-%' or base.slug like 'focaccio-%')
  and extra.slug in ('extra-19','extra-20','extra-21','extra-22','extra-23','extra-24','extra-25')
on conflict do nothing;
