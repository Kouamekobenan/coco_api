<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="80" alt="NestJS" />
</p>

<h1 align="center">Coco API — Documentation Technique</h1>

<p align="center">
  API REST backend de la plateforme <strong>Cocotaille / Cocomousso</strong> — Gestion de salons de coiffure en Côte d'Ivoire.<br/>
  Construite avec <strong>NestJS · Prisma ORM · PostgreSQL + PostGIS · Cloudinary</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-v12-E0234E?logo=nestjs" />
  <img src="https://img.shields.io/badge/Prisma-v6-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/PostGIS-3.x-4DB6AC" />
  <img src="https://img.shields.io/badge/Cloudinary-CDN-3448C5?logo=cloudinary" />
</p>

---

## Table des matières

- [Installation & Démarrage](#-installation--démarrage)
- [Variables d'environnement](#-variables-denvironnement)
- [Architecture](#-architecture)
- [Module Salon](#-module-salon)
  - [Vue d'ensemble](#vue-densemble)
  - [Modèle de données](#modèle-de-données)
  - [Machine d'états du salon](#machine-détats-du-salon)
  - [Géolocalisation PostGIS](#géolocalisation-postgis)
  - [Référence des endpoints](#référence-des-endpoints)
    - [Salons — Core](#salons--core)
    - [Salons — Horaires](#salons--horaires)
    - [Salons — Médias & Vitrine](#salons--médias--vitrine)
    - [Salons — Promotions](#salons--promotions)
    - [Salons — Expérience & Thème](#salons--expérience--thème)
  - [Intégration Frontend — Guide rapide](#intégration-frontend--guide-rapide)
- [Module Booking](#-module-booking)
  - [Vue d'ensemble booking](#vue-densemble-1)
  - [Modèle de données booking](#modèle-de-données-1)
  - [Machine d'états de la réservation](#machine-détats-de-la-réservation)
  - [Logique métier clé](#logique-métier-clé)
  - [Référence des endpoints booking](#référence-des-endpoints-1)
    - [Bookings — Core](#bookings--core)
    - [Booking Phases — Étapes](#booking-phases--étapes)
  - [Intégration Frontend — Booking](#intégration-frontend--guide-complet)
- [Module Queue](#-module-queue)
  - [Vue d'ensemble queue](#vue-densemble-2)
  - [Modèle de données queue](#modèle-de-données--enums)
  - [Machine d'états du Ticket](#machine-détats-du-ticket)
  - [Règles Métier Clés queue](#règles-métier-clés-1)
  - [Répertoire des Endpoints API](#répertoire-des-endpoints-api)
    - [Endpoints Salon](#1-endpoints-salon-gestionnaire--coiffeur--salonssalonidqueue)
    - [Endpoints Publics](#2-endpoints-publics-suivi-client-web--qr-code--publicqueue)
  - [Guides d'Intégration Frontend](#guides-dintégration-frontend-1)
- [Module Staff](#-module-staff)
  - [Vue d'ensemble staff](#vue-densemble-3)
  - [Modèle de données staff](#modèle-de-données--enums-1)
  - [Règles Métier Clés staff](#règles-métier-clés-2)
  - [Répertoire des Endpoints API staff](#répertoire-des-endpoints-api-1)
    - [Équipe & Coiffeurs](#1-staff--équipe--coiffeurs-salonssalonidstaff)
    - [Plannings, Pauses & Congés](#2-staff--plannings-pauses--congés-salonssalonidstaffstaffidschedule)
    - [Compétences & Prestations](#3-staff--compétences--prestations-salonssalonidstaffstaffidservices)
    - [Ressources Physiques](#4-ressources--postes-fauteuils--bacs-salonssalonidresources)
  - [Guides d'Intégration Frontend staff](#guides-dintégration-frontend-2)
- [Module Customer](#-module-customer)
  - [Vue d'ensemble customer](#vue-densemble-4)
  - [Modèle de données customer](#modèle-de-données--enums-2)
  - [Règles Métier Clés customer](#règles-métier-clés-3)
  - [Répertoire des Endpoints API customer](#répertoire-des-endpoints-api-2)
    - [Clients CRM](#1-clients--gestion-fiches-crm-salonssalonidcustomers)
    - [Notes Techniques](#2-notes--fiches-techniques-salonssalonidcustomerscustomeridnotes)
  - [Guides d'Intégration Frontend customer](#guides-dintégration-frontend-3)
- [Tests](#-tests)

---

## 🚀 Installation & Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Appliquer les migrations de base de données
npx prisma migrate dev

# 3. Générer le client Prisma
npx prisma generate

# 4. Démarrer en mode développement (hot-reload)
npm run start:dev

# L'API est disponible sur : http://localhost:3000/api/v1
# Documentation Swagger  : http://localhost:3000/api/docs
```

---

## 🔐 Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Base de données PostgreSQL (avec extension PostGIS activée)
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/coco_db?schema=public"

# Serveur
NODE_ENV="development"
PORT=3000
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Authentification JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# Cloudinary (CDN images & vidéos)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Prérequis PostgreSQL** : L'extension PostGIS doit être activée sur la base de données.
> ```sql
> CREATE EXTENSION IF NOT EXISTS postgis;
> ```

---

## 🏗️ Architecture

Le projet suit une architecture **Domain-Driven Design (DDD)** avec séparation stricte des couches :

```
src/module/<nom_module>/
├── domain/
│   ├── entities/          → Entités métier avec comportements
│   ├── value-objects/     → Objets valeur (SalonCoordinates, SalonSlug...)
│   ├── repositories/      → Interfaces des repositories (contrats)
│   └── exceptions/        → Exceptions métier du domaine
├── application/
│   ├── usecases/          → Cas d'usage (logique applicative)
│   └── dtos/              → DTOs de requête et réponse
├── infrastructure/
│   └── persistence/       → Implémentation Prisma des repositories
└── presentation/
    └── controllers/       → Contrôleurs HTTP NestJS
```

---

## 💇 Module Salon

### Vue d'ensemble

Le module Salon est le cœur de la plateforme. Il gère :

| Fonctionnalité | Description |
|----------------|-------------|
| **Profil du salon** | Création, modification, suppression |
| **Géolocalisation** | Recherche par GPS via PostGIS (`ST_DWithin`) |
| **Statut & Certification** | Machine d'états + badge vérifié |
| **Horaires** | Grille hebdomadaire + fermetures exceptionnelles |
| **Galerie média** | Photos/vidéos via Cloudinary |
| **Promotions** | Offres à durée limitée en FCFA ou % |
| **Expérience vitrine** | Thème, couleurs, mode de réservation |

---

### Modèle de données

```typescript
Salon {
  id            String          // UUID unique
  name          String          // Nom commercial
  slug          String          // URL slug unique (ex: "salon-ebene-prestige")
  phone         String          // +225XXXXXXXXXX
  whatsappPhone String?         // Numéro WhatsApp optionnel
  email         String?
  description   String?
  universe      "COCOMOUSSO" | "COCOTAILLE" | "MIXED"
  status        "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"

  // Géolocalisation ivoirienne
  commune       String          // Ex: "Cocody", "Yopougon", "Marcory"
  quartier      String          // Ex: "Angré 8ème Tranche", "Biétry"
  landmark      String          // Repère visuel: "En face de la pharmacie du 8ème"
  latitude      Float           // GPS latitude
  longitude     Float           // GPS longitude
  address       String?         // Adresse formelle optionnelle

  // Médias
  coverUrl      String?         // URL Cloudinary image de couverture
  logoUrl       String?         // URL Cloudinary logo

  // Certification & Métriques
  isVerified    Boolean         // Badge vérifié Coco
  averageRating Float           // Moyenne des avis (0.0 → 5.0)
  reviewCount   Int             // Nombre total d'avis
  createdAt     DateTime
  updatedAt     DateTime
}
```

---

### Machine d'états du salon

Tout changement de statut respecte des **transitions strictement définies** :

```
                    ┌──────────────────┐
                    │      DRAFT       │ ← Statut initial à la création
                    └──────────────────┘
                           │
              ┌────────────┘
              ▼
  ┌───────────────────────┐
  │    PENDING_REVIEW      │ ← En attente de validation Coco
  └───────────────────────┘
         │           │
    ┌────┘           └────┐
    ▼                     ▼
┌────────┐          ┌──────────┐
│ ACTIVE │◄────────►│SUSPENDED │
└────────┘          └──────────┘
    │                     │
    └─────────┬───────────┘
              ▼
         ┌──────────┐
         │ ARCHIVED │ ← État terminal (irréversible)
         └──────────┘
```

**Transitions autorisées :**

| Statut actuel | Peut aller vers |
|---------------|-----------------|
| `DRAFT` | `PENDING_REVIEW`, `ARCHIVED` |
| `PENDING_REVIEW` | `ACTIVE`, `DRAFT`, `SUSPENDED` |
| `ACTIVE` | `SUSPENDED`, `ARCHIVED` |
| `SUSPENDED` | `ACTIVE`, `ARCHIVED` |
| `ARCHIVED` | *(aucune — état terminal)* |

> ⚠️ **Important pour le frontend :** Un salon en `DRAFT` ne peut **pas** passer directement en `ACTIVE`. Il faut obligatoirement passer par `PENDING_REVIEW` d'abord.

---

### Géolocalisation PostGIS

#### Comment ça fonctionne

La recherche géographique est propulsée par **PostGIS** (extension PostgreSQL). Chaque salon possède une colonne spatiale `location geometry(Point, 4326)` synchronisée automatiquement à partir des champs `latitude`/`longitude` via un trigger SQL.

```
📱 App Mobile / Frontend
    │
    │ 1. Demander la position GPS à l'appareil
    │    navigator.geolocation.getCurrentPosition(...)
    │
    │ 2. Envoyer les coordonnées à l'API
    ▼
GET /api/v1/salons/nearby?latitude=5.4404&longitude=-3.9839&radiusKm=10
    │
    │ 3. PostGIS calcule les distances en SQL (index GiST)
    │    ST_DWithin(salon.location, Point(user), rayon_en_mètres)
    │    ST_Distance(salon.location, Point(user)) → distanceKm
    │
    │ 4. Résultats triés par distance croissante
    ▼
[{ salon: {...}, distanceKm: 2.3 }, { salon: {...}, distanceKm: 5.7 }]
```

#### Trouver ses coordonnées GPS

- **Google Maps :** Ouvrir maps.google.com → Clic droit sur sa position → copier les coordonnées
- **Abidjan — Repères utiles :**

| Commune | Latitude | Longitude |
|---------|----------|-----------|
| Cocody — Angré | 5.3599 | -4.0083 |
| Abobo — Biabou | 5.4404 | -3.9839 |
| Yopougon | 5.3396 | -4.0720 |
| Marcory | 5.3134 | -3.9951 |
| Plateau | 5.3183 | -4.0167 |
| Treichville | 5.3031 | -4.0164 |

#### Exemple d'intégration mobile (React Native / JS)

```javascript
// Récupérer la position de l'utilisateur et chercher les salons proches
function findNearbySalons() {
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const { latitude, longitude } = coords;

      const response = await fetch(
        `https://api.coco.ci/api/v1/salons/nearby` +
        `?latitude=${latitude}&longitude=${longitude}&radiusKm=10&limit=20`
      );
      const salons = await response.json();

      // salons = [{ salon: {...}, distanceKm: 2.3 }, ...]
      displaySalonsOnMap(salons);
    },
    (error) => {
      // GPS refusé → proposer la recherche par commune
      showSearchByCommune();
    }
  );
}
```

---

### Référence des endpoints

> **Base URL :** `http://localhost:3000/api/v1`
> 
> 🔓 = Public (sans authentification)
> 🔒 = Authentifié (Bearer Token JWT requis)

---

#### Salons — Core

##### `POST /salons` 🔒
**Créer un nouveau salon**

L'utilisateur connecté devient automatiquement `SALON_OWNER`. Le salon est créé en statut `DRAFT`.

- **Content-Type :** `multipart/form-data`
- **Auth :** JWT Bearer Token requis

**Corps de la requête :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | ✅ | Nom commercial du salon |
| `phone` | string | ✅ | Téléphone (+225XXXXXXXXXX) |
| `commune` | string | ✅ | Commune ivoirienne (ex: "Cocody") |
| `quartier` | string | ✅ | Quartier (ex: "Angré 8ème Tranche") |
| `landmark` | string | ✅ | Repère visuel (ex: "En face de la pharmacie X") |
| `latitude` | number | ✅ | Latitude GPS |
| `longitude` | number | ✅ | Longitude GPS |
| `universe` | enum | ❌ | `COCOMOUSSO` \| `COCOTAILLE` \| `MIXED` (défaut: `COCOMOUSSO`) |
| `slug` | string | ❌ | Slug URL personnalisé (auto-généré si absent) |
| `whatsappPhone` | string | ❌ | Numéro WhatsApp |
| `email` | string | ❌ | Email de contact |
| `description` | string | ❌ | Présentation du salon |
| `address` | string | ❌ | Adresse formelle |
| `logo` | file | ❌ | Image du logo (uploadée sur Cloudinary) |
| `cover` | file | ❌ | Image de couverture (uploadée sur Cloudinary) |

**Réponse `201 Created` :**
```json
{
  "id": "uuid",
  "name": "Salon Ébène Prestige",
  "slug": "salon-ebene-prestige",
  "status": "DRAFT",
  "universe": "COCOMOUSSO",
  "commune": "Cocody",
  "quartier": "Angré 8ème Tranche",
  "landmark": "En face de la pharmacie du 8ème",
  "coordinates": { "latitude": 5.3599, "longitude": -4.0083 },
  "isVerified": false,
  "averageRating": 0,
  "coverUrl": "https://res.cloudinary.com/...",
  "logoUrl": "https://res.cloudinary.com/...",
  "createdAt": "2026-09-27T10:00:00.000Z",
  "updatedAt": "2026-09-27T10:00:00.000Z"
}
```

---

##### `GET /salons` 🔓
**Rechercher et lister les salons (paginé)**

**Query parameters :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | number | Page (défaut: 1) |
| `limit` | number | Résultats par page (défaut: 10, max: 100) |
| `search` | string | Recherche textuelle (nom, description, commune...) |
| `commune` | string | Filtrer par commune (ex: "Cocody") |
| `quartier` | string | Filtrer par quartier |
| `universe` | enum | `COCOMOUSSO` \| `COCOTAILLE` \| `MIXED` |
| `status` | enum | `ACTIVE` \| `DRAFT` \| `PENDING_REVIEW`... |
| `isVerified` | boolean | Filtrer sur les salons certifiés |

**Exemple :**
```
GET /api/v1/salons?commune=Cocody&universe=COCOMOUSSO&page=1&limit=10
```

**Réponse `200 OK` :**
```json
{
  "data": [ /* SalonResponseDto[] */ ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

##### `GET /salons/nearby` 🔓
**Trouver les salons à proximité géographique (PostGIS)**

> Retourne uniquement les salons en statut `ACTIVE`, triés par **distance croissante**.

**Query parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `latitude` | number | ✅ | Latitude GPS de l'utilisateur (-90 à 90) |
| `longitude` | number | ✅ | Longitude GPS de l'utilisateur (-180 à 180) |
| `radiusKm` | number | ❌ | Rayon de recherche en km (défaut: 10, max: 50) |
| `universe` | enum | ❌ | `COCOMOUSSO` \| `COCOTAILLE` \| `MIXED` |
| `limit` | number | ❌ | Max résultats (défaut: 20, max: 50) |

**Exemple — Depuis Abobo Biabou, rayon 12 km :**
```
GET /api/v1/salons/nearby?latitude=5.4404&longitude=-3.9839&radiusKm=12&limit=20
```

**Réponse `200 OK` :**
```json
[
  {
    "salon": {
      "id": "6a20c26a-...",
      "name": "Salon Ébène Prestige",
      "commune": "Cocody",
      "quartier": "Angré 8ème Tranche",
      "landmark": "En face de la pharmacie du 8ème",
      "coordinates": { "latitude": 5.3599, "longitude": -4.0083 },
      "status": "ACTIVE",
      "isVerified": true,
      "averageRating": 4.8
    },
    "distanceKm": 9.3
  }
]
```

> **Note frontend :** Si l'utilisateur refuse l'accès GPS, proposer la recherche par commune (`GET /salons?commune=Cocody`) en fallback.

---

##### `GET /salons/slug/:slug` 🔓
**Obtenir la vitrine publique d'un salon par son slug**

**Exemple :**
```
GET /api/v1/salons/slug/salon-ebene-prestige
```

---

##### `GET /salons/:id` 🔓
**Obtenir les détails complets d'un salon par son ID**

```
GET /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7
```

---

##### `PATCH /salons/:id` 🔒
**Mettre à jour les informations du salon**

- **Content-Type :** `multipart/form-data`
- Tous les champs sont optionnels (PATCH partiel)
- Supporte le remplacement du logo et/ou de la couverture via `logo` / `cover`

---

##### `POST /salons/:id/logo` 🔒
**Téléverser le logo du salon vers Cloudinary**

- **Content-Type :** `multipart/form-data`
- Champ fichier : `file`

---

##### `POST /salons/:id/cover` 🔒
**Téléverser l'image de couverture vers Cloudinary**

- **Content-Type :** `multipart/form-data`
- Champ fichier : `file`

---

##### `PATCH /salons/:id/status` 🔒
**Changer le statut du salon**

Applique la machine d'états — seules les transitions autorisées sont acceptées.

**Corps :**
```json
{ "status": "PENDING_REVIEW" }
```

**Flux de mise en ligne d'un salon :**
```
Étape 1 → PATCH /status  { "status": "PENDING_REVIEW" }
Étape 2 → PATCH /status  { "status": "ACTIVE" }
```

**Erreur si transition invalide (400) :**
```json
{
  "statusCode": 400,
  "message": "Transition de statut de salon non autorisée de \"DRAFT\" vers \"ACTIVE\"."
}
```

---

##### `POST /salons/:id/verify` 🔒
**Attribuer ou retirer le badge de certification Coco**

```
POST /api/v1/salons/:id/verify           → certifie le salon (isVerified: true)
POST /api/v1/salons/:id/verify?verified=false → retire la certification
```

---

##### `DELETE /salons/:id` 🔒
**Supprimer définitivement un salon**

> ⚠️ La suppression est **irréversible** et cascade sur tous les éléments liés (horaires, médias, promotions, etc.).

---

#### Salons — Horaires

Base URL : `/api/v1/salons/:salonId/hours`

##### `GET /salons/:salonId/hours` 🔓
**Consulter les horaires d'ouverture et exceptions**

**Réponse :**
```json
{
  "hours": [
    { "dayOfWeek": 1, "openTime": "08:00", "closeTime": "19:00", "isClosed": false },
    { "dayOfWeek": 0, "openTime": null, "closeTime": null, "isClosed": true }
  ],
  "exceptions": [
    { "date": "2026-12-25", "isClosed": true, "reason": "Noël" }
  ]
}
```

> **Convention `dayOfWeek` :** `0` = Dimanche, `1` = Lundi, ..., `6` = Samedi

---

##### `PUT /salons/:salonId/hours` 🔒
**Configurer la grille d'horaires hebdomadaire**

**Corps :**
```json
{
  "hours": [
    { "dayOfWeek": 1, "openTime": "08:00", "closeTime": "19:30", "isClosed": false },
    { "dayOfWeek": 2, "openTime": "08:00", "closeTime": "19:30", "isClosed": false },
    { "dayOfWeek": 0, "openTime": null, "closeTime": null, "isClosed": true }
  ]
}
```

---

##### `POST /salons/:salonId/hours/exceptions` 🔒
**Déclarer une fermeture exceptionnelle**

Utilisé pour les jours fériés ivoiriens (Tabaski, Fête Nationale, Noël, etc.).

**Corps :**
```json
{
  "date": "2026-12-25",
  "isClosed": true,
  "reason": "Noël"
}
```

---

##### `DELETE /salons/:salonId/hours/exceptions/:exceptionId` 🔒
**Supprimer une exception d'horaire**

---

#### Salons — Médias & Vitrine

Base URL : `/api/v1/salons/:salonId/media`

##### `GET /salons/:salonId/media` 🔓
**Consulter la galerie photo/vidéo**

Retourne les médias classés par catégorie et ordre d'affichage.

**Catégories :** `SHOWCASE` (vitrine générale) · `TEAM` (équipe) · `STYLE` (coiffures réalisées)

---

##### `POST /salons/:salonId/media/upload` 🔒
**Téléverser un fichier média vers Cloudinary**

- **Content-Type :** `multipart/form-data`

| Champ | Type | Description |
|-------|------|-------------|
| `file` | file | Image ou vidéo à téléverser |
| `category` | enum | `SHOWCASE` \| `TEAM` \| `STYLE` (défaut: `SHOWCASE`) |
| `mediaType` | enum | `IMAGE` \| `VIDEO` (défaut: `IMAGE`) |

---

##### `POST /salons/:salonId/media` 🔒
**Ajouter un média via URL existante (Cloudinary)**

```json
{
  "url": "https://res.cloudinary.com/...",
  "mediaType": "IMAGE",
  "category": "STYLE"
}
```

---

##### `PATCH /salons/:salonId/media/reorder` 🔒
**Réorganiser l'ordre d'affichage des médias**

```json
{
  "orders": [
    { "id": "media-uuid-1", "sortOrder": 0 },
    { "id": "media-uuid-2", "sortOrder": 1 }
  ]
}
```

---

##### `DELETE /salons/:salonId/media/:mediaId` 🔒
**Supprimer un média de la galerie**

---

#### Salons — Promotions

Base URL : `/api/v1/salons/:salonId/promotions`

##### `GET /salons/:salonId/promotions` 🔓
**Consulter les offres promotionnelles**

```
GET /api/v1/salons/:id/promotions              → toutes les promotions actives
GET /api/v1/salons/:id/promotions?onlyActive=false  → toutes (y compris expirées)
```

---

##### `POST /salons/:salonId/promotions` 🔒
**Créer une offre promotionnelle**

```json
{
  "title": "Promo Tabaski — 20% sur les tresses",
  "description": "Offre spéciale fête de Tabaski",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "startDate": "2026-06-05T00:00:00.000Z",
  "endDate": "2026-06-10T23:59:59.000Z"
}
```

| Champ | Valeurs | Description |
|-------|---------|-------------|
| `discountType` | `PERCENTAGE` \| `FIXED_AMOUNT` | Type de réduction |
| `discountValue` | number | Pourcentage (ex: 20) ou montant FCFA (ex: 2000) |

---

##### `PATCH /salons/:salonId/promotions/:promotionId` 🔒
**Modifier une promotion existante**

---

##### `DELETE /salons/:salonId/promotions/:promotionId` 🔒
**Supprimer une promotion**

---

#### Salons — Expérience & Thème

Base URL : `/api/v1/salons/:salonId/experience`

##### `GET /salons/:salonId/experience` 🔓
**Consulter la configuration d'expérience du salon**

```json
{
  "theme": "default",
  "primaryColor": "#E05A47",
  "secondaryColor": "#1A1A1A",
  "bookingMode": "HYBRID",
  "enableQueue": true,
  "enableDeposit": true,
  "enableLoyalty": true,
  "cancelFreeLimitHours": 4,
  "delayAlertThresholdMin": 20
}
```

| Champ | Description |
|-------|-------------|
| `bookingMode` | `APPOINTMENT` (RDV) \| `WALK_IN` (sans RDV) \| `HYBRID` |
| `cancelFreeLimitHours` | Délai d'annulation sans pénalité (en heures avant le RDV) |
| `delayAlertThresholdMin` | Seuil en minutes pour déclencher une alerte retard |

---

##### `PUT /salons/:salonId/experience` 🔒
**Mettre à jour la personnalisation et les règles du salon**

```json
{
  "primaryColor": "#FF6B35",
  "bookingMode": "APPOINTMENT",
  "enableQueue": false,
  "cancelFreeLimitHours": 2
}
```

---

### Intégration Frontend — Guide rapide

#### Flux 1 — Découverte géographique (🗺️ recommandé)

```javascript
// 1. Obtenir la position GPS
const position = await new Promise((resolve, reject) =>
  navigator.geolocation.getCurrentPosition(resolve, reject)
);

// 2. Appeler l'API nearby
const { latitude, longitude } = position.coords;
const res = await fetch(
  `/api/v1/salons/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=10`
);
const nearbyList = await res.json();
// → [{ salon: {...}, distanceKm: 2.3 }, ...]
```

#### Flux 2 — Recherche par commune (📍 fallback GPS refusé)

```javascript
const res = await fetch(
  `/api/v1/salons?commune=Cocody&universe=COCOMOUSSO&page=1&limit=10`
);
const { data, total, totalPages } = await res.json();
```

#### Flux 3 — Vitrine publique d'un salon

```javascript
// Par slug (URLs propres)
const salon = await fetch(`/api/v1/salons/slug/salon-ebene-prestige`).then(r => r.json());

// Par ID
const salon = await fetch(`/api/v1/salons/6a20c26a-...`).then(r => r.json());
```

#### Flux 4 — Créer un salon (avec images)

```javascript
const formData = new FormData();
formData.append('name', 'Mon Salon');
formData.append('phone', '+2250701020304');
formData.append('commune', 'Yopougon');
formData.append('quartier', 'Niangon');
formData.append('landmark', 'Près du marché central');
formData.append('latitude', '5.3396');
formData.append('longitude', '-4.0720');
formData.append('logo', logoFile);   // File object
formData.append('cover', coverFile); // File object

const res = await fetch('/api/v1/salons', {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}` },
  body: formData,
});
```

#### Codes d'erreur courants

| Code | Cause | Solution |
|------|-------|---------|
| `400` | Données invalides ou transition de statut interdite | Vérifier les champs requis et la machine d'états |
| `401` | Token JWT absent ou expiré | Se reconnecter et inclure `Authorization: Bearer <token>` |
| `404` | Salon introuvable (id ou slug inexistant) | Vérifier l'identifiant |
| `409` | Slug déjà utilisé par un autre salon | Choisir un slug différent |

---

## 📅 Module Booking

### Vue d'ensemble

Le module Booking est le **moteur central** de la plateforme. Il gère le cycle de vie complet d'une réservation, de la création à la clôture :

| Fonctionnalité | Description |
|----------------|-------------|
| **Créneaux disponibles** | Calcul en temps réel selon horaires salon + planning staff + pauses + congés |
| **Réservation idempotente** | Protection contre les doubles soumissions sur réseau instable (Orange/MTN) |
| **Acompte & Hold** | Blocage du créneau 15 minutes pendant le paiement de l'acompte |
| **Lifecycle complet** | DRAFT → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED |
| **Fenêtre de sécurité** | `worstCaseEnd` protège les réservations suivantes contre les débordements |
| **Phases longues** | Gestion des sous-étapes pour les prestations > 5h (Locks, Tresses, etc.) |
| **Retard en direct** | Mise à jour du délai en temps réel sans casser le planning |
| **CRM auto-update** | Mise à jour compteur visites + chiffre d'affaires à la clôture |

---

### Modèle de données

```typescript
Booking {
  id                String        // UUID unique
  idempotencyKey    String        // Clé unique client (UNIQUE en DB) — protection réseau instable
  salonId           String
  customerId        String        // Client CRM du salon (SalonCustomer)
  userId            String?       // Compte utilisateur app (optionnel)
  variantId         String        // Variante de prestation
  staffId           String?       // Coiffeur/se assigné(e)

  status            BookingStatus

  // Fenêtre temporelle auto-calculée
  scheduledStart    DateTime      // Heure promise au client
  projectedEnd      DateTime      // start + setup + estimated + buffer
  worstCaseEnd      DateTime      // start + setup + max + buffer (protection planning)
  actualStart       DateTime?     // Démarrage effectif
  actualEnd         DateTime?     // Clôture effective

  delayMinutes      Int           // Retard en temps réel
  isDelayAlertSent  Boolean

  depositAmount     Decimal       // Acompte en FCFA
  totalPrice        Decimal       // Prix total en FCFA
  isDepositPaid     Boolean
  holdExpiresAt     DateTime?     // Expiration verrou 15 min

  cancellationReason String?
  clientNotes        String?      // ex: "Apporte ses propres mèches X-Pression"
  phases             BookingPhase[]
}
```

```typescript
BookingPhase {
  phaseType       "ACTIVE" | "PASSIVE"
  // ACTIVE  : coiffeur actif requis
  // PASSIVE : temps de pose — coiffeur libre pour intercaler un autre client
  name            String    // Ex: "Application défrisage", "Temps de pose soin"
  sequenceOrder   Int       // Ordre d'exécution
  durationMinutes Int
  resourceId      String?   // Fauteuil / Bac monopolisé
  startedAt       DateTime?
  endedAt         DateTime?
}
```

---

### Machine d'états de la réservation

```
  ┌──────────────────────┐         ┌──────────────────────┐
  │   PENDING_DEPOSIT    │         │      CONFIRMED       │
  │  (acompte requis)    │─confirm─►  (pas d'acompte ou   │
  │  Hold 15 min max     │  deposit   acompte payé)       │
  └──────────┬───────────┘         └──────────┬───────────┘
             │                                │ check-in
             │ cancel           no-show       ▼
             ▼                  ┌─────────────────────┐
        CANCELLED               │     CHECKED_IN      │
        NO_SHOW                 └──────────┬──────────┘
        EXPIRED                            │ start
                                           ▼
                                ┌─────────────────────┐
                                │     IN_PROGRESS     │
                                └──────────┬──────────┘
                                           │ complete
                                           ▼
                                ┌─────────────────────┐
                                │      COMPLETED      │ ← CRM mis à jour
                                └─────────────────────┘
```

| Statut actuel | Actions disponibles |
|---------------|---------------------|
| `PENDING_DEPOSIT` | `confirm-deposit` · `cancel` |
| `CONFIRMED` | `check-in` · `cancel` · `no-show` |
| `CHECKED_IN` | `start` |
| `IN_PROGRESS` | `complete` · `delay` |
| `COMPLETED` / `CANCELLED` | *(terminal — aucune action)* |

---

### Logique métier clé

#### Idempotence — Protection réseau instable (contexte Côte d'Ivoire)

```javascript
// Générer et stocker la clé AVANT d'envoyer
const idempotencyKey = crypto.randomUUID();
localStorage.setItem('pending_booking_key', idempotencyKey);

// En cas d'échec réseau → renvoyer avec LA MÊME clé → pas de doublon
const booking = await fetch('/api/v1/salons/:id/bookings', {
  method: 'POST',
  body: JSON.stringify({ idempotencyKey, ... }),
});
```

#### Calcul de la fenêtre temporelle

```
scheduledStart
  + setup (15 min)        → début de prestation effective
  + estimated (6h)        → projectedEnd   (affiché au client)
  + max (8h)              → worstCaseEnd   (protège les RDV suivants)
  + buffer (15 min)       → marge nettoyage/repos
```

#### Acompte & Hold de 15 minutes

```
POST /bookings → status: PENDING_DEPOSIT + holdExpiresAt: now + 15min
     ↓ (paiement Orange/Wave/MTN via webhook Payment module)
POST /confirm-deposit → status: CONFIRMED + holdExpiresAt: null
     ↓ (si holdExpiresAt dépassé sans paiement)
→ status: EXPIRED  (créneau libéré automatiquement)
```

---

### Référence des endpoints

> 🔒 = JWT Bearer Token requis · 🔓 = Public

**Base URL :** `/api/v1/salons/:salonId/bookings`

#### Bookings — Core

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/availability` | 🔓 | Créneaux disponibles d'une journée |
| `POST` | `/` | 🔒 | Créer une réservation (idempotente) |
| `GET` | `/` | 🔒 | Lister et filtrer les réservations du salon |
| `GET` | `/:bookingId` | 🔒 | Détail d'une réservation et ses phases |
| `POST` | `/:bookingId/confirm-deposit` | 🔒 | Confirmer le paiement de l'acompte |
| `POST` | `/:bookingId/check-in` | 🔒 | Enregistrer l'arrivée du client |
| `POST` | `/:bookingId/start` | 🔒 | Démarrer la prestation |
| `POST` | `/:bookingId/complete` | 🔒 | Clôturer la prestation (met à jour CRM) |
| `POST` | `/:bookingId/cancel` | 🔒 | Annuler avec motif |
| `POST` | `/:bookingId/no-show` | 🔒 | Marquer comme non présenté |
| `PATCH` | `/:bookingId/delay` | 🔒 | Ajuster le retard en temps réel |

##### `GET /availability` — Query parameters

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `variantId` | UUID | ✅ | Variante de prestation à analyser |
| `date` | `YYYY-MM-DD` | ✅ | Date à analyser |
| `staffId` | UUID | ❌ | Coiffeur/se souhaité(e) (sinon tous disponibles) |

**Réponse :**
```json
{
  "date": "2026-10-15",
  "variantId": "uuid",
  "totalEstimatedMinutes": 390,
  "availableSlots": [
    {
      "start": "2026-10-15T08:00:00.000Z",
      "projectedEnd": "2026-10-15T14:30:00.000Z",
      "worstCaseEnd": "2026-10-15T16:30:00.000Z",
      "staffId": "uuid",
      "staffName": "Adjoua Bamba"
    }
  ]
}
```

##### `POST /` — Corps de création

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `idempotencyKey` | string | ✅ | UUID unique généré côté client |
| `customerId` | UUID | ✅ | ID client CRM (`SalonCustomer.id`) |
| `variantId` | UUID | ✅ | ID variante de prestation |
| `scheduledStart` | ISO 8601 | ✅ | Date et heure de début |
| `staffId` | UUID | ❌ | Coiffeur/se souhaité(e) |
| `totalPrice` | number | ❌ | Prix FCFA (auto-calculé si omis) |
| `clientNotes` | string | ❌ | Instructions client |

**Exemple :**
```json
{
  "idempotencyKey": "d9b2d63d-a233-4f9e-bf41-7c98e6f1122a",
  "customerId": "550e8400-...",
  "variantId": "550e8400-...",
  "scheduledStart": "2026-10-15T09:00:00.000Z",
  "staffId": "550e8400-...",
  "clientNotes": "Apporte ses propres mèches X-Pression couleur 1B"
}
```

**Réponse clé (status PENDING_DEPOSIT) :**
```json
{
  "id": "booking-uuid",
  "status": "PENDING_DEPOSIT",
  "scheduledStart": "2026-10-15T09:00:00.000Z",
  "projectedEnd": "2026-10-15T15:30:00.000Z",
  "worstCaseEnd": "2026-10-15T17:30:00.000Z",
  "depositAmount": 5000,
  "totalPrice": 25000,
  "isDepositPaid": false,
  "holdExpiresAt": "2026-10-15T09:15:00.000Z"
}
```

> ⚠️ **Frontend :** Si `status === "PENDING_DEPOSIT"`, afficher un écran de paiement avec compte à rebours basé sur `holdExpiresAt` (15 minutes max).

##### `PATCH /:bookingId/delay` — Corps

```json
{ "delayMinutes": 20 }
```

##### `POST /:bookingId/cancel` — Corps

```json
{ "reason": "Cliente a annulé par téléphone" }
```

---

#### Booking Phases — Étapes

**Base URL :** `/api/v1/salons/:salonId/bookings/:bookingId/phases`  
🔒 **Toutes les routes nécessitent JWT.**

Pour les **prestations longues** (Locks, Tresses, Défrisage + Coloration > 5h) :

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/` | Ajouter une phase |
| `POST` | `/:phaseId/start` | Démarrer l'horodatage d'une phase |
| `POST` | `/:phaseId/end` | Clôturer l'horodatage d'une phase |
| `PATCH` | `/:phaseId` | Modifier une phase |
| `DELETE` | `/:phaseId` | Supprimer une phase |

**Corps création phase :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `phaseType` | `ACTIVE` \| `PASSIVE` | ✅ | ACTIVE = coiffeur requis / PASSIVE = temps de pose |
| `name` | string | ✅ | Nom de l'étape |
| `durationMinutes` | number | ✅ | Durée en minutes |
| `sequenceOrder` | number | ❌ | Ordre d'exécution |
| `resourceId` | UUID | ❌ | Fauteuil / Bac à monopoliser |

**Exemple — Prestation locks 8h :**
```json
[
  { "phaseType": "ACTIVE",   "name": "Shampoing & massage",     "sequenceOrder": 1, "durationMinutes": 30 },
  { "phaseType": "ACTIVE",   "name": "Application soin",        "sequenceOrder": 2, "durationMinutes": 20 },
  { "phaseType": "PASSIVE",  "name": "Temps de pose soin",      "sequenceOrder": 3, "durationMinutes": 45 },
  { "phaseType": "ACTIVE",   "name": "Rinçage & séchage",       "sequenceOrder": 4, "durationMinutes": 30 },
  { "phaseType": "ACTIVE",   "name": "Tressage locks",          "sequenceOrder": 5, "durationMinutes": 360 }
]
```

> 💡 Pendant la phase `PASSIVE`, le coiffeur peut prendre un RDV court en parallèle.

---

### Intégration Frontend — Guide complet

#### Flux complet de réservation

```javascript
// 1. Consulter les disponibilités
const slots = await fetch(
  `/api/v1/salons/${salonId}/bookings/availability?variantId=${variantId}&date=2026-10-15`
).then(r => r.json());
// → slots.availableSlots[] avec start, projectedEnd, staffId, staffName

// 2. Créer la réservation
const idempotencyKey = crypto.randomUUID();
localStorage.setItem('booking_key', idempotencyKey); // stockage pour replay réseau

const booking = await fetch(`/api/v1/salons/${salonId}/bookings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    idempotencyKey,
    customerId,
    variantId,
    scheduledStart: slots.availableSlots[0].start,
    staffId: slots.availableSlots[0].staffId,
  }),
}).then(r => r.json());

// 3. Gérer selon le statut
if (booking.status === 'PENDING_DEPOSIT') {
  // Afficher écran paiement avec compte à rebours
  const deadline = new Date(booking.holdExpiresAt);
  showPaymentScreen(booking.depositAmount, deadline);
} else {
  // Confirmé directement
  showConfirmation(booking);
}
```

#### Lifecycle côté manager (salon)

```javascript
const post = (path) => fetch(path, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

await post(`/api/v1/salons/${salonId}/bookings/${id}/check-in`);  // Client arrive
await post(`/api/v1/salons/${salonId}/bookings/${id}/start`);     // Prestation démarre
await post(`/api/v1/salons/${salonId}/bookings/${id}/complete`);  // Prestation terminée
// → visitCount++, totalSpent += price, lastVisitAt = now (CRM auto)
```

---

### Codes d'erreur Booking

| Code | Cause | Solution |
|------|-------|----------|
| `400` | Transition de statut interdite | Vérifier la machine d'états |
| `400` | Créneau indisponible (chevauchement staff) | Rafraîchir les disponibilités |
| `400` | Staff en congé approuvé | Proposer autre staff ou autre date |
| `400` | Staff non disponible ce jour (repos) | Même solution |
| `401` | Token expiré | Se reconnecter |
| `404` | Salon / Client / Variante / Staff introuvable | Vérifier les IDs |

---

## 🚶‍♂️ Module Queue — Documentation Technique

> **Coco API — File d'Attente Hybride & Live Tracking**  
> Base URL : `http://localhost:3000/api/v1`

---

### Vue d'ensemble queue

Le module **Queue** gère le flux de clients en temps réel dans le salon de coiffure en combinant deux types de flux :
1. **Walk-in (Sans RDV)** : Les clients qui se présentent spontanément au salon. Un ticket séquentiel (ex: `W-001`, `W-002`) leur est attribué.
2. **Appointment (Avec RDV)** : Les clients ayant réservé une prestation via le module Booking. Lorsqu'ils arrivent et effectuent leur check-in, un ticket prioritaire (ex: `A-001`, `A-002`) est généré et leur réservation passe en `CHECKED_IN`.

Le module propose un **Algorithme d'Ordonnancement Hybride** équitable, un **Tableau de Bord Live** pour les écrans de salle d'attente, ainsi qu'un **Système de Suivi Anonyme par QR Code** permettant aux clients de suivre l'avancée de leur passage depuis leur smartphone sans créer de compte.

---

### Modèle de données & Enums

#### Structure de l'Entité `QueueTicket`

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Identifiant unique du ticket. |
| `salonId` | `UUID` | Identifiant du salon auquel appartient la file d'attente. |
| `customerId` | `UUID` | Client rattaché au ticket. |
| `bookingId` | `UUID?` | Identifiant de la réservation associée (si type `APPOINTMENT`). |
| `queueType` | `QueueType` | `WALK_IN` ou `APPOINTMENT`. |
| `ticketNumber` | `String` | Numéro de ticket formaté (ex: `W-001`, `A-005`). |
| `status` | `QueueTicketStatus` | Statut actuel du ticket dans la file. |
| `estimate` | `Object` | Estimation d'attente (`minMinutes`, `maxMinutes`, `projectedStart`). |
| `calledAt` | `DateTime?` | Date et heure de l'appel du client au fauteuil. |
| `callDeadlineAt`| `DateTime?` | Limite d'expiration de l'appel (délai de grâce). |
| `servedAt` | `DateTime?` | Date et heure de début effectif de la prestation (`IN_SERVICE`). |
| `completedAt` | `DateTime?` | Date et heure de fin de prestation (`DONE`). |
| `qrCodeToken` | `String` | Token unique pour l'URL de suivi public client via QR Code. |
| `createdAt` | `DateTime` | Date d'arrivée / création du ticket. |
| `updatedAt` | `DateTime` | Date de dernière modification du ticket. |

#### Enums Prisma

```typescript
enum QueueType {
  WALK_IN     // Client sans RDV présent sur place
  APPOINTMENT // Client avec RDV ayant effectué son check-in à l'arrivée
}

enum QueueTicketStatus {
  WAITING     // En attente dans la salle d'attente
  CALLED      // Client appelé au fauteuil (délai de grâce en cours)
  IN_SERVICE  // Prestation en cours au fauteuil
  DONE        // Prestation terminée
  LEFT        // Client parti de lui-même avant son tour
  NO_SHOW     // Client absent lors de l'appel (délai dépassé)
}
```

---

### Machine d'états du Ticket

```
                       ┌──────────────┐
                       │   WAITING    │
                       └──────┬───────┘
                              │
             ┌────────────────┼────────────────┐
             │ (callNext)     │ (leave)        │
             ▼                ▼                │ (startService direct)
       ┌───────────┐    ┌───────────┐          │
       │  CALLED   │    │   LEFT    │          │
       └─────┬─────┘    └───────────┘          │
             │                                 │
   ┌─────────┼─────────┐                       │
   │ (start) │ (noShow)│                       │
   ▼         ▼         │                       │
┌──────────────┐ ┌───────────┐                 │
│  IN_SERVICE  │ │  NO_SHOW  │                 │
└──────┬───────┘ └───────────┘                 │
       │                                       │
       │ (complete)                            │
       ▼                                       │
┌──────────────┐                               │
│     DONE     │ <─────────────────────────────┘
└──────────────┘
```

---

### Règles Métier Clés queue

#### 1. Algorithme d'Ordonnancement Hybride (`callNext`)
Lorsqu'un coiffeur clique sur **"Appeler le suivant"** (`POST /salons/:salonId/queue/call-next`), l'algorithme trie les tickets en attente (`WAITING`) selon les règles suivantes :
1. **Priorité RDV** : Tous les tickets de type `APPOINTMENT` sont positionnés en tête de file.
2. **Ordre d'Arrivée (FIFO)** : À type égal, les tickets sont classés du plus ancien au plus récent (`createdAt` ascendant).

#### 2. Numérotation Séparée & QR Code Token
- Les numéros de tickets sont préfixés : `W-` pour Walk-in, `A-` pour Appointment, suivis d'un numéro séquentiel sur 3 chiffres (ex: `W-001`, `A-001`).
- À chaque ticket est associé un `qrCodeToken` cryptographiquement sécurisé. Ce token permet de construire une URL publique de suivi (`/public/queue/track/:qrCodeToken`).

#### 3. Délai de Grâce & Gestion des Incompatibilités
- Lors de l'appel d'un ticket (`CALLED`), le système applique un paramètre `graceMinutes` (par défaut 10 minutes) qui fixe `callDeadlineAt`.
- Si le client ne se présente pas au fauteuil avant expiration, le gérant peut passer le ticket en `NO_SHOW`.

#### 4. Synchronisation Bi-directionnelle avec Booking & CRM
- **Passage en `IN_SERVICE`** : Si le ticket est rattaché à un `bookingId`, le statut de la réservation bascule automatiquement en `IN_PROGRESS`.
- **Passage en `DONE`** : La réservation passe en `COMPLETED` et le nombre de visites + dépenses du client sont enregistrés dans le module CRM.
- **Passage en `NO_SHOW`** : La réservation rattachée bascule automatiquement en `NO_SHOW`.

---

### Répertoire des Endpoints API

#### 1. Endpoints Salon (Gestionnaire / Coiffeur) — `salons/:salonId/queue`

Tous les endpoints nécessitent une authentification Bearer JWT (`JwtAuthGuard`).

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/salons/:salonId/queue/walk-in` | Créer un ticket sans RDV (Génère `W-XXX`). |
| `POST` | `/salons/:salonId/queue/appointment` | Check-in d'un RDV (Génère `A-XXX` et passe le RDV en `CHECKED_IN`). |
| `GET` | `/salons/:salonId/queue/live` | Tableau de bord temps réel (Ecran TV / Tablette). |
| `GET` | `/salons/:salonId/queue` | Liste et recherche dans l'historique des tickets. |
| `POST` | `/salons/:salonId/queue/call-next` | Appeler le prochain client selon l'algorithme hybride. |
| `POST` | `/salons/:salonId/queue/:ticketId/call` | Appeler un ticket spécifique de la file. |
| `POST` | `/salons/:salonId/queue/:ticketId/start` | Démarrer la prestation au fauteuil (`IN_SERVICE`). |
| `POST` | `/salons/:salonId/queue/:ticketId/complete` | Terminer la prestation (`DONE`) + Synchro CRM. |
| `POST` | `/salons/:salonId/queue/:ticketId/leave` | Marquer que le client a quitté la file (`LEFT`). |
| `POST` | `/salons/:salonId/queue/:ticketId/no-show` | Marquer le client appelé comme absent (`NO_SHOW`). |
| `PATCH`| `/salons/:salonId/queue/:ticketId/estimate`| Ajuster manuellement l'estimation d'attente. |
| `GET` | `/salons/:salonId/queue/:ticketId` | Consulter les détails d'un ticket. |

---

#### 2. Endpoints Publics (Suivi Client Web & QR Code) — `public/queue`

Aucune authentification requise.

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/public/queue/track/:qrCodeToken` | Obtenir le statut et la position en direct d'un ticket. |

---

### Exemples de Requêtes & Réponses JSON

#### Création d'un ticket sans RDV (Walk-in)
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/queue/walk-in`

**Body:**
```json
{
  "customerId": "8f3b61a9-3d12-4c6e-92a1-b8412c980001",
  "serviceIds": ["srv-tresses-afro-01"]
}
```

**Réponse (201 Created):**
```json
{
  "id": "q-ticket-7711",
  "salonId": "6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7",
  "customerId": "8f3b61a9-3d12-4c6e-92a1-b8412c980001",
  "bookingId": null,
  "queueType": "WALK_IN",
  "ticketNumber": "W-004",
  "status": "WAITING",
  "estimate": {
    "minMinutes": 20,
    "maxMinutes": 35,
    "formattedRange": "20 - 35 min",
    "projectedStart": "2026-09-27T15:20:00.000Z"
  },
  "calledAt": null,
  "callDeadlineAt": null,
  "servedAt": null,
  "completedAt": null,
  "qrCodeToken": "qr_tok_991823ab8d7a6f",
  "createdAt": "2026-09-27T14:45:00.000Z",
  "updatedAt": "2026-09-27T14:45:00.000Z"
}
```

---

#### Check-in d'un RDV (Création Ticket Appointment)
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/queue/appointment`

**Body:**
```json
{
  "bookingId": "bkg-99201-xy"
}
```

**Réponse (201 Created):**
```json
{
  "id": "q-ticket-7712",
  "salonId": "6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7",
  "customerId": "c-usr-4410",
  "bookingId": "bkg-99201-xy",
  "queueType": "APPOINTMENT",
  "ticketNumber": "A-002",
  "status": "WAITING",
  "estimate": {
    "minMinutes": 5,
    "maxMinutes": 10,
    "formattedRange": "5 - 10 min",
    "projectedStart": "2026-09-27T14:55:00.000Z"
  },
  "qrCodeToken": "qr_tok_1122334455aabb",
  "createdAt": "2026-09-27T14:46:00.000Z"
}
```

---

#### Tableau de Bord Live (`/salons/:salonId/queue/live`)
`GET /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/queue/live`

**Réponse (200 OK):**
```json
{
  "salonId": "6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7",
  "currentlyCalled": [
    {
      "ticketNumber": "A-001",
      "customerName": "Aminata K.",
      "calledAt": "2026-09-27T14:42:00.000Z",
      "callDeadlineAt": "2026-09-27T14:52:00.000Z"
    }
  ],
  "inService": [
    {
      "ticketNumber": "W-002",
      "customerName": "Kouadio P.",
      "servedAt": "2026-09-27T14:30:00.000Z"
    }
  ],
  "waitingList": [
    {
      "position": 1,
      "ticketNumber": "A-002",
      "queueType": "APPOINTMENT",
      "estimatedWait": "5 - 10 min"
    },
    {
      "position": 2,
      "ticketNumber": "W-003",
      "queueType": "WALK_IN",
      "estimatedWait": "15 - 25 min"
    }
  ],
  "totalWaiting": 2,
  "averageWaitMinutes": 15
}
```

---

#### Suivi Public par QR Code (`/public/queue/track/:token`)
`GET /api/v1/public/queue/track/qr_tok_991823ab8d7a6f`

**Réponse (200 OK):**
```json
{
  "ticketNumber": "W-004",
  "status": "WAITING",
  "salonName": "Ebene Prestige",
  "positionInQueue": 3,
  "peopleAhead": 2,
  "estimatedWait": "20 - 35 min",
  "projectedStart": "2026-09-27T15:20:00.000Z",
  "isCalled": false,
  "callDeadlineAt": null
}
```

---

### Guides d'Intégration Frontend 1

#### Flux 1 : Tablette Salon / Vue Manager (Gestion de la file)
1. **Accueil Client Sans RDV** : Le gérant clique sur "+ Client Walk-in", choisit les prestations et valide. Un ticket `W-XXX` est imprimé/affiché.
2. **Arrivée Client avec RDV** : Le gérant saisit le nom/téléphone du client, retrouve la réservation et clique sur "Check-in". Le ticket `A-XXX` est généré.
3. **Appel au Fauteuil** : Un bouton principal "Appeler le Suivant" (`POST /call-next`) interroge l'API et affiche en gros le ticket appelé à l'écran.
4. **Prise en charge** : Dès que le client s'assied, le coiffeur clique sur "Démarrer Prestation" (`POST /:id/start`). Le statut passe en `IN_SERVICE`.
5. **Clôture** : En fin de coiffure, un clic sur "Terminer" (`POST /:id/complete`) clôture le ticket et met à jour le CRM.

#### Flux 2 : Écran d'Affichage Salle d'Attente (TV Live Dashboard)
- L'application TV ou la tablette fixée au mur effectue un polling à intervalle régulier (ex: toutes les 5 à 10 secondes) sur `GET /salons/:salonId/queue/live`.
- **Affichage dynamique** :
  - **Zone Appel En Cours** (Clignotant / Alerte sonore) : Affiche `currentlyCalled` avec le numéro de ticket (ex: `A-001`) et le prénom du client.
  - **Zone En Fauteuil** : Liste les tickets actuellement `inService`.
  - **Zone Prochants Clients** : Liste les numéros en attente dans l'ordre de la file avec leur position.

#### Flux 3 : Application Client / Web (Suivi par QR Code ou SMS)
- Lorsqu'un ticket est créé, un QR Code contenant l'URL `https://app.cocotaille.ci/queue/track/qr_tok_xxx` est généré.
- Le client scanne le QR Code avec son smartphone ou reçoit un SMS avec le lien.
- La page web client s'actualise en temps réel via `GET /public/queue/track/:token`.
- **Interface Client** :
  - Affiche en gros le numéro de ticket (ex: `W-004`).
  - Indique clairement : **"Il y a 2 personnes devant vous"** et **"Temps d'attente estimé : 20 - 35 min"**.
  - Si le statut passe à `CALLED`, l'écran passe en vert clignotant avec un message : **"C'est votre tour ! Veuillez vous présenter à l'accueil."**.

---

### Codes d'erreur Queue

| Code | Cause | Solution Frontend |
| :--- | :--- | :--- |
| `QUEUE_TICKET_NOT_FOUND` | L'ID du ticket ou le token QR est inexistant. | Afficher un message "Ticket expiré ou inexistant". |
| `INVALID_QUEUE_STATUS_TRANSITION` | Tentative d'action non permise par la machine d'états (ex: passer de `WAITING` à `DONE`). | Rafraîchir les données de la file et désactiver les boutons invalides. |
| `INVALID_TICKET_NUMBER_FORMAT` | Le format du numéro de ticket n'est pas conforme (`W-XXX` ou `A-XXX`). | Vérifier le générateur de tickets backend. |
| `BOOKING_ALREADY_CHECKED_IN` | Tentative de faire le check-in d'une réservation qui a déjà un ticket actif. | Proposer de consulter le ticket existant. |

---

## ✂️ Module Staff — Documentation Technique

> **Coco API — Équipe, Coiffeurs, Plannings & Ressources Physiques**  
> Base URL : `http://localhost:3000/api/v1`

---

### Vue d'ensemble staff

Le module **Staff** administre le capital humain et les ressources physiques des salons de coiffure Coco. Il permet de :
- Fonder le profil des coiffeurs, barbiers, tresseuses et coloristes avec leurs biographies et avatars (hébergés sur Cloudinary).
- Définir finement les compétences de chaque artisan ainsi que leurs durées de réalisation spécifiques (ex: un tresseur senior réalise des braides en 120 min au lieu des 180 min standard).
- Gérer les plannings hebdomadaires, les pauses récurrentes (déjeuner, prière) et les demandes de congés avec circuit d'approbation.
- Modéliser la capacité physique du salon via l'inventaire des ressources (fauteuils de coiffure, bacs à shampoing, cabines VIP).

---

### Modèle de données & Enums staff

#### Structure de l'Entité `Staff`

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Identifiant unique du membre du staff. |
| `salonId` | `UUID` | Salon d'appartenance. |
| `userId` | `UUID?` | Compte utilisateur optionnel si le coiffeur a un accès à l'application. |
| `firstName` | `String` | Prénom de l'artisan (ex: "Awa"). |
| `lastName` | `String` | Nom de famille (ex: "Koné"). |
| `displayName` | `String?` | Nom d'artiste ou d'affichage (ex: "Awa Braids Expert"). |
| `phone` | `String` | Numéro de téléphone direct. |
| `avatarUrl` | `String?` | URL Cloudinary de la photo de profil. |
| `bio` | `String?` | Biographie ou présentation des spécialités. |
| `roleTitle` | `String?` | Titre du poste (ex: "Master Coloriste", "Barbier Senior"). |
| `isActive` | `Boolean` | État d'activité au sein du salon (`true` par défaut). |
| `createdAt` | `DateTime` | Date d'enregistrement. |
| `updatedAt` | `DateTime` | Date de dernière modification. |

---

#### Structure de l'Entité `Resource` (Postes Physiques)

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Identifiant unique de la ressource. |
| `salonId` | `UUID` | Salon d'appartenance. |
| `name` | `String` | Nom du poste (ex: "Fauteuil Barber #1", "Bac Lavage VIP"). |
| `type` | `ResourceType` | Type de ressource. |
| `isActive` | `Boolean` | Indique si l'équipement est utilisable. |

```typescript
enum ResourceType {
  SEAT          // Fauteuil / Poste de coiffure
  WASH_BASIN    // Bac à shampoing / lavage
  CABIN         // Cabine privée / VIP
  SPECIAL_TOOL  // Outil ou appareil spécifique
}
```

---

#### Enums & Sous-entités du Planning

```typescript
enum TimeOffStatus {
  PENDING   // Demande en attente de validation par le manager
  APPROVED  // Congé validé (rend le staff indisponible dans le moteur Booking)
  REJECTED  // Demande refusée
}

// StaffService : Compétence attribuée au coiffeur
interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
  customMinDuration?: number;     // Durée minimale en minutes (ex: 90)
  customEstimatedDuration?: number; // Durée estimée en minutes (ex: 120)
  customMaxDuration?: number;     // Durée maximale en minutes (ex: 150)
}

// StaffWorkingHour : Horaires habituels de travail
interface StaffWorkingHour {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  startTime: string; // Ex: "08:30"
  endTime: string;   // Ex: "18:00"
  isDayOff: boolean; // Vrai si le coiffeur ne travaille pas ce jour
}

// StaffBreak : Pauses récurrentes
interface StaffBreak {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string; // Ex: "13:00"
  endTime: string;   // Ex: "14:00"
  label?: string;    // Ex: "Pause Déjeuner"
}

// StaffTimeOff : Absences & Congés
interface StaffTimeOff {
  id: string;
  staffId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: TimeOffStatus;
}
```

---

### Règles Métier Clés staff

#### 1. Compétences & Durées sur-mesure (`StaffService`)
- Par défaut, une prestation a une durée standard globale dans le module `Service`.
- L'attribution d'un service à un membre du staff (`POST /staff/:staffId/services`) permet de surcharger la durée.
- Le moteur de calcul de créneaux du module `Booking` prend systématiquement en compte les durées sur-mesure du coiffeur sélectionné pour bloquer le bon intervalle dans le calendrier.

#### 2. Grille Horaire Hebdomadaire & Pauses (`StaffWorkingHour` & `StaffBreak`)
- Chaque membre du staff possède sa propre grille d'heures de travail par jour de la semaine (`0` à `6`).
- Des pauses régulières (ex: Pause déjeuner de 12h à 13h) sont exclues automatiquement des plages de disponibilité.

#### 3. Gestion des Congés & Absences (`StaffTimeOff`)
- Lorsqu'un congé est passé à l'état `APPROVED`, toute réservation arrivant sur cette période pour ce coiffeur est rejetée avec l'erreur `STAFF_TIME_OFF_CONFLICT`.

#### 4. Gestion des Ressources Physiques (`Resource`)
- Permet au salon d'éviter la surréservation des équipements partagés (ex: si le salon n'a que 2 bacs à shampoing, seules 2 prestations nécessitant un lavage simultané peuvent être planifiées à la même heure).

#### 5. Téléversement Avatar Cloudinary
- La photo de profil d'un coiffeur peut être transmise directement lors de sa création/modification via `multipart/form-data` (champ `avatar` ou `file`) ou renseignée par URL `avatarUrl`. Les fichiers importés sont téléversés sur Cloudinary sous le dossier `coco/staff`.

---

### Répertoire des Endpoints API staff

#### 1. Staff — Équipe & Coiffeurs (`salons/:salonId/staff`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/salons/:salonId/staff` | JWT | Ajouter un membre dans l'équipe (Support multipart avec `avatar`). |
| `GET` | `/salons/:salonId/staff` | Public | Consulter l'équipe des coiffeurs (`?onlyActive=true`). |
| `GET` | `/salons/:salonId/staff/:staffId` | Public | Obtenir la fiche profil complète d'un coiffeur. |
| `PATCH` | `/salons/:salonId/staff/:staffId` | JWT | Modifier les informations d'un coiffeur (Profil/Avatar). |
| `POST` | `/salons/:salonId/staff/:staffId/avatar` | JWT | Téléverser spécifiquement l'avatar vers Cloudinary. |
| `DELETE`| `/salons/:salonId/staff/:staffId` | JWT | Désactiver / Supprimer un membre de l'équipe. |

---

#### 2. Staff — Plannings, Pauses & Congés (`salons/:salonId/staff/:staffId/schedule`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/salons/:salonId/staff/:staffId/schedule` | Public | Consulter le planning complet (Heures, Pauses, Congés). |
| `PUT` | `/salons/:salonId/staff/:staffId/schedule/hours` | JWT | Configurer les heures hebdomadaires de travail. |
| `POST` | `/salons/:salonId/staff/:staffId/schedule/breaks` | JWT | Programmer une pause (ex: Déjeuner, Prière). |
| `DELETE`| `/salons/:salonId/staff/:staffId/schedule/breaks/:breakId` | JWT | Supprimer une pause programmée. |
| `POST` | `/salons/:salonId/staff/:staffId/schedule/time-off` | JWT | Enregistrer une demande de congé/absence. |
| `PATCH` | `/salons/:salonId/staff/:staffId/schedule/time-off/:timeOffId/status` | JWT | Valider (`APPROVED`) ou refuser (`REJECTED`) un congé. |
| `DELETE`| `/salons/:salonId/staff/:staffId/schedule/time-off/:timeOffId` | JWT | Annuler une demande de congé. |

---

#### 3. Staff — Compétences & Prestations (`salons/:salonId/staff/:staffId/services`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/salons/:salonId/staff/:staffId/services` | JWT | Attribuer une prestation avec durées sur-mesure. |
| `GET` | `/salons/:salonId/staff/:staffId/services` | Public | Consulter les prestations maîtrisées par le coiffeur. |
| `PATCH` | `/salons/:salonId/staff/:staffId/services/:staffServiceId` | JWT | Ajuster les durées de réalisation personnalisées. |
| `DELETE`| `/salons/:salonId/staff/:staffId/services/:staffServiceId` | JWT | Retirer une prestation du catalogue du coiffeur. |

---

#### 4. Ressources — Postes, Fauteuils & Bacs (`salons/:salonId/resources`)

| Méthode | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/salons/:salonId/resources` | JWT | Créer un équipement / poste physique dans le salon. |
| `GET` | `/salons/:salonId/resources` | Public | Lister les ressources physiques (`?type=SEAT&onlyActive=true`). |
| `GET` | `/salons/:salonId/resources/:resourceId` | Public | Obtenir les détails d'une ressource. |
| `PATCH` | `/salons/:salonId/resources/:resourceId` | JWT | Modifier une ressource physique (Nom, type, état). |
| `DELETE`| `/salons/:salonId/resources/:resourceId` | JWT | Supprimer une ressource physique. |

---

### Exemples de Requêtes & Réponses JSON staff

#### Création d'un membre du staff
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/staff`

**Form-Data:**
- `firstName`: "Awa"
- `lastName`: "Koné"
- `displayName`: "Awa Braids Expert"
- `phone`: "+2250701020304"
- `roleTitle`: "Spécialiste Braids & Locks"
- `bio`: "Passionnée de coiffures protectrices depuis 8 ans."
- `avatar`: `[fichier image binary]`

**Réponse (201 Created):**
```json
{
  "id": "staff-9901-awa",
  "salonId": "6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7",
  "userId": null,
  "firstName": "Awa",
  "lastName": "Koné",
  "displayName": "Awa Braids Expert",
  "phone": "+2250701020304",
  "avatarUrl": "https://res.cloudinary.com/ddkrupran/image/upload/v1790423291/staff/awa.jpg",
  "bio": "Passionnée de coiffures protectrices depuis 8 ans.",
  "roleTitle": "Spécialiste Braids & Locks",
  "isActive": true,
  "createdAt": "2026-09-27T14:50:00.000Z",
  "updatedAt": "2026-09-27T14:50:00.000Z"
}
```

---

#### Attribution d'une prestation avec durées personnalisées
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/staff/staff-9901-awa/services`

**Body:**
```json
{
  "serviceId": "srv-tresses-afro-01",
  "customMinDuration": 90,
  "customEstimatedDuration": 120,
  "customMaxDuration": 150
}
```

**Réponse (201 Created):**
```json
{
  "id": "stf-srv-5501",
  "staffId": "staff-9901-awa",
  "serviceId": "srv-tresses-afro-01",
  "customMinDuration": 90,
  "customEstimatedDuration": 120,
  "customMaxDuration": 150
}
```

---

#### Configuration des heures de travail et pauses
`PUT /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/staff/staff-9901-awa/schedule/hours`

**Body:**
```json
{
  "workingHours": [
    { "dayOfWeek": 1, "startTime": "08:00", "endTime": "18:00", "isDayOff": false },
    { "dayOfWeek": 2, "startTime": "08:00", "endTime": "18:00", "isDayOff": false },
    { "dayOfWeek": 3, "startTime": "08:00", "endTime": "18:00", "isDayOff": false },
    { "dayOfWeek": 4, "startTime": "08:00", "endTime": "18:00", "isDayOff": false },
    { "dayOfWeek": 5, "startTime": "08:00", "endTime": "19:00", "isDayOff": false },
    { "dayOfWeek": 6, "startTime": "08:00", "endTime": "20:00", "isDayOff": false },
    { "dayOfWeek": 0, "startTime": "00:00", "endTime": "00:00", "isDayOff": true }
  ]
}
```

**Réponse (200 OK):**
```json
[
  { "id": "wh-1", "dayOfWeek": 1, "startTime": "08:00", "endTime": "18:00", "isDayOff": false },
  { "id": "wh-7", "dayOfWeek": 0, "startTime": "00:00", "endTime": "00:00", "isDayOff": true }
]
```

---

#### Demande et validation de congé
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/staff/staff-9901-awa/schedule/time-off`

**Body:**
```json
{
  "startDate": "2026-10-05T00:00:00.000Z",
  "endDate": "2026-10-12T23:59:59.000Z",
  "reason": "Congés annuels"
}
```

**Réponse (201 Created):**
```json
{
  "id": "to-8820",
  "staffId": "staff-9901-awa",
  "startDate": "2026-10-05T00:00:00.000Z",
  "endDate": "2026-10-12T23:59:59.000Z",
  "reason": "Congés annuels",
  "status": "PENDING"
}
```

**Validation par le Manager (`PATCH /schedule/time-off/to-8820/status`):**
```json
{
  "status": "APPROVED"
}
```

---

#### Création d'une ressource physique (Fauteuil / Bac)
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/resources`

**Body:**
```json
{
  "name": "Bac à Shampoing Ergonomique #1",
  "type": "WASH_BASIN"
}
```

**Réponse (201 Created):**
```json
{
  "id": "res-1102-wb",
  "salonId": "6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7",
  "name": "Bac à Shampoing Ergonomique #1",
  "type": "WASH_BASIN",
  "isActive": true
}
```

---

### Guides d'Intégration Frontend staff

#### Flux 1 : Gestionnaire Salon (Dashboard RH & Équipements)
1. **Création d'un Coiffeur** : Le gérant ouvre l'onglet "Équipe", clique sur "+ Nouveau Coiffeur", choisit une photo (téléversée directement sur Cloudinary) et saisit le rôle.
2. **Attribution des Services** : Dans la fiche du coiffeur, le gérant coche les prestations qu'il maîtrise et ajuste ses durées si le coiffeur est plus rapide ou plus minutieux que la moyenne.
3. **Gestion du Planning & Valider Congés** : Une vue calendrier affiche les demandes de congés `PENDING`. Un clic sur "Approuver" passe le congé en `APPROVED`, rendant le coiffeur indisponible pour les réservations aux dates choisies.
4. **Inventaire du Matériel** : L'onglet "Ressources" permet d'ajouter les fauteuils et bacs pour modéliser la capacité exacte de la salle.

#### Flux 2 : Espace Coiffeur / Membre du Staff
- Le coiffeur accède à sa fiche et consulte ses horaires hebdomadaires.
- Il peut soumettre une demande de repos / congé (`POST /schedule/time-off`) en indiquant les dates et le motif.
- Il consulte les prestations qui lui sont associées et ses durées de réalisation.

#### Flux 3 : Réservation Client (Choix du Coiffeur & Disponibilités)
- Lors de la réservation (`Booking`), le client choisit la prestation puis sélectionne son coiffeur préféré via `GET /salons/:id/staff`.
- L'interface affiche la photo avatar, le nom commercial (`displayName`), la bio et la note du coiffeur.
- Si un coiffeur me sélectionne, l'API `GET /bookings/available-slots` utilise la durée sur-mesure (`customEstimatedDuration`) du coiffeur et exclut ses jours de repos/congés validés (`APPROVED`).

---

### Codes d'erreur Staff

| Code | Cause | Solution Frontend |
| :--- | :--- | :--- |
| `STAFF_NOT_FOUND` | L'ID du membre du staff est invalide ou supprimé. | Vérifier la liste du staff et rafraîchir. |
| `RESOURCE_NOT_FOUND` | L'ID de la ressource est introuvable. | Sélectionner une ressource existante. |
| `STAFF_SERVICE_NOT_FOUND` | La prestation n'est pas attribuée à ce coiffeur. | Assigner d'abord la prestation au coiffeur. |
| `TIME_OFF_NOT_FOUND` | La demande de congé est introuvable. | Vérifier la liste des congés. |
| `INVALID_TIME_OFF_DATES` | La date de début de congé est postérieure à la date de fin. | Valider le formulaire de dates côté client. |

---

## 👥 Module Customer — Documentation Technique

> **Coco API — CRM Client, Auto-segmentation & Fiches Techniques**  
> Base URL : `http://localhost:3000/api/v1`

---

### Vue d'ensemble customer

Le module **Customer** constitue le moteur **CRM (Customer Relationship Management)** dédié aux salons de coiffure Coco. Il permet de :
- Centraliser l'annuaire des clients du salon rattachés par leur numéro de téléphone (au format `+225`).
- Calculer automatiquement les performances de fidélité de chaque client (nombre de visites, cumul dépensé en FCFA, date du dernier passage).
- Classer dynamiquement les clients via une **Auto-segmentation intelligente** (`NEW`, `REGULAR`, `INACTIVE`, `VIP`).
- Conserver des **Fiches Techniques Confidentielles** rédigées par les coiffeurs (sensibilité du cuir chevelu, références des teintes de coloration, habitudes d'entretien des mèches).

---

### Modèle de données & Enums customer

#### Structure de l'Entité `SalonCustomer`

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Identifiant unique de la fiche client. |
| `salonId` | `UUID` | Identifiant du salon propriétaire de la fiche CRM. |
| `userId` | `UUID?` | Compte utilisateur applicatif lié (si le client utilise l'application Mobile Coco). |
| `phone` | `String` | Numéro de téléphone au format `+225` (Unique par salon). |
| `name` | `String` | Nom et prénom du client (ex: "Aminata Koné"). |
| `email` | `String?` | Adresse email (optionnelle). |
| `segment` | `CustomerSegmentType` | Segment du client (`NEW`, `REGULAR`, `INACTIVE`, `VIP`). |
| `visitCount` | `Integer` | Cumul du nombre de prestations terminées dans le salon. |
| `totalSpent` | `Float` | Cumul des montants dépensés en FCFA. |
| `lastVisitAt` | `DateTime?` | Date et heure de la dernière prestation réalisée. |
| `createdAt` | `DateTime` | Date de création de la fiche client. |
| `updatedAt` | `DateTime` | Date de dernière mise à jour. |

---

#### Structure de l'Entité `CustomerNote` (Fiche Technique)

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Identifiant unique de la note. |
| `salonId` | `UUID` | Salon d'appartenance. |
| `salonCustomerId` | `UUID` | Client rattaché à la note. |
| `authorId` | `UUID` | Identifiant de l'auteur (Coiffeur / Manager). |
| `content` | `String` | Contenu textuel de la fiche technique ou observation. |
| `isPrivate` | `Boolean` | Visibilité confidentielle interne au salon (`true` par défaut). |
| `createdAt` | `DateTime` | Date de rédaction. |
| `updatedAt` | `DateTime` | Date de dernière révision. |

---

#### Enums Prisma

```typescript
enum CustomerSegmentType {
  NEW       // Nouveau client (0 à 1 visite)
  REGULAR   // Client habituel (à partir de 2 visites)
  INACTIVE  // Client n'ayant pas effectué de visite récente
  VIP       // Client à haute valeur (≥ 100 000 FCFA dépensés OU ≥ 6 visites)
}
```

---

### Règles Métier Clés customer

#### 1. Auto-segmentation Intelligente des Clients
Le statut du client bascule automatiquement au fur et à mesure que ses prestations sont finalisées (`DONE` dans le module Booking ou Queue) via la méthode `recordVisit(spentAmount)` :
- **Segment `VIP`** : Déclenché dès que `totalSpent >= 100000 FCFA` OU `visitCount >= 6`.
- **Segment `REGULAR`** : Déclenché dès que `visitCount >= 2`.
- **Segment `NEW`** : Statut initial par défaut pour les nouveaux clients.

#### 2. Métriques CRM & Historique de Visites
- À chaque clôture de prestation, le total des dépenses cumulées (`totalSpent`) est incrémenté et la date du jour est enregistrée dans `lastVisitAt`.
- Ces métriques permettent aux gérants de salon d'identifier instantanément leurs meilleurs clients pour leur offrir des promotions ciblées.

#### 3. Fiches Techniques & Notes Confidentielles
- Les fiches techniques (`CustomerNote`) sont enregistrées avec le `authorId` du coiffeur connecté.
- Permet de conserver l'historique capillaire du client : *"Sensible au défrisage", "Utiliser teinte Majirel 6.3", "Préfère les tresses pas trop serrées"*.

#### 4. Recherche Multi-critères & Unicité Téléphone
- Le numéro de téléphone (`phone`) est unique par salon. Une tentative de création en double renvoie l'erreur HTTP 409 `CUSTOMER_ALREADY_EXISTS`.
- L'endpoint `GET /salons/:salonId/customers` supporte la recherche textuelle instantanée par nom ou téléphone, ainsi que le filtre par segment (ex: `VIP`).

---

### Répertoire des Endpoints API customer

Tous les endpoints nécessitent une authentification Bearer JWT (`JwtAuthGuard`).

#### 1. Clients — Gestion Fiches CRM (`salons/:salonId/customers`)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/salons/:salonId/customers` | Enregistrer une nouvelle fiche client. |
| `GET` | `/salons/:salonId/customers` | Lister et rechercher les clients (filtres `segment`, `search`, `page`, `limit`). |
| `GET` | `/salons/:salonId/customers/:customerId` | Obtenir la fiche complète d'un client. |
| `PATCH` | `/salons/:salonId/customers/:customerId` | Mettre à jour les coordonnées ou forcer le segment du client. |
| `DELETE`| `/salons/:salonId/customers/:customerId` | Supprimer une fiche client. |

---

#### 2. Notes & Fiches Techniques (`salons/:salonId/customers/:customerId/notes`)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/salons/:salonId/customers/:customerId/notes` | Ajouter une note / fiche technique sur un client. |
| `GET` | `/salons/:salonId/customers/:customerId/notes` | Consulter l'historique des notes techniques du client. |
| `PATCH` | `/salons/:salonId/customers/:customerId/notes/:noteId` | Modifier une note technique existante. |
| `DELETE`| `/salons/:salonId/customers/:customerId/notes/:noteId` | Supprimer une note technique. |

---

### Exemples de Requêtes & Réponses JSON customer

#### Création d'une fiche client CRM
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/customers`

**Body:**
```json
{
  "name": "Aminata Koné",
  "phone": "+2250701020304",
  "email": "aminata.kone@gmail.com"
}
```

**Réponse (201 Created):**
```json
{
  "id": "cust-9910-ami",
  "salonId": "6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7",
  "userId": null,
  "name": "Aminata Koné",
  "phone": "+2250701020304",
  "email": "aminata.kone@gmail.com",
  "segment": "NEW",
  "visitCount": 0,
  "totalSpent": 0,
  "lastVisitAt": null,
  "createdAt": "2026-09-27T15:05:00.000Z",
  "updatedAt": "2026-09-27T15:05:00.000Z"
}
```

---

#### Recherche et liste paginée des clients (`GET /customers?segment=VIP`)
`GET /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/customers?segment=VIP&page=1&limit=10`

**Réponse (200 OK):**
```json
{
  "data": [
    {
      "id": "cust-9910-ami",
      "salonId": "6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7",
      "name": "Aminata Koné",
      "phone": "+2250701020304",
      "email": "aminata.kone@gmail.com",
      "segment": "VIP",
      "visitCount": 8,
      "totalSpent": 145000,
      "lastVisitAt": "2026-09-25T16:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

#### Ajout d'une note / fiche technique
`POST /api/v1/salons/6a20c26a-ea33-48fe-8fe9-22f6a7e7a6b7/customers/cust-9910-ami/notes`

**Body:**
```json
{
  "content": "Cuir chevelu très sensible au défrisage. Préfère la formule douce au beurre de karité. Tresses afro 24 pouces.",
  "isPrivate": true
}
```

**Réponse (201 Created):**
```json
{
  "id": "note-5501-tek",
  "salonCustomerId": "cust-9910-ami",
  "authorId": "user-coiffeur-uuid",
  "content": "Cuir chevelu très sensible au défrisage. Préfère la formule douce au beurre de karité. Tresses afro 24 pouces.",
  "isPrivate": true,
  "createdAt": "2026-09-27T15:08:00.000Z",
  "updatedAt": "2026-09-27T15:08:00.000Z"
}
```

---

### Guides d'Intégration Frontend customer

#### Flux 1 : Tablette Réception / Caisse Salon (Profil Client CRM)
1. **Recherche Rapide** : Lors de l'accueil ou de l'encaissement, le gérant tape le numéro de téléphone ou le nom du client dans la barre de recherche.
2. **Identification Badge** : La fiche affiche clairement le badge de segment : `VIP` (Or), `REGULAR` (Bleu), `NEW` (Vert).
3. **Statistiques en un coup d'œil** : Affiche le cumul dépensé (ex: `145 000 FCFA`) et le nombre de visites pour récompenser la fidélité.

#### Flux 2 : Espace Coiffeur (Consultation Fiches Techniques)
- Avant d'entamer une prestation, le coiffeur ouvre la fiche du client sur la tablette du salon.
- Il consulte la section "Notes techniques" pour lire les instructions spécifiques rédigées lors des passages précédents.
- À la fin de la coiffure, il ajoute une nouvelle note pour consigner les produits utilisés ou les mélanges de teintes.

---

### Codes d'erreur Customer

| Code | Cause | Solution Frontend |
| :--- | :--- | :--- |
| `CUSTOMER_NOT_FOUND` | L'ID du client est introuvable dans ce salon. | Vérifier la recherche et rafraîchir l'annuaire. |
| `CUSTOMER_ALREADY_EXISTS` | Un client avec ce numéro de téléphone existe déjà dans ce salon. | Proposer d'ouvrir la fiche existante. |
| `CUSTOMER_NOTE_NOT_FOUND` | La note technique spécifiée est introuvable. | Rafraîchir l'historique des notes. |
| `INVALID_PHONE_FORMAT` | Le numéro de téléphone ne respecte pas le format `+225`. | Valider le format de numéro dans l'imput client. |

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

---

## 📄 License

Ce projet est sous licence privée — © Cocotaille / Cocomousso.
