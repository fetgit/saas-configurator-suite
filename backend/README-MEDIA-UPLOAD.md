# Système d'Upload d'Images - Documentation

## 📋 Vue d'ensemble

Le système d'upload d'images permet aux administrateurs d'uploader et de gérer des images pour différentes catégories (Hero, Logo, Favicon, etc.) directement depuis l'interface d'administration.

## 🗄️ Base de données

### Table `media_uploads`

```sql
CREATE TABLE media_uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Sécurité (RLS)

- **SELECT** : Tous les utilisateurs peuvent voir les médias
- **INSERT/UPDATE/DELETE** : Seuls les admins et superadmins peuvent modifier

## 🔌 API Endpoints

### 1. Upload d'image
```http
POST /api/media/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- image: File (obligatoire)
- category: string (optionnel, défaut: 'general')
```

**Réponse :**
```json
{
  "success": true,
  "message": "Image uploadée avec succès",
  "file": {
    "id": 1,
    "filename": "image-1234567890-123456789.jpg",
    "originalName": "mon-image.jpg",
    "url": "http://localhost:3003/uploads/images/image-1234567890-123456789.jpg",
    "size": 245678,
    "mimeType": "image/jpeg",
    "category": "hero",
    "uploadedAt": "2024-01-20T10:30:00Z"
  }
}
```

### 2. Liste des images
```http
GET /api/media/list?category=hero
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "files": [
    {
      "id": 1,
      "filename": "image-1234567890-123456789.jpg",
      "originalName": "mon-image.jpg",
      "url": "http://localhost:3003/uploads/images/image-1234567890-123456789.jpg",
      "size": 245678,
      "mimeType": "image/jpeg",
      "category": "hero",
      "uploadedAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### 3. Suppression d'image
```http
DELETE /api/media/:id
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "message": "Image supprimée avec succès"
}
```

## 🎨 Frontend

### Service MediaService

```typescript
import { MediaService } from '@/services/mediaService';

// Uploader une image
const response = await MediaService.uploadImage(file, 'hero');

// Récupérer les images par catégorie
const heroImages = await MediaService.getHeroImages();

// Supprimer une image
await MediaService.deleteImage(imageId);
```

### Composant ImageUpload

```tsx
import { ImageUpload } from '@/components/ImageUpload';

<ImageUpload
  category="hero"
  onImageSelect={(file) => console.log('Image sélectionnée:', file)}
  selectedImageId={selectedId}
  showPreview={true}
  maxFiles={1}
/>
```

## 📁 Structure des fichiers

```
backend/
├── uploads/
│   └── images/           # Images uploadées
├── scripts/
│   ├── create-media-table.sql
│   └── setup-media-table.js
└── server.js             # Endpoints d'upload

src/
├── services/
│   └── mediaService.ts   # Service frontend
├── components/
│   └── ImageUpload.tsx   # Composant d'upload
└── pages/admin/
    └── AdminAppearance.tsx # Interface d'administration
```

## 🔒 Sécurité

### Validation des fichiers
- **Types autorisés** : JPG, JPEG, PNG, GIF, WebP, SVG
- **Taille maximale** : 5MB
- **Vérification MIME type** : Seules les images sont acceptées

### Authentification
- Tous les endpoints nécessitent un token JWT valide
- Seuls les rôles `admin` et `superadmin` peuvent uploader/supprimer

### Stockage sécurisé
- Noms de fichiers uniques (timestamp + random)
- Dossier séparé pour les uploads
- Suppression automatique en cas d'erreur

## 🏷️ Catégories disponibles

- `hero` : Images de fond pour la section Hero
- `logo` : Logos d'entreprise
- `favicon` : Favicons
- `general` : Images générales (défaut)

## 🚀 Utilisation

### 1. Dans AdminAppearance

Le composant `ImageUpload` est intégré dans :
- **Section Hero** : Upload d'images de fond
- **Section Marques** : Upload de logos et favicons

### 2. Interface utilisateur

- **Zone de drop** : Glisser-déposer ou clic pour sélectionner
- **Prévisualisation** : Aperçu des images uploadées
- **Sélection** : Clic pour sélectionner une image
- **Suppression** : Bouton de suppression avec confirmation

### 3. Gestion des erreurs

- Validation côté client et serveur
- Messages d'erreur explicites
- Notifications toast pour le feedback utilisateur

## 🔧 Configuration

### Variables d'environnement

```env
# Backend
CORS_ORIGIN=http://localhost:8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_configurator
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

### Limites configurables

Dans `server.js` :
```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});
```

## 📝 Notes importantes

1. **Redémarrage du serveur** : Nécessaire après modification des endpoints
2. **Permissions** : Vérifier que le dossier `uploads/` est accessible en écriture
3. **Sauvegarde** : Les images sont stockées localement, prévoir une stratégie de sauvegarde
4. **Performance** : Pour la production, considérer l'utilisation d'un CDN ou d'un service cloud

## 🐛 Dépannage

### Erreur 401 (Non autorisé)
- Vérifier que l'utilisateur est connecté
- Vérifier que le token JWT est valide
- Vérifier que l'utilisateur a le rôle admin/superadmin

### Erreur 413 (Payload trop large)
- Vérifier la taille du fichier (max 5MB)
- Vérifier la configuration multer

### Erreur de base de données
- Vérifier la connexion à PostgreSQL
- Vérifier que la table `media_uploads` existe
- Vérifier les permissions RLS
