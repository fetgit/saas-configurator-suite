# Guide de Développement - SaaS Configurator Suite

## 🛠️ Environnement de Développement

### Prérequis
- Node.js 18+
- PostgreSQL 12+
- Git
- IDE recommandé : VS Code avec extensions TypeScript/React

### Extensions VS Code Recommandées
- TypeScript Importer
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- GitLens

## 🚀 Configuration Initiale

### 1. Cloner le Repository
```bash
git clone https://github.com/fetgit/saas-configurator-suite.git
cd saas-configurator-suite
```

### 2. Installation des Dépendances
```bash
npm install
```

### 3. Configuration de l'Environnement
```bash
cp env.example .env
# Éditer .env avec vos configurations
```

### 4. Configuration de la Base de Données
```bash
# Créer la base de données
npm run db:create

# Exécuter les migrations
npm run db:migrate

# Créer les utilisateurs de test
npm run db:seed
```

### 5. Démarrage du Développement
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## 📁 Architecture du Code

### Structure des Dossiers
```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base (Button, Card, etc.)
│   ├── admin/          # Composants spécifiques à l'administration
│   ├── forms/          # Composants de formulaires
│   └── layout/         # Composants de mise en page
├── pages/              # Pages de l'application
│   ├── admin/          # Pages d'administration
│   ├── auth/           # Pages d'authentification
│   └── public/         # Pages publiques
├── services/           # Services métier et API
│   ├── __tests__/      # Tests des services
│   └── ...             # Services individuels
├── hooks/              # Hooks React personnalisés
├── contexts/           # Contextes React (Auth, Language, etc.)
├── types/              # Définitions TypeScript
├── utils/              # Utilitaires et helpers
├── styles/             # Styles CSS globaux
└── test/               # Configuration des tests
```

### Conventions de Nommage

#### Fichiers et Dossiers
- **Composants** : `PascalCase` (ex: `UserProfile.tsx`)
- **Services** : `camelCase` avec suffixe `Service` (ex: `authService.ts`)
- **Hooks** : `camelCase` avec préfixe `use` (ex: `useAuth.ts`)
- **Types** : `PascalCase` avec suffixe `Type` (ex: `UserType.ts`)
- **Pages** : `PascalCase` (ex: `AdminDashboard.tsx`)

#### Variables et Fonctions
- **Variables** : `camelCase` (ex: `userName`, `isLoading`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)
- **Fonctions** : `camelCase` (ex: `handleSubmit`, `validateEmail`)
- **Interfaces** : `PascalCase` avec préfixe `I` (ex: `IUserData`)

## 🧩 Développement de Composants

### Structure d'un Composant React
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onAction,
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAction?.();
    } finally {
      setIsLoading(false);
    }
  }, [onAction]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
        <Button onClick={handleAction} disabled={isLoading}>
          {isLoading ? 'Chargement...' : 'Action'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Bonnes Pratiques pour les Composants
1. **Props Interface** : Toujours définir une interface pour les props
2. **Memoization** : Utiliser `useCallback` et `useMemo` pour les performances
3. **Error Boundaries** : Gérer les erreurs avec des boundaries
4. **Accessibility** : Ajouter les attributs ARIA nécessaires
5. **Responsive** : Utiliser Tailwind CSS pour le responsive design

## 🔧 Développement de Services

### Structure d'un Service
```typescript
// services/exampleService.ts
import { ApiResponse, ApiError } from '@/types/api';

export interface ExampleData {
  id: string;
  name: string;
  value: number;
}

export class ExampleService {
  private static baseUrl = '/api/examples';

  static async getAll(): Promise<ExampleData[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new ApiError('Failed to fetch examples', response.status);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching examples:', error);
      throw error;
    }
  }

  static async create(data: Omit<ExampleData, 'id'>): Promise<ExampleData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new ApiError('Failed to create example', response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating example:', error);
      throw error;
    }
  }
}
```

### Bonnes Pratiques pour les Services
1. **Error Handling** : Gérer les erreurs de manière cohérente
2. **Type Safety** : Utiliser TypeScript pour la sécurité des types
3. **API Consistency** : Maintenir une interface API cohérente
4. **Caching** : Implémenter la mise en cache quand approprié
5. **Testing** : Écrire des tests pour tous les services

## 🧪 Tests

### Configuration des Tests
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Tests de Composants
```typescript
// components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', async () => {
    const mockAction = vi.fn();
    render(<MyComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Tests de Services
```typescript
// services/__tests__/exampleService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExampleService } from '../exampleService';

// Mock fetch
global.fetch = vi.fn();

describe('ExampleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all examples successfully', async () => {
    const mockData = [{ id: '1', name: 'Test', value: 100 }];
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await ExampleService.getAll();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/examples');
  });

  it('handles fetch errors', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(ExampleService.getAll()).rejects.toThrow('Network error');
  });
});
```

## 🔒 Sécurité

### Bonnes Pratiques de Sécurité
1. **Validation** : Toujours valider les entrées utilisateur
2. **Sanitization** : Nettoyer les données avant affichage
3. **Authentication** : Vérifier l'authentification pour les routes protégées
4. **Authorization** : Vérifier les permissions utilisateur
5. **HTTPS** : Utiliser HTTPS en production

### Protection XSS
```typescript
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

