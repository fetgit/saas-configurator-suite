import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'welcome' | 'newsletter' | 'transactional' | 'marketing' | 'notification';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MailingList {
  id: string;
  name: string;
  description: string;
  contacts: Contact[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  tags: string[];
  subscribed: boolean;
  subscriptionDate: Date;
  unsubscribedDate?: Date;
  customFields: Record<string, string>;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  mailingListIds: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduledAt?: Date;
  sentAt?: Date;
  statistics: CampaignStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignStatistics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
}

interface MailingContextType {
  // Configuration SMTP
  smtpConfig: SMTPConfig | null;
  updateSMTPConfig: (config: SMTPConfig) => Promise<void>;
  testSMTPConnection: () => Promise<boolean>;

  // Templates
  templates: EmailTemplate[];
  createTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EmailTemplate>;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<EmailTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<EmailTemplate>;

  // Listes de diffusion
  mailingLists: MailingList[];
  createMailingList: (list: Omit<MailingList, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MailingList>;
  updateMailingList: (id: string, updates: Partial<MailingList>) => Promise<MailingList>;
  deleteMailingList: (id: string) => Promise<void>;

  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'subscriptionDate'>) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  importContacts: (contacts: Partial<Contact>[]) => Promise<Contact[]>;
  exportContacts: (listId?: string) => Promise<Blob>;

  // Campagnes
  campaigns: Campaign[];
  createCampaign: (campaign: Omit<Campaign, 'id' | 'statistics' | 'createdAt' | 'updatedAt'>) => Promise<Campaign>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  duplicateCampaign: (id: string) => Promise<Campaign>;
  sendCampaign: (id: string) => Promise<void>;
  scheduleCampaign: (id: string, scheduledAt: Date) => Promise<void>;
  pauseCampaign: (id: string) => Promise<void>;
  resumeCampaign: (id: string) => Promise<void>;

  // Statistiques globales
  globalStats: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    averageOpenRate: number;
    averageClickRate: number;
  };

  // État de chargement
  isLoading: boolean;
  error: string | null;
}

const MailingContext = createContext<MailingContextType | undefined>(undefined);

