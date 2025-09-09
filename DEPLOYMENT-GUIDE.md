# Guide de Déploiement - SaaS Configurator Suite

## 🚀 Déploiement en Production

### Prérequis
- Serveur avec Node.js 18+
- PostgreSQL 12+
- Nginx (optionnel, pour le reverse proxy)
- SSL/TLS certificate
- Domaine configuré

## 📋 Checklist de Déploiement

### 1. Préparation du Serveur
- [ ] Mise à jour du système
- [ ] Installation de Node.js 18+
- [ ] Installation de PostgreSQL
- [ ] Configuration du firewall
- [ ] Installation de Nginx (optionnel)

### 2. Configuration de la Base de Données
- [ ] Création de la base de données
- [ ] Configuration des utilisateurs
- [ ] Exécution des migrations
- [ ] Création des utilisateurs de test

### 3. Configuration de l'Application
- [ ] Variables d'environnement
- [ ] Certificats SSL
- [ ] Configuration Nginx
- [ ] Configuration PM2 (optionnel)

### 4. Tests de Déploiement
- [ ] Tests de connectivité
- [ ] Tests de sécurité
- [ ] Tests de performance
- [ ] Tests de fonctionnalités

## 🔧 Configuration Détaillée

### Variables d'Environnement de Production

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_configurator_prod
DB_USER=saas_user
DB_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_very_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# Serveur
PORT=3001
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=SaaS Configurator Suite
```

### Configuration Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        root /var/www/saas-configurator-suite/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Configuration PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'saas-configurator-backend',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## 🐳 Déploiement avec Docker

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3001 8080

CMD ["npm", "run", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=saas_configurator
      - DB_USER=saas_user
      - DB_PASSWORD=secure_password
    depends_on:
      - postgres
    volumes:
      - ./logs:/app/logs

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=saas_configurator
      - POSTGRES_USER=saas_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

## 🔒 Sécurité en Production

### Configuration de Sécurité
1. **Firewall** : Bloquer tous les ports sauf 80, 443, 22
2. **SSL/TLS** : Utiliser des certificats valides
3. **Headers de sécurité** : Configuration complète
4. **Rate limiting** : Protection contre les attaques
5. **Monitoring** : Surveillance des logs et métriques

### Variables Sensibles
- Utiliser un gestionnaire de secrets (HashiCorp Vault, AWS Secrets Manager)
- Ne jamais commiter les secrets dans le code
- Rotation régulière des clés JWT
- Mots de passe forts pour la base de données

## 📊 Monitoring et Logs

### Configuration des Logs
```javascript
// backend/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'saas-configurator' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Métriques de Performance
- **CPU** : Surveillance de l'utilisation
- **Mémoire** : Monitoring de la RAM
- **Disque** : Espace disponible
- **Réseau** : Bande passante et latence
- **Base de données** : Requêtes lentes et connexions

## 🚀 Scripts de Déploiement

### Script de Déploiement Automatique
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Déploiement de SaaS Configurator Suite"

# Variables
APP_DIR="/var/www/saas-configurator-suite"
BACKUP_DIR="/var/backups/saas-configurator-suite"
DATE=$(date +%Y%m%d_%H%M%S)

# Sauvegarde
echo "📦 Création de la sauvegarde..."
mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" $APP_DIR

# Mise à jour du code
echo "📥 Mise à jour du code..."
cd $APP_DIR
git pull origin main

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci --production

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

# Migration de la base de données
echo "🗄️ Migration de la base de données..."
npm run db:migrate

# Redémarrage des services
echo "🔄 Redémarrage des services..."
pm2 restart saas-configurator-backend
systemctl reload nginx

# Tests de santé
echo "🏥 Tests de santé..."
curl -f http://localhost:3001/api/health || exit 1

echo "✅ Déploiement terminé avec succès!"
```

## 🔍 Tests Post-Déploiement

### Checklist de Validation
- [ ] Application accessible via HTTPS
- [ ] API répond correctement
- [ ] Base de données connectée
- [ ] Authentification fonctionnelle
- [ ] Headers de sécurité présents
- [ ] Performance acceptable
- [ ] Logs générés correctement

### Tests de Sécurité
```bash
# Test des headers de sécurité
curl -I https://your-domain.com

# Test de l'authentification
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test de la protection CSRF
curl -X POST https://your-domain.com/api/admin/config \
  -H "Content-Type: application/json" \
  -d '{"type":"database","config":{}}'
```

## 📈 Optimisation des Performances

### Configuration de Cache
- **Nginx** : Cache des assets statiques
- **Base de données** : Configuration des index
- **Application** : Cache en mémoire pour les données fréquentes

### Monitoring Continu
- **Uptime** : Surveillance de la disponibilité
- **Performance** : Métriques en temps réel
- **Erreurs** : Alertes automatiques
- **Sécurité** : Détection d'intrusions

## 🆘 Dépannage

### Problèmes Courants
1. **Erreur de connexion à la base de données**
   - Vérifier les variables d'environnement
   - Tester la connectivité réseau
   - Vérifier les permissions utilisateur

2. **Erreurs SSL/TLS**
   - Vérifier la validité des certificats
   - Tester la configuration Nginx
   - Vérifier les headers de sécurité

3. **Problèmes de performance**
   - Analyser les logs d'erreur
   - Vérifier l'utilisation des ressources
   - Optimiser les requêtes de base de données

### Commandes Utiles
```bash
# Vérifier les logs
pm2 logs saas-configurator-backend
tail -f /var/log/nginx/error.log

# Tester la connectivité
curl -I https://your-domain.com
telnet your-domain.com 443

# Vérifier les processus
pm2 status
ps aux | grep node
```

---

**Guide de déploiement complet pour une mise en production sécurisée et performante** 🚀
