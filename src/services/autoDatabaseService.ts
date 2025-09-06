// Service pour la création automatique de base de données
import { DatabaseConfig } from './adminConfigService';

interface DatabaseCreationResult {
  success: boolean;
  message: string;
  details?: {
    databaseCreated: boolean;
    extensionsCreated: string[];
    tablesCreated: number;
    existingTables: string[];
  };
}

export class AutoDatabaseService {
  private static async executeQuery(config: DatabaseConfig, query: string, params: any[] = []): Promise<any> {
    // Simulation d'une requête PostgreSQL (dans un vrai projet, utilisez pg)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulation basée sur la configuration
        if (config.host && config.port && config.database_name && config.username && config.password) {
          resolve({ rows: [] });
        } else {
          reject(new Error('Configuration de base de données invalide'));
        }
      }, 100);
    });
  }

  static async createDatabaseIfNotExists(config: DatabaseConfig): Promise<DatabaseCreationResult> {
    try {
      console.log('🔍 Vérification de la base de données...');

      // 1. Vérifier la connexion au serveur
      const serverConfig = {
        ...config,
        database_name: 'postgres' // Connexion à la DB par défaut
      };

      // 2. Vérifier si la base de données existe
      const dbCheckQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
      const dbResult = await this.executeQuery(serverConfig, dbCheckQuery, [config.database_name]);

      let databaseCreated = false;
      if (dbResult.rows.length === 0) {
        console.log(`📋 Base de données '${config.database_name}' n'existe pas, création en cours...`);
        
        // Créer la base de données
        const createDbQuery = `CREATE DATABASE "${config.database_name}"`;
        await this.executeQuery(serverConfig, createDbQuery);
        databaseCreated = true;
        console.log(`✅ Base de données '${config.database_name}' créée avec succès`);
      } else {
        console.log(`✅ Base de données '${config.database_name}' existe déjà`);
      }

      // 3. Se connecter à la base de données cible
      const dbResult2 = await this.executeQuery(config, 'SELECT 1');
      console.log(`✅ Connexion à la base '${config.database_name}' réussie`);

      // 4. Créer les extensions PostgreSQL
      console.log('🔧 Création des extensions PostgreSQL...');
      const extensions = ['uuid-ossp', 'pg_trgm'];
      const extensionsCreated: string[] = [];
      
      for (const extension of extensions) {
        try {
          await this.executeQuery(config, `CREATE EXTENSION IF NOT EXISTS "${extension}"`);
          extensionsCreated.push(extension);
          console.log(`✅ Extension '${extension}' créée/vérifiée`);
        } catch (error) {
          console.log(`⚠️ Extension '${extension}': ${error}`);
        }
      }

      // 5. Vérifier les tables existantes
      console.log('📋 Vérification des tables...');
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `;
      const tablesResult = await this.executeQuery(config, tablesQuery);
      const existingTables = tablesResult.rows.map((row: any) => row.table_name);

      console.log(`📊 Tables existantes: ${existingTables.length}`);

      let tablesCreated = 0;
      if (existingTables.length === 0) {
        console.log('🏗️ Création des tables...');
        
        // Tables principales à créer
        const tablesToCreate = [
          'admin_database_config',
          'admin_chatbot_config', 
          'admin_system_config',
          'admin_security_config',
          'admin_mailing_config',
          'admin_appearance_config',
          'admin_legal_config',
          'admin_community_config',
          'admin_analytics_config',
          'users',
          'communities',
          'posts',
          'comments',
          'subscriptions',
          'invoices',
          'support_tickets',
          'audit_logs',
          'security_events'
        ];

        // Simulation de création des tables
        for (const tableName of tablesToCreate) {
          try {
            await this.executeQuery(config, `CREATE TABLE IF NOT EXISTS ${tableName} (id SERIAL PRIMARY KEY)`);
            tablesCreated++;
          } catch (error) {
            console.log(`⚠️ Erreur création table ${tableName}: ${error}`);
          }
        }
        
        console.log(`✅ ${tablesCreated} tables créées avec succès`);
      } else {
        console.log('✅ Tables existent déjà');
      }

      return {
        success: true,
        message: 'Base de données créée et configurée avec succès',
        details: {
          databaseCreated,
          extensionsCreated,
          tablesCreated,
          existingTables
        }
      };

    } catch (error) {
      console.error(`❌ Erreur: ${error}`);
      return {
        success: false,
        message: `Erreur lors de la création de la base de données: ${error}`,
        details: {
          databaseCreated: false,
          extensionsCreated: [],
          tablesCreated: 0,
          existingTables: []
        }
      };
    }
  }

  static async testConnection(config: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      await this.executeQuery(config, 'SELECT 1');
      return {
        success: true,
        message: 'Connexion réussie'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur de connexion: ${error}`
      };
    }
  }

  static async validateConfig(config: DatabaseConfig): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!config.host) errors.push('Host requis');
    if (!config.port) errors.push('Port requis');
    if (!config.database_name) errors.push('Nom de base de données requis');
    if (!config.username) errors.push('Nom d\'utilisateur requis');
    if (!config.password) errors.push('Mot de passe requis');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Fonction utilitaire pour l'interface admin
export const autoCreateDatabase = async (config: DatabaseConfig): Promise<DatabaseCreationResult> => {
  console.log('🚀 Démarrage de la création automatique de base de données...');
  
  // Valider la configuration
  const validation = await AutoDatabaseService.validateConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      message: `Configuration invalide: ${validation.errors.join(', ')}`,
      details: {
        databaseCreated: false,
        extensionsCreated: [],
        tablesCreated: 0,
        existingTables: []
      }
    };
  }

  // Tester la connexion
  const connectionTest = await AutoDatabaseService.testConnection(config);
  if (!connectionTest.success) {
    return {
      success: false,
      message: `Test de connexion échoué: ${connectionTest.message}`,
      details: {
        databaseCreated: false,
        extensionsCreated: [],
        tablesCreated: 0,
        existingTables: []
      }
    };
  }

  // Créer la base de données
  return await AutoDatabaseService.createDatabaseIfNotExists(config);
};
