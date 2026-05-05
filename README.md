# Ynov Wordle

Clone du jeu Wordle en TypeScript, avec une logique de jeu découplée du frontend et une suite de tests unitaires.

## Stack

- **Frontend** : React 19 + Vite
- **Logique de jeu** : TypeScript pur (indépendant du framework)
- **Tests** : Vitest
- **Gestionnaire de paquets** : pnpm

## Structure du projet

```
├── game/                        # Logique de jeu (framework-agnostic)
│   ├── rules/
│   │   └── gameUtils.ts         # createWord, compareWord, isWin
│   ├── services/
│   │   ├── game.service.ts      # GameService (orchestration)
│   │   └── wordProvider.ts      # Interface WordProvider + implémentations
│   ├── types/                   # Types TypeScript (Game, Word, Try, Letter)
│   └── exceptions/              # Erreurs personnalisées
├── frontend/src/                # Interface React
├── tests/                       # Tests unitaires Vitest
│   ├── gameUtils.test.ts
│   └── game.service.test.ts
└── vitest.config.ts
```

## Règles du jeu

Le joueur dispose de **6 essais** pour deviner un mot de 5 lettres. Après chaque essai, chaque lettre reçoit un feedback :

| Feedback    | Signification                               |
| ----------- | ------------------------------------------- |
| `CORRECT`   | Lettre correcte et bien placée              |
| `MISPLACED` | Lettre présente dans le mot mais mal placée |
| `ABSENT`    | Lettre absente du mot                       |

Les lettres en double sont gérées correctement : une lettre ne peut être marquée `MISPLACED` que le nombre de fois où elle apparaît dans le mot cible.

## Installation

```bash
pnpm install
```

## Lancer le jeu

```bash
pnpm dev
```

## Tests

```bash
# Lancer les tests une fois
pnpm test

# Mode watch
pnpm test:watch
```

## Architecture

La logique de jeu est entièrement isolée dans `game/` et ne dépend d'aucun framework. Le `GameService` utilise une interface `WordProvider` pour récupérer les mots, ce qui permet de substituer facilement l'implémentation HTTP par un stub dans les tests.

```
WordProvider (interface)
├── DictWordProvider   → appel API (trouve-mot.fr)
├── FakeWordProvider   → stub pour les tests
└── FailingWordProvider → simulation d'erreur API
```
