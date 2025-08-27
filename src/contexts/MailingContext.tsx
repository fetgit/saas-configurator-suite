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

  // Données de démonstration
  useEffect(() => {
    // Configuration SMTP par défaut
    setSMTPConfig({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      username: 'noreply@example.com',
      password: '',
      fromEmail: 'noreply@example.com',
      fromName: 'Mon SaaS'
    });

    // Templates par défaut
    setTemplates([
      {
        id: '1',
        name: 'Email de bienvenue',
        subject: 'Bienvenue sur {{company_name}} !',
        htmlContent: `
          <h1>Bienvenue {{first_name}} !</h1>
          <p>Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
          <p>Votre compte a été créé avec succès pour l'entreprise {{company_name}}.</p>
          <a href="{{login_url}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Se connecter</a>
        `,
        textContent: 'Bienvenue {{first_name}} ! Nous sommes ravis de vous compter parmi nos utilisateurs.',
        variables: ['first_name', 'company_name', 'login_url'],
        category: 'welcome',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Newsletter mensuelle',
        subject: 'Nouveautés du mois - {{month_name}}',
        htmlContent: `
          <h1>Newsletter {{month_name}}</h1>
          <p>Découvrez les dernières nouveautés et améliorations.</p>
          <div>
            <h2>Nouvelles fonctionnalités</h2>
            <ul>
              <li>{{feature_1}}</li>
              <li>{{feature_2}}</li>
            </ul>
          </div>
        `,
        textContent: 'Newsletter {{month_name}} - Découvrez les dernières nouveautés.',
        variables: ['month_name', 'feature_1', 'feature_2'],
        category: 'newsletter',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Listes par défaut
    setMailingLists([
      {
        id: '1',
        name: 'Tous les utilisateurs',
        description: 'Liste principale contenant tous les utilisateurs actifs',
        contacts: [],
        tags: ['users', 'active'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Newsletter',
        description: 'Utilisateurs abonnés à la newsletter',
        contacts: [],
        tags: ['newsletter', 'marketing'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Contacts de démonstration
    setContacts([
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        tags: ['vip', 'newsletter'],
        subscribed: true,
        subscriptionDate: new Date(),
        customFields: { plan: 'premium', industry: 'tech' }
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'TechStart',
        tags: ['newsletter'],
        subscribed: true,
        subscriptionDate: new Date(),
        customFields: { plan: 'basic', industry: 'startup' }
      }
    ]);

    // Campagnes de démonstration
    setCampaigns([
      {
        id: '1',
        name: 'Campagne de bienvenue',
        subject: 'Bienvenue !',
        templateId: '1',
        mailingListIds: ['1'],
        status: 'sent',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        statistics: {
          sent: 150,
          delivered: 148,
          opened: 89,
          clicked: 23,
          unsubscribed: 2,
          bounced: 2,
          complained: 0,
          openRate: 60.1,
          clickRate: 25.8,
          unsubscribeRate: 1.3
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }, []);

  // Fonctions SMTP
  const updateSMTPConfig = async (config: SMTPConfig) => {
    setIsLoading(true);
    try {
      // Simulation d'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSMTPConfig(config);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la configuration SMTP');
    } finally {
      setIsLoading(false);
    }
  };

  const testSMTPConnection = async () => {
    setIsLoading(true);
    try {
      // Simulation de test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
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