# Configuration Stripe - SaaS Configurator Suite

## 🚀 Installation et Configuration

### 1. Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com) et créez un compte
2. Activez votre compte en vérifiant votre email et vos informations
3. Accédez au [Dashboard Stripe](https://dashboard.stripe.com)

### 2. Obtenir les clés API

1. Dans le Dashboard Stripe, allez dans **Développeurs > Clés API**
2. Copiez les clés suivantes :
   - **Clé secrète** (commence par `sk_test_` pour le mode test)
   - **Clé publiable** (commence par `pk_test_` pour le mode test)

### 3. Configurer les variables d'environnement

Modifiez le fichier `backend/config.env` avec vos vraies clés Stripe :

```env
# STRIPE CONFIGURATION
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publiable_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
```

### 4. Initialiser les plans Stripe

Exécutez le script d'initialisation pour créer les plans par défaut :

```bash
cd backend
npm run init:stripe
```

Ce script va :
- Tester la connexion à Stripe
- Créer les plans par défaut (Starter, Pro, Enterprise)
- Afficher un résumé des plans créés

### 5. Tester la connexion

Testez la connexion Stripe via l'API :

```bash
curl -X GET http://localhost:3001/api/admin/pricing/stripe/test
```

## 📋 Plans par défaut

Le système crée automatiquement ces plans :

### Starter - 29€/mois
- Jusqu'à 5 projets
- Support email
- Stockage 1GB
- 1 utilisateur

### Pro - 99€/mois
- Projets illimités
- Support prioritaire
- Stockage 10GB
- Analytics avancées
- 5 utilisateurs

### Enterprise - 299€/mois
- Tout de Pro
- Support 24/7
- Stockage illimité
- API personnalisée
- Utilisateurs illimités

## 🔧 Endpoints API disponibles

### Plans
- `GET /api/admin/pricing/plans` - Récupérer tous les plans
- `POST /api/admin/pricing/plans` - Créer un nouveau plan
- `PUT /api/admin/pricing/plans/:id` - Mettre à jour un plan
- `DELETE /api/admin/pricing/plans/:id` - Supprimer un plan

### Stripe
- `GET /api/admin/pricing/stripe/test` - Tester la connexion
- `POST /api/admin/pricing/stripe/sync` - Synchroniser avec Stripe

## 🎯 Fonctionnalités

### ✅ Implémentées
- Création de produits Stripe
- Création de prix Stripe
- Récupération des plans depuis Stripe
- Test de connexion Stripe
- Synchronisation avec Stripe

### 🔄 En cours
- Gestion des abonnements
- Webhooks Stripe
- Analytics de revenus
- Gestion des clients

### 📋 À venir
- Paiements en ligne
- Facturation automatique
- Gestion des remboursements
- Rapports de revenus

## 🚨 Important

1. **Mode Test** : Utilisez toujours les clés de test (`sk_test_`, `pk_test_`) en développement
2. **Sécurité** : Ne jamais commiter les vraies clés Stripe dans le code
3. **Webhooks** : Configurez les webhooks Stripe pour la synchronisation en temps réel
4. **Monitoring** : Surveillez les logs Stripe pour détecter les erreurs

## 🔍 Dépannage

### Erreur de connexion Stripe
```bash
# Vérifiez vos clés API
curl -X GET http://localhost:3001/api/admin/pricing/stripe/test
```

### Plans non visibles
```bash
# Synchronisez avec Stripe
curl -X POST http://localhost:3001/api/admin/pricing/stripe/sync
```

### Erreur de création de plan
- Vérifiez que les clés Stripe sont correctes
- Assurez-vous que le compte Stripe est activé
- Vérifiez les logs du serveur backend

## 📞 Support

Pour toute question sur l'intégration Stripe :
- [Documentation Stripe](https://stripe.com/docs)
- [Support Stripe](https://support.stripe.com)
- [Dashboard Stripe](https://dashboard.stripe.com)
