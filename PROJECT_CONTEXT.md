# Contexte du projet : Application de dictées pour enfants

---

## Objectif global
Créer une application web éducative permettant :
- À un adulte de créer des dictées (liste de mots).
- À un enfant de passer ces dictées (écoute + écriture), avec feedback immédiat.

---

## Fonctionnalités attendues

### Pour l’adulte
- Créer une dictée : Saisir une liste de mots et les enregistrer.
- Voir la liste des dictées existantes.

### Pour l’enfant
- Passer une dictée : Écouter les mots dictés et écrire les réponses.
- Voir son score : Nombre de mots corrects et liste des mots incorrects.
- Recommencer pour améliorer son score.

---

## Stack technique imposée
- Backend : Java (Spring Boot)
- Frontend : React + Tailwind CSS
- Base de données : Pas nécessaire au début
- Synthèse vocale : Moteur en français (à définir)

---

## Structure du projet
- à définir

---

## Exemple de flux utilisateur
1. Adulte crée une dictée ("chat", "chien", "maison").
2. Enfant sélectionne la dictée → entend "chat" → écrit "cha" → l’application indique "Incorrect".
3. Fin : Affiche "Score : 0/3" et liste les mots incorrects.

---

## Points de vigilance
- Synthèse vocale : Vérifier que les mots sont bien prononcés en français.
- Orthographe : Gérer les cas simples (pas besoin de grammaire complexe pour l’instant).
- Design : Interface épurée, adaptée aux enfants.

---

## Ressources utiles
- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)