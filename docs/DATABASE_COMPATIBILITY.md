# Compatibilité des Bases de Données

## Vue d'ensemble

L'application SaaS Configurator Suite est conçue pour être compatible avec **MySQL** et **PostgreSQL**. Le schéma de base de données est universel et s'adapte automatiquement selon le type de base de données sélectionné.

## Support des Bases de Données

### ✅ MySQL
- **Port par défaut** : 3306
- **Jeu de caractères** : utf8mb4
- **Moteur de stockage** : InnoDB (recommandé)
- **Avantages** :
  - Performance élevée pour les applications web
  - Facilité de maintenance
  - Large communauté et support
  - Optimisé pour les lectures rapides

### ✅ PostgreSQL
- **Port par défaut** : 5432
- **Jeu de caractères** : UTF8
- **Schéma par défaut** : public
- **Avantages** :
  - Support natif des types de données avancés (JSON, UUID, etc.)
  - Recherche textuelle intégrée
  - Extensions puissantes (PostGIS, pg_trgm, etc.)
  - Conformité ACID stricte
  - Support des requêtes complexes

## Configuration dans l'Interface d'Administration

### Sélection du Type de Base de Données

1. **Accédez** à la section "Configuration base de données" dans l'admin
2. **Sélectionnez** le type de base de données (MySQL ou PostgreSQL)
3. **Configurez** les paramètres de connexion
4. **Testez** la connexion avant de sauvegarder

### Paramètres de Connexion

#### Communs aux deux types
- **Hôte/Serveur** : Adresse IP ou nom d'hôte
- **Port** : Port de connexion (3306 pour MySQL, 5432 pour PostgreSQL)
- **Base de données** : Nom de la base de données
- **Nom d'utilisateur** : Utilisateur de la base de données
- **Mot de passe** : Mot de passe de l'utilisateur
- **SSL/TLS** : Chiffrement de la connexion

#### Spécifiques à PostgreSQL
- **Schéma par défaut** : Schéma à utiliser (par défaut : public)
- **Fuseau horaire** : Fuseau horaire de la base (par défaut : UTC)
- **Extensions** :
  - `uuid-ossp` : Génération d'UUIDs
  - `pg_trgm` : Recherche textuelle avancée
  - `PostGIS` : Support géospatial (optionnel)

## Schéma de Base de Données

### Compatibilité Universelle

Le schéma SQL est conçu pour être compatible avec les deux types de bases de données :

```sql
-- Types de données universels
UUID PRIMARY KEY DEFAULT uuid_generate_v4()  -- PostgreSQL
-- ou
VARCHAR(36) PRIMARY KEY DEFAULT (UUID())     -- MySQL

-- Types JSON
JSONB NOT NULL DEFAULT '{}'                  -- PostgreSQL
-- ou
JSON NOT NULL DEFAULT ('{}')                 -- MySQL

-- Types de date
TIMESTAMPTZ NOT NULL DEFAULT NOW()           -- PostgreSQL
-- ou
TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- MySQL
```

### Adaptations Automatiques

L'application adapte automatiquement :

1. **Types de données** selon le moteur de base
2. **Fonctions** de génération d'UUID
3. **Index** et contraintes
4. **Requêtes** SQL selon la syntaxe

## Migration entre Bases de Données

### De MySQL vers PostgreSQL

1. **Exportez** les données depuis MySQL
2. **Convertissez** le schéma si nécessaire
3. **Importez** dans PostgreSQL
4. **Mettez à jour** la configuration dans l'admin

### De PostgreSQL vers MySQL

1. **Exportez** les données depuis PostgreSQL
2. **Adaptez** les types de données
3. **Importez** dans MySQL
4. **Mettez à jour** la configuration dans l'admin

## Recommandations

### Choisir MySQL si :
- Vous avez besoin de performances élevées pour des lectures simples
- Votre équipe est plus familière avec MySQL
- Vous utilisez des applications PHP/WordPress
- Vous avez des contraintes de ressources limitées

### Choisir PostgreSQL si :
- Vous avez besoin de requêtes complexes
- Vous utilisez des données géospatiales
- Vous avez besoin de recherche textuelle avancée
- Vous développez des applications avec des types de données complexes
- Vous avez besoin d'une conformité ACID stricte

## Surveillance et Métriques

### Métriques Communes
- Connexions actives
- Requêtes par seconde
- Temps de réponse moyen

### Métriques PostgreSQL Spécifiques
- Cache hit ratio
- Locks actifs
- Taille de la base de données
- Utilisation des extensions

## Support et Maintenance

### Sauvegardes
- **MySQL** : mysqldump ou outils de sauvegarde MySQL
- **PostgreSQL** : pg_dump ou outils de sauvegarde PostgreSQL

### Monitoring
- **MySQL** : Performance Schema, MySQL Enterprise Monitor
- **PostgreSQL** : pg_stat_statements, pgAdmin, outils de monitoring

### Mise à jour
- Les deux bases de données supportent les mises à jour en ligne
- Testez toujours les migrations sur un environnement de développement

## Conclusion

L'application est entièrement compatible avec MySQL et PostgreSQL. Le choix dépend de vos besoins spécifiques, de votre expertise technique et de vos contraintes d'infrastructure. Les deux options offrent d'excellentes performances et une fiabilité élevée pour l'application SaaS Configurator Suite.
