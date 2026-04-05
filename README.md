# Dictée

Application web éducative pour entraîner l'orthographe des enfants via des dictées de mots.

## Objectif

Le projet propose deux parcours simples :

- Adulte : créer des dictées (nom + liste de mots)
- Enfant : écouter les mots, écrire les réponses, obtenir un score et recommencer

## Stack technique

- Backend : Java 21 + Spring Boot
- Frontend : React (Vite) + Tailwind CSS
- Base de données : aucune pour l'instant (stockage en mémoire)
- Synthèse vocale : Web Speech API du navigateur (fr-FR)

## Structure du projet

- backend : API REST Spring Boot
- frontend : interface React pour créer et passer les dictées

## Fonctionnalités implémentées

- Création d'une dictée avec un nom et une liste de mots
- Liste des dictées existantes
- Lancement d'une dictée mot par mot
- Lecture audio des mots en français
- Validation immédiate (correct / incorrect)
- Affichage du score final et des erreurs
- Recommencer une dictée

## Démarrage rapide

### Avec Docker Compose (recommandé)

Prérequis : [Docker](https://docs.docker.com/get-docker/) installé.

Depuis la racine du projet :

```bash
docker compose up --build
```

- Frontend : http://localhost:80
- API backend : http://localhost:8080/api

Le frontend appelle le backend via un reverse-proxy nginx intégré (`/api` → `http://backend:8080/api`).

Pour arrêter les services :

```bash
docker compose down
```

### En développement (sans Docker)

#### 1) Lancer le backend

Depuis le dossier `backend` :

```bash
mvn spring-boot:run
```

Le backend démarre sur le port 8080.

#### 2) Lancer le frontend

Depuis le dossier `frontend` :

```bash
npm install
npm run dev
```

Le frontend démarre sur le port 5173. Le proxy Vite redirige automatiquement `/api` vers `http://localhost:8080`.

## API REST

Base URL : `http://localhost:8080/api`

- `GET  /dictations`      — récupérer toutes les dictées
- `GET  /dictations/{id}` — récupérer une dictée par son identifiant
- `POST /dictations`      — créer une dictée

Exemple de payload `POST /dictations` :

```json
{
  "name": "Animaux",
  "words": ["chat", "chien", "lapin"]
}
```

## Notes importantes

- Les données ne sont pas persistées : un redémarrage du backend réinitialise les dictées.
- La synthèse vocale dépend des voix disponibles dans le navigateur et le système.
- Le frontend utilise un proxy Vite pour rediriger /api vers http://localhost:8080.

## Profils Spring et configuration CORS

Le backend utilise deux profils Spring pour gérer le CORS selon l'environnement.

### Profil dev (développement local)

Activez le profil dev lors du démarrage :

    mvn spring-boot:run -Dspring-boot.run.profiles=dev

Origine autorisée : http://localhost:5173 (serveur Vite)

### Profil prod (production)

Activez le profil prod et définissez l'origine de votre frontend :

    SPRING_PROFILES_ACTIVE=prod mvn spring-boot:run

Ou via les variables d'environnement système / votre plateforme de déploiement :

    SPRING_PROFILES_ACTIVE=prod
    CORS_ALLOWED_ORIGINS=https://votre-domaine.example.com

En profil prod, le wildcard * n'est pas accepté. L'origine doit être explicite.
Pour surcharger la valeur définie dans application-prod.properties, utilisez la variable d'environnement :

    CORS_ALLOWED_ORIGINS=https://votre-domaine.example.com

Ou la propriété système Java :

    -Dcors.allowed-origins=https://votre-domaine.example.com

### Sans profil actif

Si aucun profil n'est activé, le backend utilise les valeurs de application.properties
(origine autorisée : http://localhost:5173).

## Variable d'environnement frontend

| Variable       | Description                                          | Valeur par défaut |
|----------------|------------------------------------------------------|-------------------|
| `VITE_API_URL` | URL de base du backend (sans slash final)            | `` (vide)         |

En développement, laissez `VITE_API_URL` vide : le proxy Vite redirige automatiquement
les appels `/api/*` vers `http://localhost:8080`.

En production, créez un fichier `.env.production` (voir `.env.example`) :

    VITE_API_URL=https://api.votre-domaine.example.com

Puis lancez le build :

    npm run build

## Pistes d'évolution

- Ajouter une persistance (H2, PostgreSQL, etc.)
- Ajouter l'authentification adulte/enfant
- Ajouter des niveaux de difficulté et des statistiques
- Améliorer l'accessibilité et l'UX pour de jeunes enfants