# RITM SPORT

Magazin sportiv static în limba română, publicat pe GitHub Pages la `https://ritmsport.site`.

## Funcții

- catalog cu 17 produse și cumpărare directă prin checkout-ul extern Whop;
- căutare și filtrare după categorie;
- autentificare reală a clienților prin Supabase Auth;
- comenzi Whop sincronizate automat printr-un webhook verificat;
- comenzi curente, istoric și urmărirea livrării;
- panou protejat pentru administrare la `/admin.html`;
- reguli Row Level Security: clientul vede doar comenzile asociate e-mailului său.
- pagini publice pentru termeni, confidențialitate, livrare, retur și contact.

Coșul și formularul demonstrativ de plată au fost eliminate. Fiecare buton `Cumpără` deschide pagina Whop a produsului; site-ul nu colectează date de card.

Fără configurarea Supabase, catalogul și checkout-ul Whop continuă să funcționeze, iar contul rămâne în modul demonstrativ local.

## Fișiere Supabase

- `supabase/schema.sql` — tabele, politici RLS și catalogul inițial;
- `supabase/functions/whop-webhook/index.ts` — primește `payment.succeeded` de la Whop;
- `supabase-config.js` — URL-ul și cheia publicabilă folosite în browser;
- `SUPABASE_SETUP.md` — instalare pas cu pas.

Cheile `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET` și cheia secretă Supabase nu trebuie publicate niciodată în GitHub sau în codul browserului.

## Pornire locală

Fișierele care folosesc module JavaScript trebuie deschise printr-un server local:

```powershell
python -m http.server 3000
```

Apoi deschide `http://localhost:3000`.

## Publicare

GitHub Pages publică branch-ul `main`, directorul `/ (root)`. Nu există etapă de build.
