# Burger Shop

Application Angular qui reproduit la maquette « Burgerito » et consomme l'API `https://node-eemi.vercel.app/api` pour proposer un mini e-commerce de burgers.

## instructions d’installation/ lancement,

```bash
npm install
npm start
```
> L’API Node (JWT) est hébergée : `https://node-eemi.vercel.app`.  

L'application est disponible sur `http://localhost:4200`. Les tests unitaires s'exécutent avec :

```bash
npm test
```

### Fonctionnalités principales

- **Catalogue** : récupération et affichage de tous les burgers, avec marquage « indisponible » et bouton d'ajout désactivé.
- **Détail produit** : fiche complète du burger et suggestions d'autres recettes.
- **Panier** : stockage des IDs produit, jointure locale avec le catalogue, suppression, total recalculé dynamiquement et blocage si un article est indisponible.
- **Authentification JWT** : inscription, connexion, restauration de session et déconnexion.
- **Commande** : envoi de la liste d'IDs, gestion des erreurs 400/401, vidage du panier et redirection vers la page de confirmation.
- **Profil** : historique des commandes groupées par date (accès protégé).
- **Gestion des erreurs** : messages clairs pour 400/401/404 selon les cas d'usage décrits dans l'énoncé.

#### Organisation du code

```
src/app/
├── core/                // Services d'accès aux données et logique de domaine
│   ├── api/             // DTOs, mappers et configuration API
│   ├── guards/          // Garde d'authentification
│   ├── interceptors/    // Intercepteur JWT
│   ├── models/          // Modèles métiers typés
│   └── services/        // AuthService, ProductService, CartService, OrderService
├── features/            // Pages (home, cart, auth, profil, etc.)
├── shared/              // Pipes et éléments réutilisables
└── app.*                // Shell de l'application (layout + navigation)
```

Chaque page est un composant autonome (standalone component) chargé à la demande via le routeur (`loadComponent`) pour optimiser le code et rapprocher logique + template + style au même endroit.


# Authentification
- `AuthService` restaure le token depuis `localStorage`, vérifie la session via `/auth/me` et expose le signal `isAuthenticated`.
- L'intercepteur `authInterceptor` ajoute automatiquement l'entête `Authorization: Bearer <token>` pour toutes les requêtes API.
- La garde `authGuard` attend la restauration de session avant de laisser accéder aux pages protégées et redirige vers `/login` avec `redirectTo`.

## Panier
- `CartService` stocke uniquement les IDs des burgers dans `localStorage` et expose des signaux pour le nombre d'articles et la liste brute.
- `CartComponent` recalcule le panier enrichi en joignant les produits déjà chargés (`ProductService`) et recalcul le total uniquement sur les articles disponibles.
- Lors d'une commande réussie, le panier est vidé et la confirmation récupère les informations via l'état de navigation.

### Produits et commandes
- `ProductService` met en cache la liste complète (`/products`) et fournit des recherches unitaires (`/products/:id`).
- `OrderService` encapsule les appels `/orders` et `/orders/me`, en transformant la réponse API en modèles métiers homogènes via les mappers.

#### Gestion des erreurs UI

- **401** : message invitant à se reconnecter + redirection vers `/login` sans vider le panier.
- **400** : message explicite (ex. produit indisponible). L'utilisateur peut corriger (supprimer du panier ou modifier le formulaire).
- **404** : affichage dédié (page « 404 », fiche produit introuvable) avec action de retour.

###### Justification des choix techniques
| **Standalone components** | Chaque page (`HomeComponent`, `CartComponent`, `ProfileComponent`, etc.) est autonome. Cela simplifie le lazy loading dans `app.routes.ts` et évite des modules Angular supplémentaires, ce qui améliore la lisibilité et la maintenance. |
| **Services** | `AuthService`, `ProductService`, `CartService` et `OrderService` centralisent la logique métier (récupération API, cache, gestion du localStorage). Les composants restent concentrés sur l'UI et bénéficient d'une réutilisabilité accrue. |
| **Guard** | `authGuard` assure que la session est restaurée avant d'accéder au profil. Il renvoie vers `/login` avec `redirectTo`, garantissant la sécurité d'accès aux routes protégées. |
| **Interceptor** | `authInterceptor` ajoute l'entête JWT uniquement pour les URLs de l'API (`API_BASE_URL`). L'ajout est centralisé et transparent pour tous les services. |
| **Pipe** | `PricePipe` fournit un formatage monétaire cohérent (locale `fr-FR`, EUR) utilisé dans tout le projet (catalogue, panier, profil, confirmation). |
| **DTOs & Mappers** | Les interfaces `ProductDto`, `OrderDto`, `AuthResponseDto`, etc., décrivent les structures brutes de l'API. Les mappers (`mapProductDto`, `mapOrderDto`, `mapUserDto`) traduisent ces DTOs vers des modèles métiers uniformes (`Product`, `Order`, `User`) pour isoler l'UI des changements d'API et centraliser les conversions (ex. `_id` → `id`). |
| **Organisation** | Séparation `core/` (métier + accès données), `features/` (pages), `shared/` (UI réutilisable) et `app.*` (layout global). Cette architecture clarifie les responsabilités et facilite l'évolution (ajout d'une nouvelle page, remplacement de l'API...). |
| **Gestion du panier** | `CartService` stocke uniquement des IDs (exigence du sujet) et expose des signaux permettant aux composants d'écouter les changements en temps réel sans librairie de state management externe. |

