const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

class AppearanceConfigService {
  // Récupérer la configuration globale
  static async getGlobalConfig() {
    try {
      const result = await pool.query(
        'SELECT config_data FROM appearance_configs WHERE config_type = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1',
        ['global']
      );
      
      if (result.rows.length > 0) {
        return {
          success: true,
          config: result.rows[0].config_data
        };
      }
      
      return {
        success: false,
        message: 'Aucune configuration globale trouvée'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la config globale:', error);
      return {
        success: false,
        message: 'Erreur serveur lors de la récupération de la configuration'
      };
    }
  }

  // Récupérer la configuration d'un utilisateur
  static async getUserConfig(userId) {
    try {
      const result = await pool.query(
        'SELECT config_data FROM appearance_configs WHERE user_id = $1 AND config_type = $2 AND is_active = true ORDER BY updated_at DESC LIMIT 1',
        [userId, 'user']
      );
      
      if (result.rows.length > 0) {
        return {
          success: true,
          config: result.rows[0].config_data
        };
      }
      
      // Si pas de config utilisateur, retourner la config globale
      return await this.getGlobalConfig();
    } catch (error) {
      console.error('Erreur lors de la récupération de la config utilisateur:', error);
      return {
        success: false,
        message: 'Erreur serveur lors de la récupération de la configuration'
      };
    }
  }

  // Sauvegarder la configuration globale
  static async saveGlobalConfig(configData, userId) {
    try {
      // Vérifier que l'utilisateur est admin
      const userResult = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0 || !['admin', 'superadmin'].includes(userResult.rows[0].role)) {
        return {
          success: false,
          message: 'Accès refusé. Seuls les administrateurs peuvent modifier la configuration globale.'
        };
      }

      // Désactiver l'ancienne config globale
      await pool.query(
        'UPDATE appearance_configs SET is_active = false WHERE config_type = $1',
        ['global']
      );

      // Insérer la nouvelle config globale
      const result = await pool.query(
        'INSERT INTO appearance_configs (user_id, config_type, config_data, is_active) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, 'global', JSON.stringify(configData), true]
      );

      return {
        success: true,
        message: 'Configuration globale sauvegardée avec succès',
        configId: result.rows[0].id
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config globale:', error);
      return {
        success: false,
        message: 'Erreur serveur lors de la sauvegarde de la configuration'
      };
    }
  }

  // Sauvegarder la configuration utilisateur
  static async saveUserConfig(userId, configData) {
    try {
      // Désactiver l'ancienne config utilisateur
      await pool.query(
        'UPDATE appearance_configs SET is_active = false WHERE user_id = $1 AND config_type = $2',
        [userId, 'user']
      );

      // Insérer la nouvelle config utilisateur
      const result = await pool.query(
        'INSERT INTO appearance_configs (user_id, config_type, config_data, is_active) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, 'user', JSON.stringify(configData), true]
      );

      return {
        success: true,
        message: 'Configuration utilisateur sauvegardée avec succès',
        configId: result.rows[0].id
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config utilisateur:', error);
      return {
        success: false,
        message: 'Erreur serveur lors de la sauvegarde de la configuration'
      };
    }
  }

  // Migrer depuis localStorage vers la base de données
  static async migrateFromLocalStorage(userId, localStorageConfig) {
    try {
      // Vérifier si l'utilisateur est admin pour la config globale
      const userResult = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );
      
      const isAdmin = userResult.rows.length > 0 && ['admin', 'superadmin'].includes(userResult.rows[0].role);

      if (isAdmin) {
        // Migrer vers la config globale
        return await this.saveGlobalConfig(localStorageConfig, userId);
      } else {
        // Migrer vers la config utilisateur
        return await this.saveUserConfig(userId, localStorageConfig);
      }
    } catch (error) {
      console.error('Erreur lors de la migration depuis localStorage:', error);
      return {
        success: false,
        message: 'Erreur lors de la migration de la configuration'
      };
    }
  }

  // Obtenir l'historique des configurations
  static async getConfigHistory(userId, limit = 10) {
    try {
      const result = await pool.query(
        `SELECT id, config_type, config_data, created_at, updated_at, is_active
         FROM appearance_configs 
         WHERE (user_id = $1 OR config_type = 'global')
         ORDER BY updated_at DESC 
         LIMIT $2`,
        [userId, limit]
      );

      return {
        success: true,
        history: result.rows
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return {
        success: false,
        message: 'Erreur serveur lors de la récupération de l\'historique'
      };
    }
  }
}

module.exports = AppearanceConfigService;
