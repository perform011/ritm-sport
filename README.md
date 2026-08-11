# RITM SPORT

Magazin sportiv static în limba română, fără framework și fără etapă de build.

## Funcții

- catalog cu 16 produse și prețuri în USD;
- căutare și filtrare după categorie;
- coș cu cantități și calculul livrării;
- formular demonstrativ de comandă;
- cont local de client;
- comenzi curente, istoric și urmărire după numărul comenzii.

Datele contului, coșului și comenzilor sunt salvate în `localStorage`, numai în browserul curent. Parola nu este salvată, iar plata nu este procesată. Pentru conturi reale și sincronizare între dispozitive este necesar un backend cu bază de date.

## Pornire locală

Deschide `index.html` direct sau pornește un server static:

```bash
python -m http.server 3000
```

Apoi deschide `http://localhost:3000`.

## GitHub Pages

Încarcă toate fișierele în rădăcina repository-ului și activează Pages pentru branch-ul principal, directorul `/ (root)`. Nu este necesară nicio comandă de build.
