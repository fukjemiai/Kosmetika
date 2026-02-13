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

## Spusteni (Development)

### Prerekvizity

- Node.js >= 18
- Docker & Docker Compose

### 1. Spustit infrastrukturu

```bash
docker compose up -d
```

Spusti PostgreSQL (port 5432) a Keycloak (port 8080).

### 2. Nastavit environment

```bash
cp .env.example .env
```

### 3. Nainstalovat zavislosti

```bash
npm install
```

### 4. Migrace databaze

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Spustit aplikace

```bash
# V oddelnych terminalech:
npm run dev:api       # API na http://localhost:3000
npm run dev:customer  # Zakaznicky FE na http://localhost:5173
npm run dev:admin     # Admin FE na http://localhost:5174
```

### API dokumentace

Swagger UI je dostupny na `http://localhost:3000/api/docs`

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
