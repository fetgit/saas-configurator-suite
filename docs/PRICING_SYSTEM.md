# 🏷️ Système de Gestion des Tarifs

Ce document explique comment utiliser le système complet de gestion des tarifs et de facturation de l'application SaaS.

## 📋 Vue d'ensemble

Le système de tarifs comprend :
- **Gestion des plans d'abonnement** avec fonctionnalités et limites
- **Administration complète** via l'interface web
- **Base de données sécurisée** avec politiques RLS
- **Analytics et rapports** de revenus
- **Intégration Stripe** (préparée)
- **Codes de réduction** et promotions

## 🚀 Installation et Configuration

### 1. Configuration de la base de données

```bash
# Exécuter le script de création des tables
npm run setup:pricing
```

Ce script va :
- Créer toutes les tables nécessaires
- Configurer les politiques RLS
- Insérer les plans par défaut
- Créer les vues et fonctions utilitaires

### 2. Plans par défaut créés

| Plan | Prix mensuel | Prix annuel | Utilisateurs | Stockage | Fonctionnalités |
|------|-------------|-------------|--------------|----------|-----------------|
| **Starter** | 29€ | 290€ | 10 | 10GB | Support email, API basique |
| **Pro** | 79€ | 790€ | 100 | 100GB | Support prioritaire, API complète |
| **Enterprise** | 199€ | 1990€ | Illimité | Illimité | Support 24/7, infrastructure dédiée |

## 🎛️ Interface d'Administration

### Accès à l'administration

1. **Connectez-vous** avec un compte admin ou superadmin
2. **Cliquez sur "Administration"** dans la barre de navigation
3. **Sélectionnez "Gestion des tarifs"** dans le menu déroulant

Ou accédez directement à : `/admin/pricing`

### Fonctionnalités disponibles

#### 📊 Onglet "Plans d'abonnement"
- **Créer un nouveau plan** : Bouton "Nouveau plan"
- **Modifier un plan existant** : Icône d'édition
- **Activer/Désactiver** : Icône œil
- **Supprimer un plan** : Icône poubelle
- **Voir les détails** : Prix, fonctionnalités, limites

#### 📈 Onglet "Analytics"
- **Statistiques de revenus** : MRR, ARR, croissance
- **Métriques de conversion** : Taux de conversion, churn rate
- **Répartition par plan** : Nombre d'abonnés par plan
- **Graphiques visuels** : Évolution des revenus

#### ⚙️ Onglet "Paramètres"
- **Devise par défaut** : EUR, USD, GBP
- **Période d'essai** : Nombre de jours par défaut
- **Facturation automatique** : Génération des factures
- **Notifications** : Alertes de paiement
- **Proration** : Calcul automatique des changements

## 🗄️ Structure de la Base de Données

### Tables principales

```sql
-- Plans d'abonnement
subscription_plans
├── id (UUID)
├── name (VARCHAR)
├── tier (free|basic|premium|enterprise)
├── price_monthly (INTEGER - en centimes)
├── price_yearly (INTEGER - en centimes)
├── features (JSONB)
├── limits (JSONB)
└── is_active (BOOLEAN)

-- Abonnements utilisateurs
subscriptions
├── id (UUID)
├── user_id (UUID → users.id)
├── plan_id (UUID → subscription_plans.id)
├── status (trialing|active|past_due|canceled)
├── billing_cycle (monthly|yearly)
└── amount (INTEGER - en centimes)

-- Factures
invoices
├── id (UUID)
├── subscription_id (UUID → subscriptions.id)
├── amount_due (INTEGER)
├── status (draft|open|paid|void)
└── due_date (TIMESTAMPTZ)
```

### Sécurité RLS

- **Utilisateurs** : Peuvent voir leurs abonnements et factures
- **Admins** : Accès complet à la gestion des tarifs
- **Super-admins** : Contrôle total du système

## 🔧 API et Services

### Service AdminPricingService

