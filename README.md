# Kosmetika - Rezervační a fakturační systém

Rezervační a fakturační systém pro kosmetické salony. Zákaznice se mohou objednat přes zákaznický portál (s účtem nebo anonymně), kosmetičky spravují rezervace a vystavují faktury přes oddělený staff portál.

## Architektura

```
├── apps/
│   ├── api/          NestJS REST API (Swagger docs na /api/docs)
│   ├── web/          Zákaznický portál (Next.js + MUI)
│   └── staff/        Aplikace pro kosmetičky (Next.js + MUI)
├── packages/
│   ├── database/     Prisma schema + klient (PostgreSQL)
│   ├── ui/           Sdílené MUI komponenty
│   ├── auth/         Keycloak integrace
│   └── types/        Sdílené TypeScript typy
├── docker/           Docker Compose (PostgreSQL + Keycloak)
```

## Tech Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Backend:** NestJS, Prisma ORM, PostgreSQL
- **Frontend:** Next.js 15, React 19, Material UI 6
- **Auth:** Keycloak (OpenID Connect), NextAuth.js
- **Billing:** Fakturace s DPH, CSV export pro účetní

## Hlavní funkce

- **Zákaznický portál:** Výběr salonu, služby, kosmetičky a termínu. Objednávka s účtem (Keycloak) nebo anonymně
- **Staff aplikace:** Dashboard, správa rezervací, služeb, fakturace, nastavení pracovní doby
- **Billing systém:** Automatické vystavování faktur, číslo faktury (YYYY-NNNN), DPH 21%, IČO/DIČ, CSV export pro účetní
- **Multi-salon:** Kosmetička může pracovat ve více salonech
- **Hierarchie:** Kosmetička může mít pod sebou další kosmetičky
- **Dostupnost:** Automatický výpočet volných termínů na základě pracovní doby a existujících rezervací

## Spuštění

```bash
# 1. Spustit infrastrukturu
pnpm docker:up

# 2. Nainstalovat závislosti
pnpm install

# 3. Vygenerovat Prisma klienta a aplikovat schema
pnpm db:generate
pnpm db:push

# 4. Seed databáze (ukázková data)
pnpm db:seed

# 5. Spustit všechny aplikace
pnpm dev
```

### Porty

| Služba    | URL                            |
|-----------|--------------------------------|
| API       | http://localhost:3001          |
| Swagger   | http://localhost:3001/api/docs |
| Web       | http://localhost:3000          |
| Staff     | http://localhost:3002          |
| Keycloak  | http://localhost:8080          |
| PostgreSQL| localhost:5432                 |

## API Endpointy

- `GET /api/salons` - Seznam salonů
- `GET /api/salons/:id` - Detail salonu
- `GET /api/services` - Seznam služeb
- `GET /api/services/salon/:salonId` - Služby salonu
- `GET /api/beauticians` - Seznam kosmetiček
- `GET /api/availability/:beauticianId/:salonId/slots?date=YYYY-MM-DD` - Volné termíny
- `POST /api/bookings` - Vytvoření rezervace (public - i pro anonymní)
- `GET /api/bookings` - Seznam rezervací (auth)
- `PUT /api/bookings/:id/status` - Změna stavu rezervace (auth)
- `POST /api/invoices` - Vytvoření faktury (auth)
- `GET /api/invoices/accounting?from=&to=` - Účetní souhrn (auth)

## Licence

MIT
