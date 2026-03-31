<p align="center">
  <img src="./public/favicon.svg" width="120" alt="GeoQuiz logo" />
</p>
<h1 align="center">GeoQuiz</h1>

> Testez vos connaissances géographiques — drapeaux, cartes, pays — en trois modes de jeu et trois niveaux de difficulté.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat&logo=sass&logoColor=white)

---

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Installation & lancement](#installation--lancement)
- [Structure du projet](#structure-du-projet)
- [Utiliser le site](#utiliser-le-site)
- [Modes de jeu](#modes-de-jeu)
- [Difficultés](#difficultés)
- [Scores & historique](#scores--historique)

---

## Présentation

GeoQuiz est une application web interactive de quiz géographique couvrant les **193 pays membres de l'ONU**. L'objectif est simple : tester et améliorer sa connaissance des drapeaux, des frontières et des noms de pays à travers le monde.

Le projet a été réalisé dans le cadre d'un **challenge 48h** (Ynov Informatique — Bachelor 1/2/3) par une équipe de 7 étudiants.

---

## Stack technique

| Outil | Rôle |
|---|---|
| **React 19** | UI & composants |
| **TypeScript** | Typage statique |
| **Vite 7** | Bundler & dev server |
| **SCSS Modules** | Styles scopés par composant |
| **React Router DOM** | Navigation entre pages |
| **Leaflet** | Carte interactive (mode Carte → Pays) |
| **topojson-client** | Parsing des données géographiques |
| **country-flag-icons** | Composants drapeaux SVG |
| **react-icons** | Icônes (Feather Icons) |
| **flagcdn.com** | Images PNG des vrais drapeaux |

---

## Installation & lancement

### Prérequis

- **Node.js** v18 ou supérieur
- **npm** v9 ou supérieur

### 1. Cloner le dépôt

```bash
git clone https://github.com/[votre-username]/geoquiz.git
cd geoquiz
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Le site est accessible sur [http://localhost:5173](http://localhost:5173)

### 4. Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans le dossier `dist/`.

### 5. Prévisualiser le build de production

```bash
npm run preview
```

---

## Structure du projet

```
src/
├── components/            # Composants réutilisables
│   ├── Button/            # Bouton générique (variantes : primary, secondary, ghost)
│   ├── FlagIcon/          # Affichage d'un drapeau via flagcdn.com
│   ├── Header/            # Barre de navigation (logo, liens, burger mobile, thème)
│   ├── ProgressBar/       # Barre de progression des questions
│   ├── ThemeToggle/       # Bouton dark / light mode
│   ├── Timer/             # Compte à rebours circulaire SVG
│   └── WorldGlobe/        # Globe 3D animé (page d'accueil)
│
├── context/
│   ├── GameContext.tsx    # Config de la partie en cours (mode, difficulté, continent…)
│   └── ThemeContext.tsx   # Dark / light mode global
│
├── data/
│   └── countries.json     # Les 193 pays ONU (nom FR, code ISO, continent)
│
├── game/                  # Composants de jeu par mode
│   ├── FlagToCountry/     # Drapeau affiché → trouver le pays
│   ├── CountryToFlag/     # Nom du pays → trouver le drapeau
│   └── MapToCountry/      # Pays en surbrillance sur la carte → le nommer
│
├── hooks/
│   ├── useGame.ts         # Logique centrale (génération questions, score, progression)
│   └── useTimer.ts        # Timer avec callbacks (expire, pause, reset)
│
├── pages/
│   ├── Home/              # Page d'accueil avec globe animé
│   ├── GameSetup/         # Configuration de la partie
│   ├── Game/              # Page de jeu principale
│   ├── Summary/           # Résultats de fin de partie
│   └── Scores/            # Historique des meilleurs scores
│
├── router/
│   └── AppRouter.tsx      # Déclaration des routes React Router
│
├── styles/                # SCSS global
│   ├── _variables.scss    # Typographie, espacements, breakpoints
│   ├── _themes.scss       # Variables CSS dark / light mode
│   ├── _mixins.scss       # Mixins réutilisables
│   └── global.scss        # Reset CSS + styles de base
│
├── types/
│   └── index.ts           # Interfaces TypeScript (Country, GameConfig, GameResult…)
│
├── utils/
│   ├── normalize.ts       # Normalisation des réponses (accents, casse, tirets)
│   ├── score.ts           # Calcul du pourcentage, formatage du temps
│   ├── shuffle.ts         # Mélange aléatoire + sélection d'éléments
│   └── storage.ts         # Lecture / écriture des scores dans le localStorage
│
├── App.tsx                # Providers + Router
└── main.tsx               # Point d'entrée React
```

---

## Utiliser le site

### Page d'accueil

La page d'accueil présente le projet avec un globe interactif animé. Elle explique les trois modes de jeu et les trois niveaux de difficulté disponibles.

Cliquez sur **"Commencer à jouer"** ou sur **"Jouer"** dans le menu pour configurer votre partie.

---

### Configurer une partie

La page de configuration se divise en **5 étapes** :

#### Étape 1 — Type de réponse

| Mode | Description |
|---|---|
| **QCM** | 4 propositions affichées, cliquez sur la bonne réponse |
| **Saisie libre** | Tapez le nom du pays au clavier (non disponible avec le mode Pays → Drapeau) |

#### Étape 2 — Zone géographique

Choisissez le périmètre des questions : monde entier ou un continent spécifique (Europe, Afrique, Asie, Amériques, Océanie).

#### Étape 3 — Mode de jeu

Voir la section [Modes de jeu](#modes-de-jeu) ci-dessous.

#### Étape 4 — Difficulté

Voir la section [Difficultés](#difficultés) ci-dessous.

#### Étape 5 — Nombre de questions

Choisissez entre 5, 10, 15, 20 questions ou toutes les questions disponibles dans la zone choisie.

---

### Pendant la partie

- La **barre de progression** en haut indique votre avancement.
- Le **score en cours** (bonnes réponses / questions répondues) est affiché en haut à droite.
- En mode **Moyen** ou **Difficile**, un **timer circulaire** décompte le temps restant. Quand il atteint 0, la question est comptée comme fausse.
- Un **feedback immédiat** (vert = bonne réponse, rouge = mauvaise) s'affiche après chaque réponse.
- Le bouton ✕ en haut à droite permet de **quitter** et revenir à l'accueil.

#### Mode Carte — navigation

La carte (mode Carte → Pays) est entièrement interactive :
- **Molette** ou **pincer** (mobile) : zoomer / dézoomer
- **Cliquer-glisser** : se déplacer sur la carte
- Les boutons **+** / **−** permettent aussi de zoomer
- La carte se recentre automatiquement sur le continent sélectionné à chaque nouvelle question

---

### Page de résultats

À la fin de la partie, un résumé s'affiche avec :

- Le **score final** en pourcentage avec une appréciation
- Le **temps total** (si mode chronométré)
- La comparaison avec votre **meilleur score personnel** sur cette configuration
- Un badge **"Nouveau record !"** si vous battez votre précédent score
- Un badge **"Score parfait !"** si vous obtenez 100%
- La liste des **questions ratées** avec le bon pays et votre réponse incorrecte

Depuis cette page vous pouvez **Rejouer**, lancer une **Nouvelle partie** ou revenir à l'**Accueil**.

---

## Modes de jeu

### 🏳️ Drapeau → Pays
Un vrai drapeau s'affiche. Vous devez identifier à quel pays il appartient.
- En QCM : cliquez parmi 4 propositions (noms de pays uniquement, sans indices visuels)
- En saisie libre : tapez le nom du pays, validez avec **Entrée** ou le bouton "Valider"

### 🔤 Pays → Drapeau
Le nom d'un pays s'affiche. Vous devez retrouver son drapeau parmi 4 options.
- Uniquement disponible en **QCM**

### 🗺️ Carte → Pays
Un pays est mis en surbrillance bleue sur la carte du monde. Vous devez le nommer.
- En QCM : cliquez parmi 4 propositions
- En saisie libre : tapez le nom et validez

> **Astuce saisie libre** : les accents, majuscules et tirets sont ignorés. "cote d'ivoire", "Côte d'Ivoire" et "cote divoire" sont tous acceptés.

---

## Difficultés

| Niveau | Timer | Description |
|---|---|---|
| 🟢 **Facile** | Aucun | Prenez le temps qu'il vous faut |
| 🟡 **Moyen** | 20 secondes | Un peu de pression |
| 🔴 **Difficile** | 7 secondes | Mode speedrun — pour les experts |

---

## Scores & historique

Les scores sont **sauvegardés automatiquement** dans le `localStorage` de votre navigateur après chaque partie. Ils persistent si vous fermez et rouvrez le site.

Chaque combinaison **mode + difficulté + continent** a son propre tableau de records.

### Page Scores

Accessible via le menu **"Scores"**, elle affiche pour chaque configuration jouée :
- Le meilleur score (%)
- Le meilleur temps (si mode chronométré)
- Le nombre de parties jouées
- Un badge doré si vous avez obtenu 100%

Le bouton **"Réinitialiser"** (avec confirmation) supprime l'intégralité de l'historique.

---

## Thème

GeoQuiz propose un **dark mode** (par défaut) et un **light mode**. Basculez entre les deux via l'icône ☀️ / 🌙 en haut à droite du header.

Le thème choisi est mémorisé dans le `localStorage` et restauré à chaque visite.