# Pizza Jasterka PWA

Staticka PWA objednavkova aplikacia pre Pizza Jasterka Hlohovec, navrhnuta ako mobil-first food delivery rozhranie podobne toku Bolt Food.

## Spustenie

Otvorte `index.html` v prehliadaci alebo spustite jednoduchy lokalny server:

```bash
python3 -m http.server 8080
```

Potom otvorte `http://localhost:8080`.

Tento server obsluzi iba staticke subory. Backend API routy v `api/` treba lokalne spustat cez Vercel:

```bash
npm install
npm run dev
```

## Backend priprava

Projekt je pripraveny pre Vercel Functions a Supabase, bez deployu.

- `supabase/schema.sql` obsahuje tabulky pre produkty, varianty, doplnky, rozvozove zony, objednavky, historiu stavov, staff role, suroviny a push subscription.
- `api/orders.mjs` vytvara objednavku a serverovo prepocitava obec, minimum, dopravu a ceny.
- `api/kitchen/orders.mjs` obsluhuje kuchynsky proces prijatia a zmeny stavov objednavky.
- `api/admin/products.mjs` a `api/admin/inventory.mjs` su priprava pre spravu produktov a surovin.
- `admin.html` je samostatny admin.
- `kitchen.html` je samostatny kuchynsky system.
- `courier.html` je samostatny kuriersky system pre dispatch, prijatie rozvozu, vyzdvihnutie, priebezne stavy a dorucenie.
- `partner-courier.html` je samostatna PWA pre partnerskych kurierov s prihlasenim cez telefonne cislo bez SMS kodu.
- Odmeny kurierov sa pocitaju z dorucenych `delivery_tasks.fee` plus volitelne bonusy/penalizacie v `courier_rewards`. Prehlady su v `/api/partner/earnings` a `/api/courier/earnings`.

Phone auth workflow pre partnerov:

1. Kuchyna alebo admin osobne overi kuriera.
2. V `couriers.phone` musi byt schvalene cislo v medzinarodnom formate, napr. `+421...`, a `is_active = true`.
3. Partner v PWA zada telefon.
4. Backend pusti iba aktivne cislo z tabulky `couriers` a PWA potom posiela phone Bearer token na `/api/partner/tasks`.

Pred deployom vyplnit env premenne podla `.env.example`, aplikovat SQL v Supabase a seednut produkty do databazy.

Zakaznicka aplikacia pouzije lokálne menu, kym `/api/menu` nevrati nakonfigurovane Supabase data. Po spusteni backendu sa hlavna ponuka nacita z databazy, takze admin zmeny produktov prejdu na hlavnu stranku.

## Poznamka k datam

Produktove data v `app.js` su prepisane podla verejnej ponuky z `https://www.jasterkahlohovec.sk/pizzeria/`: pizza, pizza stangle, focaccio, prilohy a dresingy. Ceny rozvozov na webe zavisia od obce, preto je v aplikacii dorucenie pre Hlohovec nastavene na `0`.
