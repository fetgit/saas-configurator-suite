# SaaS Configurator Suite

Une suite complète de configuration SaaS moderne construite avec React, TypeScript et Tailwind CSS.

## 🚀 Fonctionnalités

- **Interface d'administration complète** avec gestion des utilisateurs, analytics et paramètres
- **Système de chatbot** intégré avec widget personnalisable
- **Gestion des médias** avec galerie et showcase
- **Support multilingue** avec sélecteur de langue
- **Thème sombre/clair** avec toggle automatique
- **Système d'authentification** complet
- **Gestion des communautés** avec dashboard dédié
- **Section légale** avec politiques et conditions
- **Système de mailing** intégré
- **Interface responsive** optimisée mobile/desktop

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **State Management** : React Context API
- **Routing** : React Router
- **Icons** : Lucide React
- **Charts** : Recharts
- **Forms** : React Hook Form + Zod

## 📦 Installation

```bash
# Cloner le repository
git clone <votre-repo-url>
cd saas-configurator-suite

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 🏗️ Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── admin/          # Interface d'administration
│   ├── ui/             # Composants UI de base
│   └── layout/         # Composants de mise en page
├── pages/              # Pages de l'application
│   ├── admin/          # Pages d'administration
│   ├── community/      # Pages communautaires
│   └── legal/          # Pages légales
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── services/           # Services API
└── types/              # Types TypeScript
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Linter le code
```

## 🎨 Personnalisation

Le projet utilise shadcn/ui pour les composants. Vous pouvez personnaliser :

- **Thèmes** : Modifiez `tailwind.config.ts`
- **Composants** : Éditez les fichiers dans `src/components/ui/`
- **Couleurs** : Ajustez les variables CSS dans `src/index.css`

## 📱 Fonctionnalités principales

### Administration
- Dashboard analytics
- Gestion des utilisateurs
- Configuration du chatbot
- Paramètres système
- Gestion de la sécurité

### Communauté
- Dashboard communautaire
- Système de médias
- Gestion des contenus

### Interface utilisateur
- Design responsive
- Thème sombre/clair
- Support multilingue
- Navigation intuitive

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**Développé avec ❤️ en utilisant les meilleures pratiques modernes de développement web.**
