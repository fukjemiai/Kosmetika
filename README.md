# Kosmetika - Rezervacni a fakturacni system pro kosmeticke sluzby

Open-source system pro rezervaci kosmetickych sluzeb s fakturaci a oddelenou aplikaci pro kosmeticky.

## Architektura

```
packages/
  shared/          # Sdilene TypeScript typy
  api/             # NestJS backend (REST API + Prisma + PostgreSQL)
  customer-app/    # Zakaznicky frontend (React + Material UI)
  admin-app/       # Admin aplikace pro kosmeticky (React + Material UI)
keycloak/          # Keycloak realm konfigurace
```

## Hlavni funkce

- **Rezervacni system** - zakaznice se mohou objednat online, vyber salonu, sluzby, kosmeticky a terminu
- **Anonymni i prihlasene rezervace** - zakaznice nemusi mit ucet (Keycloak volitelny)
- **Vice salonu** - kosmeticka muze fungovat ve vice salonech
- **Tym kosmeticek** - hierarchie kosmeticek (parent/team)
- **Fakturacni system** - generovani faktur, PDF export, podklady pro ucetni
- **Sprava sluzeb** - kategorie, ceny, doby trvani, individualni ceny pro kosmeticky
- **Pracovni doba** - nastaveni per kosmeticka per salon
- **Dashboard** - prehled dnesních rezervaci a trzeb

## Technologie

| Komponenta | Technologie |
|------------|-------------|
| Backend API | NestJS, Prisma, PostgreSQL |
| Customer Frontend | React 18, Vite, Material UI 5 |
| Admin Frontend | React 18, Vite, Material UI 5 |
| Autentizace | Keycloak 24 |
| Databaze | PostgreSQL 16 |
| PDF generovani | PDFKit |
| Kontejnerizace | Docker Compose |

## Spusteni (Docker - doporuceno)

### Prerekvizity

- Docker & Docker Compose

### Jeden prikaz spusti vse

```bash
docker compose up -d --build
```

To je vse! Docker Compose spusti:

| Sluzba | URL | Popis |
|--------|-----|-------|
| PostgreSQL | `localhost:5432` | Databaze |
| Keycloak | `http://localhost:8080` | Autentizace (admin/admin) |
| API | `http://localhost:3000` | NestJS backend |
| Customer App | `http://localhost:5173` | Zakaznicky frontend |
| Admin App | `http://localhost:5174` | Admin pro kosmeticky |

API automaticky provede migraci databaze a seed testovacich dat pri startu.

### Uzitecne prikazy

```bash
docker compose up -d --build    # Spustit vse (build + start)
docker compose logs -f           # Sledovat logy vsech sluzeb
docker compose logs -f api       # Logy jen API
docker compose restart api       # Restartovat jednu sluzbu
docker compose down              # Zastavit vse
docker compose down -v           # Zastavit vse + smazat data
```

### Hot-reload

Zdrojovy kod je namountovany jako volume - zmeny v `src/` se automaticky projevi bez rebuildu.

### API dokumentace

Swagger UI je dostupny na `http://localhost:3000/api/docs`

## Spusteni bez Dockeru (alternativni)

### Prerekvizity

- Node.js >= 18
- PostgreSQL 16
- Keycloak 24

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed

# V oddelnych terminalech:
npm run dev:api       # API na http://localhost:3000
npm run dev:customer  # Zakaznicky FE na http://localhost:5173
npm run dev:admin     # Admin FE na http://localhost:5174
```

## Demo ucty

| Email | Heslo | Role |
|-------|-------|------|
| jana@beautystudio.cz | demo1234 | Kosmeticka (admin) |
| petra@beautystudio.cz | demo1234 | Kosmeticka |
| marie@example.com | demo1234 | Zakaznice |

## Datovy model

### Hlavni entity

- **Salon** - salon s adresou, otevírací dobou
- **Beautician** - kosmeticka, muze pracovat ve vice salonech, muze mit tym
- **Service** - sluzba s kategorii, cenou, dobou trvani
- **Booking** - rezervace (s customer ID nebo anonymne)
- **Customer** - zakaznice (s Keycloak ID nebo bez)
- **Invoice** - faktura s polozkami, DPH, PDF export
- **WorkingHours** - pracovni doba per kosmeticka per salon

### Fakturace

- Automaticke generovani faktur z rezervaci
- Cislovani faktur (FV2026XXXXX)
- DPH vypocet
- PDF export s ceskym formatem
- Podklady pro ucetni (prehled trzeb, DPH, zaplateno/nezaplateno)
- Platba hotove / kartou / prevodem

## Licence

MIT
