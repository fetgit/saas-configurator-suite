const nodemailer = require('nodemailer');
const crypto = require('crypto');

class MailingService {
  constructor() {
    this.transporter = null;
    this.config = null;
  }

  // Chiffrer les données sensibles
  encryptSensitiveData(data) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'dev_encryption_key_32_characters', 'utf8');
    const iv = Buffer.from(process.env.ENCRYPTION_IV || 'dev_iv_16_chars', 'utf8');
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Déchiffrer les données sensibles
  decryptSensitiveData(encryptedData) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'dev_encryption_key_32_characters', 'utf8');
    const iv = Buffer.from(process.env.ENCRYPTION_IV || 'dev_iv_16_chars', 'utf8');
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Charger la configuration SMTP depuis la base de données
  async loadSMTPConfig() {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { 
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        } : false
      });

      const result = await pool.query(
        'SELECT * FROM mailing_smtp_config WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
      );

      if (result.rows.length === 0) {
        throw new Error('Aucune configuration SMTP active trouvée');
      }

      const config = result.rows[0];
      this.config = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: this.decryptSensitiveData(config.password_encrypted)
        },
        from: {
          name: config.from_name,
          address: config.from_email
        }
      };

      await pool.end();
      return this.config;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration SMTP:', error);
      throw error;
    }
  }

  // Initialiser le transporteur SMTP
  async initializeTransporter() {
    try {
      if (!this.config) {
        await this.loadSMTPConfig();
      }

      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Tester la connexion
      await this.transporter.verify();
      console.log('✅ Configuration SMTP validée');
      return true;
    } catch (error) {
      console.error('❌ Erreur de configuration SMTP:', error);
      throw error;
    }
  }

  // Tester la connexion SMTP
  async testConnection() {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      await this.transporter.verify();
      return {
        success: true,
        message: 'Connexion SMTP réussie'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur de connexion SMTP: ${error.message}`
      };
    }
  }

  // Envoyer un email simple
  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const mailOptions = {
        from: `${this.config.from.name} <${this.config.from.address}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        html: html,
        text: text || this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email envoyé avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  // Envoyer une campagne à une liste de contacts
  async sendCampaign(campaignId, mailingListIds) {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { 
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        } : false
      });

      // Récupérer la campagne
      const campaignResult = await pool.query(
        'SELECT c.*, et.html_content, et.text_content FROM email_campaigns c LEFT JOIN email_templates et ON c.template_id = et.id WHERE c.id = $1',
        [campaignId]
      );

      if (campaignResult.rows.length === 0) {
        throw new Error('Campagne non trouvée');
      }

      const campaign = campaignResult.rows[0];

      // Récupérer les contacts des listes
      const contactsResult = await pool.query(`
        SELECT DISTINCT c.* FROM contacts c
        JOIN contact_mailing_lists cml ON c.id = cml.contact_id
        WHERE cml.mailing_list_id = ANY($1) AND c.subscribed = true
      `, [mailingListIds]);

      const contacts = contactsResult.rows;
      let sentCount = 0;
      let errorCount = 0;

      // Envoyer à chaque contact
      for (const contact of contacts) {
        try {
          // Remplacer les variables dans le contenu
          const htmlContent = this.replaceVariables(campaign.html_content, contact);
          const textContent = this.replaceVariables(campaign.text_content, contact);
          const subject = this.replaceVariables(campaign.subject, contact);

          await this.sendEmail(contact.email, subject, htmlContent, textContent);

          // Enregistrer l'événement
          await pool.query(
            'INSERT INTO email_events (campaign_id, contact_id, event_type) VALUES ($1, $2, $3)',
            [campaignId, contact.id, 'sent']
          );

          sentCount++;
        } catch (error) {
          console.error(`Erreur envoi à ${contact.email}:`, error);
          errorCount++;
        }
      }

      // Mettre à jour les statistiques
      await pool.query(
        'UPDATE campaign_statistics SET sent = sent + $1 WHERE campaign_id = $2',
        [sentCount, campaignId]
      );

      // Mettre à jour le statut de la campagne
      await pool.query(
        'UPDATE email_campaigns SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['sent', campaignId]
      );

      await pool.end();

      return {
        success: true,
        sent: sentCount,
        errors: errorCount,
        message: `Campagne envoyée: ${sentCount} emails envoyés, ${errorCount} erreurs`
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la campagne:', error);
      throw error;
    }
  }

  // Remplacer les variables dans le contenu
  replaceVariables(content, contact) {
    if (!content) return content;

    return content
      .replace(/\{\{first_name\}\}/g, contact.first_name || '')
      .replace(/\{\{last_name\}\}/g, contact.last_name || '')
      .replace(/\{\{email\}\}/g, contact.email || '')
      .replace(/\{\{company\}\}/g, contact.company || '')
      .replace(/\{\{company_name\}\}/g, contact.company || 'Votre Entreprise')
      .replace(/\{\{login_url\}\}/g, `${process.env.CORS_ORIGIN || 'http://localhost:8080'}/login`)
      .replace(/\{\{month_name\}\}/g, new Date().toLocaleDateString('fr-FR', { month: 'long' }))
      .replace(/\{\{feature_1\}\}/g, 'Nouvelle interface utilisateur')
      .replace(/\{\{feature_2\}\}/g, 'Amélioration des performances');
  }

  // Convertir HTML en texte
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  // Sauvegarder la configuration SMTP
  async saveSMTPConfig(config) {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { 
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        } : false
      });

      // Désactiver toutes les configurations existantes
      await pool.query('UPDATE mailing_smtp_config SET is_active = false');

      // Insérer la nouvelle configuration
      const result = await pool.query(`
        INSERT INTO mailing_smtp_config (host, port, secure, username, password_encrypted, from_email, from_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        config.host,
        config.port,
        config.secure,
        config.username,
        this.encryptSensitiveData(config.password),
        config.fromEmail,
        config.fromName
      ]);

      await pool.end();

      // Recharger la configuration
      await this.loadSMTPConfig();

      return {
        success: true,
        id: result.rows[0].id,
        message: 'Configuration SMTP sauvegardée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration SMTP:', error);
      throw error;
    }
  }
}

module.exports = new MailingService();
