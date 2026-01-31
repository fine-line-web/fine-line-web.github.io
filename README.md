# Fine Line galleri

En elegant portfolio- och e-handelssajt för en konstgalleri som specialiserar sig på "en linje"-konst med akvarellbakgrunder.

## 🎨 Om projektet

**Fine Line galleri** är en modern, responsiv webbplats byggd för att visa och sälja unik konst. Sajten är helt på svenska och designad för att låta konstverken tala för sig själva.

### Funktioner

- **Responsiv design** - Fungerar perfekt på både mobil och desktop
- **Elegant UI** - Premium känsla med minimalistisk design
- **Dynamiskt galleri** - Filtrering och sortering av konstverk
- **Google Sheets-integration** - Automatisk synkning av lager/priser
- **GitHub Pages-hosting** - Gratis och snabb hosting

## 📁 Projektstruktur

```
fine-line/
├── index.html              # Startsida
├── galleri.html            # Gallerisida med alla verk
├── om-oss.html             # Om konstnären
├── bestallning.html        # Beställningssida med priser & formulär
├── produkt.html            # Produktdetaljsida
├── css/
│   └── style.css           # Huvudstylesheet
├── js/
│   ├── main.js             # Gemensam JavaScript
│   ├── gallery.js          # Galleri-funktionalitet
│   └── product.js          # Produktsida-funktionalitet
├── data/
│   └── inventory.json      # Produktdata (synkas från Google Sheets)
├── images/
│   ├── favicon.svg
│   └── artworks/           # Konstverksbilder
├── scripts/
│   └── sync-sheets.js      # Google Sheets sync-script
└── .github/
    └── workflows/
        ├── deploy.yml      # GitHub Pages deploy
        └── sync-inventory.yml  # Schemalagd sync
```

## 🚀 Kom igång

### Lokal utveckling

1. Klona repot
2. Öppna `index.html` i en webbläsare (eller använd en lokal server)

```bash
# Med Python
python -m http.server 8000

# Med Node.js (npx)
npx serve
```

### Lägg till bilder

Lägg dina konstverksbilder i `images/artworks/` och uppdatera `data/inventory.json` med rätt filnamn.

## ⚙️ Google Sheets-integration

### Konfigurera synkning

1. **Skapa ett Google Cloud-projekt** och aktivera Google Sheets API
2. **Skapa en Service Account** och ladda ner credentials
3. **Dela ditt Google Sheet** med service account-mejlen

### Konfigurera GitHub Secrets

Lägg till följande secrets i ditt GitHub-repo under Settings → Secrets → Actions:

| Secret                         | Beskrivning                  |
| ------------------------------ | ---------------------------- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account-mejladressen |
| `GOOGLE_PRIVATE_KEY`           | Private key från JSON-filen  |
| `GOOGLE_SHEET_ID`              | ID från Google Sheet URL     |

### Google Sheet-struktur

Skapa ett Google Sheet med följande kolumner (rad 1 = rubriker):

| id           | name           | description    | category | price | size | type     | colors             | image                    | available | featured | dateAdded  |
| ------------ | -------------- | -------------- | -------- | ----- | ---- | -------- | ------------------ | ------------------------ | --------- | -------- | ---------- |
| lejon-savann | Lejon i Savann | Beskrivning... | Djur     | 4500  | A3   | Original | orange, guld, brun | images/artworks/lion.jpg | true      | true     | 2026-01-15 |

### Manuell synkning

Du kan också trigga synkningen manuellt under Actions → Sync Inventory → Run workflow.

## 📋 Anpassa innehåll

### Ändra text

All text finns direkt i HTML-filerna. Sök och ersätt:

- `Fine Line galleri` → Ditt företagsnamn
- `hej@finelinegalleri.se` → Din e-post
- Priser i `bestallning.html`

### Ändra färger

Anpassa färgvariabler i `css/style.css`:

```css
:root {
  --color-accent-coral: #e07a5f;
  --color-accent-gold: #d4a574;
  --color-accent-sage: #81b29a;
  --color-accent-blue: #3d5a80;
  --color-accent-plum: #8e6c88;
}
```

## 📦 Deployment

Sajten deployar automatiskt till GitHub Pages när du pushar till `main`-branchen.

### Aktivera GitHub Pages

1. Gå till Settings → Pages
2. Välj Source: "GitHub Actions"
3. Pusha till main-branchen

Sajten kommer vara tillgänglig på: `https://[ditt-användarnamn].github.io/[repo-namn]/`

## 🛠️ Framtida förbättringar

- [ ] Kundvagn-funktionalitet
- [ ] Betalningsintegration (Stripe/Swish)
- [ ] Bildoptimering (WebP)
- [ ] SEO-optimering
- [ ] Analytics

## 📄 Licens

© 2026 Fine Line galleri. Alla rättigheter förbehållna.