// Utilisation dans un composant
const SafeHtml: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = sanitizeHtml(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

### Protection CSRF
```typescript
import Cookies from 'js-cookie';

export const getCSRFToken = (): string | undefined => {
  return Cookies.get('csrf-token');
};

export const setCSRFToken = (token: string): void => {
  Cookies.set('csrf-token', token, { 
    secure: true, 
    sameSite: 'strict' 
  });
};
```

## 🎨 Styling et Design

### Utilisation de Tailwind CSS
```typescript
// Composant avec Tailwind CSS
export const StyledCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Titre de la carte
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        Contenu de la carte avec support du mode sombre.
      </p>
    </div>
  );
};
```

### Variables CSS Personnalisées
```css
/* styles/design-system.css */
:root {
  --primary: 220 14% 96%;
  --primary-foreground: 220 9% 46%;
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 9% 46%;
  --accent: 220 14% 96%;
  --accent-foreground: 220 9% 46%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 10% 3.9%;
  --radius: 0.5rem;
}
```

## 📊 Performance

### Optimisation des Performances
1. **Lazy Loading** : Charger les composants à la demande
2. **Memoization** : Utiliser `React.memo`, `useMemo`, `useCallback`
3. **Code Splitting** : Diviser le code en chunks
4. **Image Optimization** : Optimiser les images
5. **Bundle Analysis** : Analyser la taille du bundle

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

export const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  );
};
```

### Memoization
```typescript
import React, { memo, useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: any[];
  onItemClick: (id: string) => void;
}

export const ExpensiveComponent = memo<ExpensiveComponentProps>(({ 
  data, 
  onItemClick 
}) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);

  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

## 🐛 Débogage

### Outils de Débogage
1. **React DevTools** : Extension Chrome/Firefox
2. **Redux DevTools** : Pour la gestion d'état
3. **Network Tab** : Pour les requêtes API
4. **Console** : Pour les logs et erreurs
5. **Source Maps** : Pour le débogage du code source

### Logging
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

## 📝 Documentation

### Documentation du Code
```typescript
/**
 * Service pour la gestion des utilisateurs
 * @class UserService
 */
export class UserService {
  /**
   * Récupère tous les utilisateurs
   * @returns {Promise<User[]>} Liste des utilisateurs
   * @throws {ApiError} Erreur si la requête échoue
   */
  static async getAll(): Promise<User[]> {
    // Implementation
  }

  /**
   * Crée un nouvel utilisateur
   * @param {CreateUserData} userData - Données de l'utilisateur
   * @returns {Promise<User>} Utilisateur créé
   */
  static async create(userData: CreateUserData): Promise<User> {
    // Implementation
  }
}
```

### README des Composants
```typescript
/**
 * Composant de carte utilisateur
 * 
 * @example
 * ```tsx
 * <UserCard 
 *   user={user} 
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  // Implementation
};
```

## 🚀 Déploiement Local

### Scripts de Développement
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### Commandes Utiles
```bash
# Développement
npm run dev                 # Démarrer le serveur de développement
npm run build              # Build de production
npm run preview            # Prévisualiser le build

# Tests
npm run test               # Exécuter les tests
npm run test:ui            # Interface graphique des tests
npm run test:coverage      # Tests avec coverage

# Qualité du code
npm run lint               # Vérifier le code
npm run lint:fix           # Corriger automatiquement
npm run type-check         # Vérifier les types TypeScript
```

## 🤝 Contribution

### Workflow Git
1. **Fork** le repository
2. **Clone** votre fork
3. **Créer** une branche feature
4. **Développer** votre fonctionnalité
5. **Tester** votre code
6. **Commit** avec des messages clairs
7. **Push** vers votre fork
8. **Créer** une Pull Request

### Messages de Commit
```
feat: ajouter la fonctionnalité de recherche utilisateur
fix: corriger le bug de validation email
docs: mettre à jour la documentation API
style: formater le code avec Prettier
refactor: refactoriser le service d'authentification
test: ajouter des tests pour le composant UserCard
chore: mettre à jour les dépendances
```

### Pull Request Template
```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests manuels effectués

## Checklist
- [ ] Code conforme aux standards
- [ ] Documentation mise à jour
- [ ] Tests passent
- [ ] Pas de breaking changes
```

---

**Guide complet pour contribuer efficacement au projet** 🚀
