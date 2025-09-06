# Configuration PostgreSQL pour SaaS Configurator Suite

## 🎯 Objectif

Ce guide vous explique comment configurer PostgreSQL pour sauvegarder toutes les configurations de l'interface d'administration de votre application SaaS Configurator Suite.

## 📋 Prérequis

- ✅ PostgreSQL installé sur votre système Windows
- ✅ pgAdmin installé et configuré
- ✅ Accès administrateur à PostgreSQL
- ✅ Node.js installé (pour les scripts de test)

## 🚀 Étapes de Configuration

### 1. Vérification de l'Installation PostgreSQL

Ouvrez pgAdmin et vérifiez que votre serveur PostgreSQL est actif :

```sql
-- Test de connexion dans pgAdmin
SELECT version();
```

### 2. Création de la Base de Données

Créez une nouvelle base de données pour l'application :

```sql
-- Dans pgAdmin, exécutez cette requête
CREATE DATABASE saas_configurator
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'French_France.1252'
    LC_CTYPE = 'French_France.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

### 3. Installation des Extensions

Activez les extensions nécessaires :

```sql
-- Connectez-vous à la base saas_configurator
\c saas_configurator;

-- Extension pour la génération d'UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour la recherche textuelle
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Extension PostGIS (optionnelle, pour les données géospatiales)
-- CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 4. Test de Connexion avec le Script

Installez les dépendances et testez la connexion :

```bash
# Dans le dossier scripts/
cd scripts/
npm install
node test-postgres-connection.js
```

Le script va :
- ✅ Tester la connexion à PostgreSQL
- ✅ Créer la base de données si elle n'existe pas
- ✅ Vérifier les extensions
- ✅ Créer les tables de configuration

### 5. Création des Tables de Configuration

Exécutez le script SQL pour créer toutes les tables :

```sql
-- Dans pgAdmin, ouvrez le fichier docs/ADMIN_CONFIG_TABLES.sql
-- et exécutez-le dans la base saas_configurator
```

Ou utilisez le script automatique :

```bash
# Le script de test propose de créer les tables automatiquement
node test-postgres-connection.js
```

## 🔧 Configuration de l'Application

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration PostgreSQL
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=saas_configurator
VITE_DB_USER=postgres
VITE_DB_PASSWORD=votre_mot_de_passe
VITE_DB_SSL=false

# URL de l'API backend
VITE_API_URL=http://localhost:3001/api
```

### Configuration dans l'Interface Admin

1. **Accédez** à la section "Configuration base de données" dans l'admin
2. **Sélectionnez** PostgreSQL
3. **Configurez** les paramètres :
   - Host: `localhost`
   - Port: `5432`
   - Database: `saas_configurator`
   - Username: `postgres`
   - Password: `votre_mot_de_passe`
   - SSL: `false`
4. **Testez** la connexion
5. **Sauvegardez** la configuration

## 📊 Tables Créées

Le système crée les tables suivantes pour sauvegarder les configurations :

### Tables Principales
- `admin_database_config` - Configuration de la base de données
- `admin_chatbot_config` - Configuration du chatbot
- `admin_mailing_config` - Configuration du système de mailing
- `admin_security_config` - Configuration de sécurité
- `admin_system_config` - Configuration système
- `admin_appearance_config` - Configuration d'apparence
- `admin_legal_config` - Configuration légale
- `admin_community_config` - Configuration de communauté
- `admin_analytics_config` - Configuration d'analytics

### Tables Utilitaires
- `admin_configurations` - Table générique pour les configurations
- Vues pour faciliter les requêtes
- Fonctions utilitaires pour la gestion des configurations

## 🔐 Sécurité

### Chiffrement des Données Sensibles

Les données sensibles (mots de passe, clés API) sont automatiquement chiffrées :

```typescript
// Exemple de chiffrement dans le service
const encryptSensitiveData = (data: string): string => {
  return btoa(data); // Base64 pour le développement
  // En production, utilisez une vraie méthode de chiffrement
};
```

### Permissions Utilisateur

Créez un utilisateur dédié pour l'application :

```sql
-- Création d'un utilisateur dédié
CREATE USER saas_app_user WITH PASSWORD 'mot_de_passe_securise';

-- Attribution des permissions
GRANT CONNECT ON DATABASE saas_configurator TO saas_app_user;
GRANT USAGE ON SCHEMA public TO saas_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO saas_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO saas_app_user;
```

## 🧪 Tests et Validation

### Test de Connexion

```bash
# Test rapide de connexion
psql -h localhost -p 5432 -U postgres -d saas_configurator -c "SELECT 1;"
```

### Test des Extensions

```sql
-- Test de génération d'UUID
SELECT uuid_generate_v4();

-- Test de recherche textuelle
SELECT 'hello world' % 'world';
```

### Test des Tables

```sql
-- Vérification des tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'admin_%';

-- Test d'insertion dans une table de configuration
INSERT INTO admin_database_config (
    db_type, host, port, database_name, username, password_encrypted
) VALUES (
    'postgresql', 'localhost', 5432, 'saas_configurator', 
    'postgres', 'encrypted_password'
);
```

## 🚨 Dépannage

### Erreurs Courantes

#### 1. Erreur de Connexion
```
❌ Erreur: connection refused
```
**Solution :** Vérifiez que PostgreSQL est démarré et écoute sur le bon port.

#### 2. Erreur d'Authentification
```
❌ Erreur: password authentication failed
```
**Solution :** Vérifiez le mot de passe dans pg_hba.conf et les paramètres de connexion.

#### 3. Extension Non Disponible
```
❌ Erreur: extension "uuid-ossp" is not available
```
**Solution :** Installez les extensions PostgreSQL ou utilisez une version compatible.

#### 4. Permissions Insuffisantes
```
❌ Erreur: permission denied for table
```
**Solution :** Accordez les permissions nécessaires à l'utilisateur de l'application.

### Logs et Monitoring

Activez les logs PostgreSQL pour le débogage :

```sql
-- Dans postgresql.conf
log_statement = 'all'
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

## 📈 Performance et Optimisation

### Index Recommandés

```sql
-- Index pour les recherches fréquentes
CREATE INDEX idx_admin_configs_type_active ON admin_configurations(config_type, is_active);
CREATE INDEX idx_admin_configs_updated_at ON admin_configurations(updated_at DESC);
```

### Maintenance

```sql
-- Nettoyage périodique des anciennes configurations
DELETE FROM admin_configurations 
WHERE updated_at < NOW() - INTERVAL '1 year' 
AND is_active = false;

-- Analyse des tables pour optimiser les performances
ANALYZE admin_database_config;
ANALYZE admin_chatbot_config;
```

## 🎉 Conclusion

Une fois la configuration terminée, votre application SaaS Configurator Suite pourra :

- ✅ Sauvegarder toutes les configurations dans PostgreSQL
- ✅ Charger automatiquement les paramètres au démarrage
- ✅ Tester les connexions en temps réel
- ✅ Chiffrer les données sensibles
- ✅ Maintenir un historique des modifications

Toutes les configurations de l'interface d'administration seront maintenant persistées dans votre base PostgreSQL ! 🚀
