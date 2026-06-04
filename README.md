# M2M - Modern Management (Ristorante)

**Sistema full-stack realtime per la gestione digitale di ristoranti moderni**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🎯 Overview del Progetto

M2M è una piattaforma web progettata per digitalizzare e ottimizzare la gestione operativa di un ristorante, sostituendo processi manuali (carta, comande tradizionali) con un sistema **centralizzato, realtime e multi-dispositivo**.

Il sistema permette la gestione simultanea di tavoli, ordini e sala, sincronizzando ogni modifica in tempo reale tra camerieri e amministratori.

L’obiettivo non è solo la gestione, ma la simulazione di un ambiente reale di ristorazione con logiche di comunicazione event-driven.

---

## ⚙️ Architettura del Sistema

Il progetto è basato su un’architettura **full-stack moderna event-driven**:

- Frontend Next.js (App Router) → interfaccia operativa per staff e admin  
- Backend Supabase → database + autenticazione + realtime  
- State Layer (Zustand) → gestione locale del carrello e tavoli  
- Server Actions → operazioni sicure lato server  
- Realtime Engine → sincronizzazione immediata tra dispositivi  

💡 Ogni azione (ordine, apertura tavolo, modifica menu) viene propagata in tempo reale a tutti i client connessi.

---

## ✨ Funzionalità

### 👨‍🍳 Area Camerieri
- Mappa interattiva della sala con stato tavoli
- Apertura e gestione tavolo in tempo reale
- Creazione ordini con sistema a carrello
- Aggiunta note personalizzate per ogni piatto
- Aggiornamenti live senza refresh pagina

### 👨‍💼 Area Amministratore
- Gestione completa del menu (categorie e piatti)
- Gestione utenti con ruoli (admin / staff)
- Monitoraggio ordini attivi e completati
- Dashboard con panoramica operativa
- Controllo stato tavoli in tempo reale

### ⚡ Funzionalità Tecniche
- Autenticazione sicura con Supabase Auth
- Aggiornamenti realtime multi-dispositivo
- UI responsive ottimizzata per tablet e mobile
- Validazione dati con Zod
- Architettura modulare e scalabile

---

## 🧠 Tecnologie Utilizzate

| Tecnologia       | Ruolo nel progetto |
|------------------|-------------------|
| Next.js 16       | Frontend + backend (App Router) |
| TypeScript       | Tipizzazione e robustezza |
| Supabase         | Database, auth e realtime |
| Tailwind CSS     | UI moderna e responsive |
| Zustand          | Gestione stato locale |
| Zod              | Validazione dati |
| Lucide React     | Iconografia UI |

---

## 🧩 Modello Dati (semplificato)

- `profiles` → utenti e ruoli sistema  
- `tables` → tavoli del ristorante  
- `orders` → ordini attivi e storici  
- `order_items` → singoli elementi ordine  
- `menu_categories` → categorie menu  
- `menu_items` → piatti e prezzi  

---

## 🖥️ UI & UX

Il sistema è progettato con approccio **mobile-first**, ottimizzato per:

- Tablet per camerieri  
- Desktop per amministrazione  
- Interazioni rapide (zero reload)  
- Feedback visivo immediato  

---

## 📸 Interfaccia

### Mappa Tavoli
![Mappa Tavoli](screenshots/mappa-tavoli.png)

### Gestione Ordine
![Ordine](screenshots/ordine-in-corso.png)

### Dashboard Admin
![Admin](screenshots/dashboard-admin.png)

---

## 🚀 Installazione

```bash
git clone https://github.com/montronechris/m2m.git
cd m2m
npm install
cp .env.example .env.local
npm run dev
Requisiti
Node.js 20+
Account Supabase attivo
🔐 Configurazione

Nel file .env.local inserire:

URL progetto Supabase
API Key pubblica
API Key privata
Configurazione Auth e Realtime
🧠 Scelte Progettuali

Questo progetto è stato sviluppato seguendo principi di:

Separazione delle responsabilità
Architettura scalabile a componenti
Minimizzazione dei refresh (UX realtime)
Gestione stato locale vs globale
Sicurezza lato server (Server Actions)
🎓 Competenze Dimostrate

Questo progetto dimostra competenze in:

Sviluppo full-stack moderno
Integrazione database realtime
Architetture event-driven
UI/UX per applicazioni reali
Gestione autenticazione e ruoli
Progettazione software scalabile
📈 Possibili Evoluzioni
Sistema di pagamento integrato
Stampante fiscale / termica
Analytics avanzate (vendite, piatti più ordinati)
Modalità offline (PWA)
Ottimizzazione AI per suggerimenti menu
Sistema magazzino ingredienti
🧾 Nota finale

Progetto sviluppato come capolavoro finale del percorso scolastico, con focus su:

applicazione reale
architettura moderna
esperienza utente professionale
tecnologie full-stack attuali

Autore: [Il Tuo Nome]
Anno: 2026
