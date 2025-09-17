# Configuration Stripe - Guide Complet

## 🚨 **IMPORTANT : Données Mockées Supprimées**

Les données mockées ont été **complètement supprimées** du système. L'application nécessite maintenant une **configuration Stripe valide** pour fonctionner.

## 🔧 **Configuration Requise**

### 1. **Obtenir vos clés Stripe**

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Allez dans **Développeurs > Clés API**
3. Copiez vos clés :
   - **Clé secrète** : `sk_test_...` (mode test) ou `sk_live_...` (mode production)
   - **Clé publiable** : `pk_test_...` (mode test) ou `pk_live_...` (mode production)

### 2. **Configurer le Backend**

Modifiez le fichier `backend/config.env` :

```env
# STRIPE CONFIGURATION
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publiable_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
```

### 3. **Initialiser les Plans Stripe**

Exécutez le script d'initialisation :

```bash
cd backend
npm run init:stripe
```

## 📋 **Comportement Actuel**

### ✅ **Avec Stripe Configuré**
- **Plans** : Récupérés depuis Stripe
- **Analytics** : Données réelles de revenus
- **Paramètres** : Informations du compte Stripe

### ❌ **Sans Stripe Configuré**
- **Plans** : Erreur 503 "Service de facturation non disponible"
- **Analytics** : Erreur 503 "Service de facturation non disponible"
- **Paramètres** : Erreur 503 "Service de facturation non disponible"

## 🎯 **Messages d'Erreur**

L'application affiche maintenant des messages clairs :

```json
{
  "error": "Service de facturation non disponible",
  "message": "Stripe n'est pas configuré. Veuillez configurer vos clés API Stripe.",
  "details": "Clé Stripe non configurée"
}
```

## 🚀 **Prochaines Étapes**

1. **Configurez Stripe** avec vos vraies clés
2. **Initialisez les plans** avec `npm run init:stripe`
3. **Testez l'interface** admin pricing
4. **Créez vos propres plans** via l'interface

## 🔍 **Vérification**

Testez la connexion Stripe :

```bash
curl -X GET http://localhost:3003/api/admin/pricing/stripe/test
```

Réponse attendue avec Stripe configuré :
```json
{
  "connected": true,
  "accountId": "acct_...",
  "country": "FR",
  "currency": "eur"
}
```

## ⚠️ **Important**

- **Plus de données mockées** : L'application ne fonctionne qu'avec Stripe
- **Configuration obligatoire** : Les clés Stripe sont requises
- **Mode test recommandé** : Utilisez `sk_test_` en développement
- **Sécurité** : Ne commitez jamais vos vraies clés Stripe
