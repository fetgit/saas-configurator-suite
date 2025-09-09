#!/usr/bin/env node

/**
 * Script pour configurer les Security Headers dans la base de données
 * Ce script crée la table et insère les configurations par défaut
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'saas_configurator',
  user: 'postgres',
  password: 'password',
  ssl: false,
});

async function setupSecurityHeaders() {
  try {
    console.log('🚀 Configuration des Security Headers...');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'create-security-headers-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Exécuter le script SQL
    await pool.query(sql);
    console.log('✅ Table admin_security_headers_config créée avec succès');

    // Vérifier que les données ont été insérées
    const result = await pool.query('SELECT environment FROM admin_security_headers_config ORDER BY environment');
    console.log('📋 Configurations disponibles:', result.rows.map(row => row.environment).join(', '));

    console.log('🎉 Configuration des Security Headers terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration des Security Headers:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
setupSecurityHeaders();
