# Contexte du projet : Application de dictées pour enfants

---

## Objectif global
Créer une application web éducative permettant :
- À un adulte de créer des dictées (liste de mots).
- À un enfant de passer ces dictées (écoute + écriture), avec feedback immédiat.

---

## Fonctionnalités implémentées

### Pour l'adulte
- Créer une dictée : Saisir un nom et une liste de mots, puis enregistrer.
- Voir la liste des dictées existantes.

### Pour l'enfant
- Passer une dictée : Écouter les mots dictés (synthèse vocale) et écrire les réponses.
- Feedback immédiat : Correct / Incorrect après chaque mot.
- Voir son score final et la liste des erreurs.
- Recommencer une dictée pour améliorer son score.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Java 21 + Spring Boot |
| Frontend | Vue 3 + Vite + Vue Router + Tailwind CSS |
| Base de données | PostgreSQL (prod) / H2 (dev) via Spring Data JPA |
| Synthèse vocale | Web Speech API du navigateur (fr-FR) |
| Tests frontend | Vitest + @testing-library/vue |

---

## Structure du projet

```
dictee/
├── backend/               # API REST Spring Boot
│   └── src/main/java/com/dictee/
│       ├── controller/    # Endpoints REST
│       ├── model/         # Entités JPA (Dictation, DictationScore)
│       ├── repository/    # Spring Data JPA repositories
│       ├── service/       # Logique métier
│       └── config/        # Configuration CORS, profils Spring
├── frontend/              # Interface Vue 3
│   └── src/
│       ├── components/    # Composants Vue (CreateDictation, DictationList, PlayDictation)
│       ├── App.vue        # Composant racine
│       ├── router.js      # Vue Router (routes de l'application)
│       ├── main.js        # Point d'entrée
│       └── config.js      # URL de base de l'API
├── docker-compose.yml     # Orchestration locale (frontend + backend + PostgreSQL)
└── render.yaml            # Déploiement Render (Blueprint)
```

---

## Exemple de flux utilisateur
1. Adulte crée une dictée ("chat", "chien", "maison").
2. Enfant sélectionne la dictée → entend "chat" → écrit "cha" → l'application indique "Incorrect".
3. Fin : Affiche "Score : 0/3" et liste les mots incorrects.

---

## Points de vigilance
- Synthèse vocale : Vérifier que les mots sont bien prononcés en français (dépend des voix installées sur le système).
- Orthographe : Gérer les cas simples (pas besoin de grammaire complexe pour l'instant).
- Design : Interface épurée, adaptée aux enfants.
- CORS : Configurer les origines autorisées selon l'environnement (profils Spring `dev` / `prod`).

---

## Ressources utiles
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Vue 3](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