export function MailingProvider({ children }: { children: React.ReactNode }) {
  // États principaux
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les vraies données depuis l'API
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setIsLoading(true);
      
      // Charger la configuration SMTP
      const smtpResponse = await fetch('/api/admin/mailing/smtp-config');
      if (smtpResponse.ok) {
        const smtpData = await smtpResponse.json();
        if (smtpData.config) {
          setSMTPConfig({
            host: smtpData.config.host,
            port: smtpData.config.port,
            secure: smtpData.config.secure,
            username: smtpData.config.username,
            password: '', // Ne pas charger le mot de passe
            fromEmail: smtpData.config.fromEmail,
            fromName: smtpData.config.fromName
          });
        }
      }

      // Charger les templates
      const templatesResponse = await fetch('/api/admin/mailing/templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      }

      // Charger les listes de diffusion
      const listsResponse = await fetch('/api/admin/mailing/lists');
      if (listsResponse.ok) {
        const listsData = await listsResponse.json();
        setMailingLists(listsData);
      }

      // Charger les contacts
      const contactsResponse = await fetch('/api/admin/mailing/contacts');
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      }

      // Charger les campagnes
      const campaignsResponse = await fetch('/api/admin/mailing/campaigns');
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser des données par défaut vides
      setTemplates([]);
      setMailingLists([]);
      setContacts([]);
      setCampaigns([]);
      setError(null); // Ne pas afficher d'erreur si le backend n'est pas disponible
    } finally {
      setIsLoading(false);
    }
  };

  // Données de démonstration (fallback)
  useEffect(() => {
    if (templates.length === 0) {
      // Templates par défaut si aucun template n'est chargé
      setTemplates([]);
    }
    if (campaigns.length === 0) {
      setCampaigns([]);
    }
  }, [templates.length, campaigns.length]);

  // Fonctions SMTP
  const updateSMTPConfig = async (config: SMTPConfig) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/mailing/smtp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      setSMTPConfig(config);
      return result;
    } catch (err) {
      setError('Erreur lors de la mise à jour de la configuration SMTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const testSMTPConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/mailing/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Test de connexion échoué');
      }

      const result = await response.json();
      return result.success;
    } catch (err) {
      setError('Échec du test de connexion SMTP');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions Templates
  const createTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: EmailTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    const updatedTemplate = templates.find(t => t.id === id);
    if (!updatedTemplate) throw new Error('Template introuvable');
    
    const updated = { ...updatedTemplate, ...updates, updatedAt: new Date() };
    setTemplates(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const duplicateTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) throw new Error('Template introuvable');
    
    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copie)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates(prev => [...prev, duplicated]);
    return duplicated;
  };

  // Fonctions Listes de diffusion
  const createMailingList = async (listData: Omit<MailingList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newList: MailingList = {
      ...listData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setMailingLists(prev => [...prev, newList]);
    return newList;
  };

  const updateMailingList = async (id: string, updates: Partial<MailingList>) => {
    const updatedList = mailingLists.find(l => l.id === id);
    if (!updatedList) throw new Error('Liste introuvable');
    
    const updated = { ...updatedList, ...updates, updatedAt: new Date() };
    setMailingLists(prev => prev.map(l => l.id === id ? updated : l));
    return updated;
  };

  const deleteMailingList = async (id: string) => {
    setMailingLists(prev => prev.filter(l => l.id !== id));
  };

  // Fonctions Contacts
  const addContact = async (contactData: Omit<Contact, 'id' | 'subscriptionDate'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      subscriptionDate: new Date()
    };
    setContacts(prev => [...prev, newContact]);
    return newContact;
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const updatedContact = contacts.find(c => c.id === id);
    if (!updatedContact) throw new Error('Contact introuvable');
    
    const updated = { ...updatedContact, ...updates };
    setContacts(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteContact = async (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const importContacts = async (contactsData: Partial<Contact>[]) => {
    const newContacts = contactsData.map(data => ({
      id: Date.now().toString() + Math.random(),
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company || '',
      tags: data.tags || [],
      subscribed: data.subscribed ?? true,
      subscriptionDate: new Date(),
      customFields: data.customFields || {}
    }));
    setContacts(prev => [...prev, ...newContacts]);
    return newContacts;
  };

  const exportContacts = async (listId?: string) => {
    const contactsToExport = listId 
      ? contacts.filter(c => mailingLists.find(l => l.id === listId)?.contacts.some(lc => lc.id === c.id))
      : contacts;
    
    const csv = [
      'Email,Prénom,Nom,Entreprise,Tags,Abonné',
      ...contactsToExport.map(c => 
        `${c.email},${c.firstName || ''},${c.lastName || ''},${c.company || ''},${c.tags.join(';')},${c.subscribed}`
      )
    ].join('\n');
    
    return new Blob([csv], { type: 'text/csv' });
  };

  // Fonctions Campagnes
  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'statistics' | 'createdAt' | 'updatedAt'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      statistics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        complained: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCampaigns(prev => [...prev, newCampaign]);
    return newCampaign;
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const updatedCampaign = campaigns.find(c => c.id === id);
    if (!updatedCampaign) throw new Error('Campagne introuvable');
    
    const updated = { ...updatedCampaign, ...updates, updatedAt: new Date() };
    setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteCampaign = async (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const duplicateCampaign = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) throw new Error('Campagne introuvable');
    
    const duplicated = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copie)`,
      status: 'draft' as const,
      statistics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        complained: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCampaigns(prev => [...prev, duplicated]);
    return duplicated;
  };

  const sendCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'sending', sentAt: new Date() });
    // Simulation d'envoi
    setTimeout(() => {
      updateCampaign(id, { status: 'sent' });
    }, 3000);
  };

  const scheduleCampaign = async (id: string, scheduledAt: Date) => {
    await updateCampaign(id, { status: 'scheduled', scheduledAt });
  };

  const pauseCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'paused' });
  };

  const resumeCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'sending' });
  };

  // Statistiques globales
  const globalStats = {
    totalSent: campaigns.reduce((sum, c) => sum + c.statistics.sent, 0),
    totalDelivered: campaigns.reduce((sum, c) => sum + c.statistics.delivered, 0),
    totalOpened: campaigns.reduce((sum, c) => sum + c.statistics.opened, 0),
    totalClicked: campaigns.reduce((sum, c) => sum + c.statistics.clicked, 0),
    averageOpenRate: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.statistics.openRate, 0) / campaigns.length
      : 0,
    averageClickRate: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.statistics.clickRate, 0) / campaigns.length
      : 0
  };

  const value: MailingContextType = {
    // Configuration SMTP
    smtpConfig,
    updateSMTPConfig,
    testSMTPConnection,

    // Templates
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,

    // Listes de diffusion
    mailingLists,
    createMailingList,
    updateMailingList,
    deleteMailingList,

    // Contacts
    contacts,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
    exportContacts,

    // Campagnes
    campaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    sendCampaign,
    scheduleCampaign,
    pauseCampaign,
    resumeCampaign,

    // Statistiques
    globalStats,

    // État
    isLoading,
    error
  };

  return (
    <MailingContext.Provider value={value}>
      {children}
    </MailingContext.Provider>
  );
}

export function useMailing() {
  const context = useContext(MailingContext);
  if (context === undefined) {
    throw new Error('useMailing must be used within a MailingProvider');
  }
  return context;
}