```typescript
// Récupérer tous les plans
const plans = await AdminPricingService.getPlans();

// Créer un nouveau plan
const newPlan = await AdminPricingService.createPlan({
  name: 'Nouveau Plan',
  tier: 'premium',
  price_monthly: 9900, // 99€ en centimes
  price_yearly: 99000, // 990€ en centimes
  description: 'Description du plan',
  features: [...],
  limits: {...}
});

// Mettre à jour un plan
await AdminPricingService.updatePlan(planId, updates);

// Supprimer un plan
await AdminPricingService.deletePlan(planId);
```

### Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/pricing/plans` | Liste tous les plans |
| POST | `/admin/pricing/plans` | Créer un nouveau plan |
| PUT | `/admin/pricing/plans/:id` | Modifier un plan |
| DELETE | `/admin/pricing/plans/:id` | Supprimer un plan |
| GET | `/admin/pricing/analytics` | Statistiques et analytics |
| GET | `/admin/pricing/revenue-stats` | Métriques de revenus |

## 💡 Utilisation Avancée

### Créer un plan personnalisé

1. **Accédez à l'administration** des tarifs
2. **Cliquez sur "Nouveau plan"**
3. **Remplissez les informations** :
   - Nom du plan
   - Niveau (free, basic, premium, enterprise)
   - Prix mensuel et annuel (en centimes)
   - Description
   - Période d'essai
4. **Configurez les fonctionnalités** (JSON)
5. **Définissez les limites** (utilisateurs, stockage, etc.)
6. **Sauvegardez**

### Gérer les abonnements

```typescript
// Récupérer les abonnements avec filtres
const subscriptions = await AdminPricingService.getSubscriptions({
  plan_id: 'plan-uuid',
  status: 'active',
  page: 1,
  limit: 50
});

// Modifier le statut d'un abonnement
await AdminPricingService.updateSubscriptionStatus(
  subscriptionId, 
  'canceled', 
  'Demande utilisateur'
);
```

### Analytics et rapports

```typescript
// Récupérer les analytics
const analytics = await AdminPricingService.getPlanAnalytics('30d');

// Statistiques de revenus
const revenueStats = await AdminPricingService.getRevenueStats('90d');

// Métriques de conversion
const conversionMetrics = await AdminPricingService.getConversionMetrics('30d');
```

## 🔒 Sécurité

### Politiques RLS

- **Isolation des données** : Chaque utilisateur ne voit que ses données
- **Contrôle d'accès** : Seuls les admins peuvent modifier les plans
- **Audit trail** : Toutes les modifications sont tracées

### Bonnes pratiques

1. **Toujours valider** les données avant insertion
2. **Utiliser les transactions** pour les opérations complexes
3. **Limiter les accès** selon les rôles utilisateur
4. **Sauvegarder régulièrement** les données de facturation

## 🚨 Dépannage

### Problèmes courants

**Le menu "Tarifs" n'apparaît pas :**
- Vérifiez que vous êtes connecté avec un compte admin
- Rechargez la page après connexion

**Erreur de base de données :**
- Vérifiez que PostgreSQL est démarré
- Exécutez `npm run setup:pricing` pour recréer les tables

**Plans non visibles :**
- Vérifiez que les plans sont actifs (`is_active = true`)
- Contrôlez les politiques RLS

### Logs et monitoring

```sql
-- Vérifier les plans actifs
SELECT name, tier, price_monthly, is_active 
FROM subscription_plans 
WHERE is_active = true;

-- Statistiques des abonnements
SELECT 
  sp.name,
  COUNT(s.id) as total_subscriptions,
  COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions
FROM subscription_plans sp
LEFT JOIN subscriptions s ON sp.id = s.plan_id
GROUP BY sp.id, sp.name;
```

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs de l'application
2. Vérifiez la configuration de la base de données
3. Testez les permissions utilisateur
4. Contactez l'équipe de développement

---

**🎉 Le système de tarifs est maintenant entièrement fonctionnel !**

Vous pouvez commencer à gérer vos plans d'abonnement et suivre vos revenus directement depuis l'interface d'administration.
