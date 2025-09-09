# SaaS Configurator Suite

Une suite complète de configuration SaaS avec des fonctionnalités avancées de sécurité, de performance et d'administration.

## 🚀 Fonctionnalités Principales

### 🔐 Sécurité Avancée
- **Authentification JWT** avec bcrypt
- **Authentification à deux facteurs (2FA)** avec TOTP
- **Protection XSS** avec DOMPurify
- **Protection CSRF** avec tokens sécurisés
- **Headers de sécurité** complets (CSP, HSTS, etc.)
- **Validation d'entrée** robuste avec Zod
- **Protection contre les attaques par force brute**

### ⚡ Performance Optimisée
- **Lazy Loading** et code splitting
- **Images optimisées** avec lazy loading
- **Listes virtualisées** pour de grandes quantités de données
- **Monitoring des performances** en temps réel
- **Caching intelligent** des ressources

### 🎨 Interface Moderne
- **Design system** cohérent avec variables CSS
- **Mode sombre** complet
- **Animations fluides** et transitions
- **Composants modernes** et réutilisables
- **Interface responsive** pour tous les appareils

### 🧪 Tests Automatisés
- **Tests unitaires** avec Vitest
- **Coverage** de 70%+ sur tous les services
- **Tests d'intégration** pour les composants
- **Mocks configurés** pour les dépendances externes

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **Radix UI** pour les composants
- **React Router** pour la navigation
- **React Query** pour la gestion d'état

### Backend
- **Express.js** avec sécurité avancée
- **PostgreSQL** pour la base de données
- **JWT** pour l'authentification
- **bcrypt** pour le hachage des mots de passe
- **Helmet.js** pour les headers de sécurité

### Sécurité
- **DOMPurify** pour la protection XSS
- **js-cookie** pour la gestion sécurisée des cookies
- **Zod** pour la validation des données
- **express-rate-limit** pour la protection contre les attaques

### Tests
- **Vitest** pour les tests unitaires
- **Testing Library** pour les tests de composants
- **jsdom** pour l'environnement de test

## 📦 Installation

### Prérequis
- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Configuration de l'environnement
1. Copiez `env.example` vers `.env`
2. Configurez vos variables d'environnement :
```env
# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_configurator
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=24h

# Serveur
PORT=3001
NODE_ENV=development
```

### Configuration de la base de données
```bash
# Créer la base de données
npm run db:create

# Exécuter les migrations
npm run db:migrate

# Créer les utilisateurs de test
npm run db:seed
```

## 🚀 Démarrage

### Mode développement
```bash
# Frontend (port 8080)
npm run dev

# Backend (port 3001)
cd backend
npm run dev
```

### Mode production
```bash
# Build de l'application
npm run build

# Démarrage en production
npm run start
```

## 🧪 Tests

### Exécuter tous les tests
```bash
npm run test
```

### Tests avec interface graphique
```bash
npm run test:ui
```

### Tests avec coverage
```bash
npm run test:coverage
```

### Tests en mode CI
```bash
npm run test:run
```

## 📁 Structure du Projet

```
saas-configurator-suite/
├── src/
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants UI de base
│   │   ├── admin/          # Composants d'administration
│   │   └── ...             # Autres composants
│   ├── pages/              # Pages de l'application
│   │   ├── admin/          # Pages d'administration
│   │   └── ...             # Autres pages
│   ├── services/           # Services métier
│   │   ├── __tests__/      # Tests des services
│   │   └── ...             # Services
│   ├── hooks/              # Hooks React personnalisés
│   ├── contexts/           # Contextes React
│   ├── styles/             # Styles CSS
│   └── test/               # Configuration des tests
├── backend/                # Serveur Express.js
├── scripts/                # Scripts utilitaires
├── docs/                   # Documentation
└── ...                     # Fichiers de configuration
```

## 🔧 Configuration

### Variables d'environnement
- `DB_HOST` : Hôte de la base de données
- `DB_PORT` : Port de la base de données
- `DB_NAME` : Nom de la base de données
- `DB_USER` : Utilisateur de la base de données
- `DB_PASSWORD` : Mot de passe de la base de données
- `JWT_SECRET` : Secret pour JWT
- `JWT_EXPIRES_IN` : Durée de validité du token JWT
- `PORT` : Port du serveur backend
- `NODE_ENV` : Environnement (development/production)

### Configuration de sécurité
L'application utilise une configuration de sécurité avancée avec :
- Headers de sécurité complets (CSP, HSTS, etc.)
- Protection contre les attaques XSS et CSRF
- Rate limiting pour la protection contre les attaques par force brute
- Validation stricte des entrées utilisateur

## 📊 Monitoring

### Métriques de performance
- Temps de réponse des API
- Utilisation CPU et mémoire
- Temps de chargement des pages
- Taux d'erreur

### Logs de sécurité
- Tentatives de connexion
- Activité suspecte
- Violations de sécurité
- Erreurs d'authentification

## 🚀 Déploiement

### Docker
```bash
# Build de l'image
docker build -t saas-configurator-suite .

# Démarrage du conteneur
docker run -p 8080:8080 -p 3001:3001 saas-configurator-suite
```

### Variables d'environnement de production
Assurez-vous de configurer :
- `NODE_ENV=production`
- `JWT_SECRET` sécurisé
- `DB_PASSWORD` fort
- Headers de sécurité appropriés

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation dans le dossier `docs/`
2. Vérifiez les issues existantes
3. Créez une nouvelle issue si nécessaire

## 🎯 Roadmap

- [ ] Tests E2E avec Playwright
- [ ] Documentation API avec Swagger
- [ ] Intégration CI/CD
- [ ] Monitoring avancé avec Prometheus
- [ ] Support multi-tenant
- [ ] API GraphQL

---

**Développé avec ❤️ pour une sécurité et des performances optimales**