# Frontend-Backend Integration

Tato aplikace nyní podporuje komunikaci s MongoDB backend serverem s možností přepínání na mock data.

## 🚀 Funkce

### ✅ Implementované funkce:

- **API Service Layer**: Komunikace s backend API na `http://localhost:3001`
- **Mock Service**: Offline režim s lokálními daty pro testování
- **Automatické přepínání**: Při nedostupnosti serveru se automaticky použijí mock data
- **Konfigurace**: Nastavení přes UI panel (ikona ozubeného kola v navigaci)
- **Status indikátory**: Zobrazení stavu připojení v aplikaci
- **Error handling**: Zobrazení chyb uživateli

### 📊 Podporované operace:

- ✅ **Vytvoření nákupního seznamu** (`POST /shoppingList/create`)
- ✅ **Načtení všech seznamů** (`GET /shoppingList/myList`)
- ✅ **Aktualizace názvu seznamu** (`PUT /shoppingList/update`)
- ✅ **Smazání seznamu** (`DELETE /shoppingList/delete`)
- ⚠️ **Ingredience**: Zatím pouze lokálně (backend nepodporuje)

## 🔧 Nastavení

### 1. Spuštění backend serveru:

```bash
cd src/backend
npm install
npm run dev
```

Backend běží na: `http://localhost:3001`

### 2. Spuštění frontend aplikace:

```bash
npm install
npm run dev
```

Frontend běží na: `http://localhost:3002`

### 3. Konfigurace aplikace:

- Klikněte na ikonu ⚙️ v navigaci
- Přepněte mezi API a Mock režimem
- Nastavte URL serveru a identitu uživatele

## 📱 Používání

### API Režim (výchozí):

- Aplikace se pokusí připojit k backend serveru
- Data se ukládají do MongoDB
- Při nedostupnosti serveru automatické přepnutí na mock

### Mock Režim:

- Lokální data pro rychlé testování
- Simuluje síťové zpoždění (300ms)
- Ideální pro vývoj bez backend serveru

### Status indikátory:

- 🟢 **Připojeno k serveru**: API režim, server dostupný
- 🔴 **Server nedostupný**: API režim, server offline
- 🟠 **Offline režim**: Mock data aktivní

## 🗂️ Struktura služeb

```
src/services/
├── api.ts                    # API komunikace s backend
├── mockService.ts           # Mock data pro offline režim
└── shoppingListService.ts   # Unified service layer
```

### API Service (`api.ts`):

- Komunikace s Express/MongoDB backend
- Zpracování HTTP požadavků
- Error handling pro API chyby

### Mock Service (`mockService.ts`):

- Lokální simulace backend operací
- Předpřipravená česká testovací data
- Simulace síťového zpoždění

### Shopping List Service (`shoppingListService.ts`):

- Unified rozhraní pro frontend
- Automatické přepínání mezi API/Mock
- Konfigurace a status management

## 🎯 Testování

### 1. Test API připojení:

1. Spusťte backend server
2. V aplikaci klikněte na ⚙️ → "Test"
3. Ověřte zelený status "Připojeno k serveru"

### 2. Test Mock režimu:

1. V nastavení zapněte "Použít mock data"
2. Ověřte oranžový status "Offline režim"
3. Testujte CRUD operace s mock daty

### 3. Test automatického přepnutí:

1. Spusťte aplikaci s běžícím backend
2. Vypněte backend server
3. Aplikace by měla automaticky přepnout na mock

## 🔍 Debugging

### Konzole prohlížeče:

- Všechny API volání jsou logovány
- Chyby připojení jsou zobrazeny
- Status změny jsou trackovány

### Backend logy:

- MongoDB připojení
- API požadavky a odpovědi
- Chyby serveru

## 📝 Poznámky

### Omezení:

- **Ingredience**: Backend zatím nepodporuje items/ingredience
- **Kategorie**: Backend má pouze `name`, kategorie se mapují na "API Data"
- **Uživatelé**: Jednoduchá identifikace přes header

### Budoucí rozšíření:

- Podpora ingrediencí v backend API
- Kategorie v backend modelu
- Autentifikace uživatelů
- Real-time synchronizace
- Offline-first architektura

## 🎉 Výsledek

Aplikace nyní plně podporuje:

- ✅ **Komunikaci se serverem** (MongoDB backend)
- ✅ **Mock data pro testování**
- ✅ **Automatické přepínání režimů**
- ✅ **Konfiguraci přes UI**
- ✅ **Error handling a status indikátory**

Frontend je připraven pro produkční nasazení s MongoDB backend! 🚀
