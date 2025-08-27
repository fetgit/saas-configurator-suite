import React, { createContext, useContext, useState, useEffect } from 'react';

// Types pour le contexte légal
export interface LegalContent {
  id: string;
  type: 'privacy' | 'terms' | 'legal' | 'cookies';
  title: string;
  content: string;
  lastUpdated: string;
  isPublished: boolean;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  siret: string;
  rcs: string;
  capital: string;
  director: string;
}

interface LegalContextType {
  legalPages: LegalContent[];
  companyInfo: CompanyInfo;
  updateLegalPage: (page: LegalContent) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
  getLegalPageByType: (type: string) => LegalContent | undefined;
}

// Contenu par défaut des pages légales
const defaultLegalPages: LegalContent[] = [
  {
    id: '1',
    type: 'privacy',
    title: 'Politique de confidentialité',
    content: `# Politique de confidentialité

## 1. Collecte des informations
Nous collectons les informations que vous nous fournissez directement, notamment :
- Nom et prénom
- Adresse email
- Informations de l'entreprise

## 2. Utilisation des données
Vos données sont utilisées pour :
- Fournir nos services
- Communiquer avec vous
- Améliorer notre plateforme

## 3. Protection des données
Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles.

## 4. Vos droits
Vous avez le droit de :
- Accéder à vos données
- Les rectifier ou les supprimer
- Vous opposer à leur traitement

## 5. Contact
Pour toute question concernant cette politique, contactez-nous à l'adresse : privacy@example.com`,
    lastUpdated: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: '2',
    type: 'terms',
    title: 'Conditions d\'utilisation',
    content: `# Conditions d'utilisation

## 1. Acceptation des conditions
En utilisant notre service, vous acceptez ces conditions d'utilisation.

## 2. Description du service
Notre plateforme SaaS offre des solutions complètes pour la gestion d'entreprise.

## 3. Comptes utilisateur
- Vous êtes responsable de la confidentialité de votre compte
- Vous devez fournir des informations exactes
- Vous ne devez pas partager vos identifiants

## 4. Utilisation acceptable
Il est interdit de :
- Utiliser le service à des fins illégales
- Tenter de compromettre la sécurité
- Transmettre des virus ou codes malveillants

## 5. Propriété intellectuelle
Tous les droits de propriété intellectuelle nous appartiennent.

## 6. Limitation de responsabilité
Notre responsabilité est limitée dans les conditions prévues par la loi.

## 7. Résiliation
Nous pouvons suspendre ou résilier votre accès en cas de violation.`,
    lastUpdated: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: '3',
    type: 'legal',
    title: 'Mentions légales',
    content: `# Mentions légales

## Éditeur du site
**Raison sociale :** [À compléter]  
**Forme juridique :** [À compléter]  
**Capital social :** [À compléter]  
**Adresse :** [À compléter]  
**Téléphone :** [À compléter]  
**Email :** [À compléter]  

## Identification de l'entreprise
**SIRET :** [À compléter]  
**RCS :** [À compléter]  
**Numéro TVA :** [À compléter]  

## Directeur de la publication
**Nom :** [À compléter]  
**Qualité :** [À compléter]  

## Hébergement
**Hébergeur :** [À compléter]  
**Adresse :** [À compléter]  

## Propriété intellectuelle
Le contenu de ce site est protégé par les droits d'auteur.

## Données personnelles
Voir notre politique de confidentialité pour plus d'informations.`,
    lastUpdated: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: '4',
    type: 'cookies',
    title: 'Politique des cookies',
    content: `# Politique des cookies

## Qu'est-ce qu'un cookie ?
Les cookies sont de petits fichiers texte stockés sur votre appareil lors de la visite de notre site.

## Types de cookies utilisés
### Cookies nécessaires
- Authentification utilisateur
- Préférences de langue
- Sécurité du site

### Cookies analytiques
- Google Analytics (anonymisé)
- Suivi des performances

### Cookies de préférences
- Thème d'affichage
- Paramètres d'interface

## Gestion des cookies
Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.

## Cookies tiers
Nous utilisons des services tiers qui peuvent déposer leurs propres cookies.

## Contact
Pour toute question sur les cookies : cookies@example.com`,
    lastUpdated: new Date().toISOString(),
    isPublished: true,
  },
];

const defaultCompanyInfo: CompanyInfo = {
  name: 'SaaS Template SARL',
  address: '123 Rue de l\'Innovation, 75001 Paris, France',
  phone: '+33 1 23 45 67 89',
  email: 'contact@saastemplate.com',
  siret: '12345678901234',
  rcs: 'Paris B 123 456 789',
  capital: '10 000 €',
  director: 'John Doe',
};

const LegalContext = createContext<LegalContextType | undefined>(undefined);

export const LegalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [legalPages, setLegalPages] = useState<LegalContent[]>(defaultLegalPages);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);

  // Chargement depuis le localStorage au démarrage
  useEffect(() => {
    const savedLegalPages = localStorage.getItem('legalPages');
    const savedCompanyInfo = localStorage.getItem('companyInfo');
    
    if (savedLegalPages) {
      try {
        setLegalPages(JSON.parse(savedLegalPages));
      } catch (error) {
        console.error('Error parsing saved legal pages:', error);
      }
    }
    
    if (savedCompanyInfo) {
      try {
        setCompanyInfo(JSON.parse(savedCompanyInfo));
      } catch (error) {
        console.error('Error parsing saved company info:', error);
      }
    }
  }, []);

  const updateLegalPage = (updatedPage: LegalContent) => {
    const updatedPages = legalPages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    );
    setLegalPages(updatedPages);
    localStorage.setItem('legalPages', JSON.stringify(updatedPages));
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    localStorage.setItem('companyInfo', JSON.stringify(info));
  };

  const getLegalPageByType = (type: string): LegalContent | undefined => {
    return legalPages.find(page => page.type === type && page.isPublished);
  };

  return (
    <LegalContext.Provider 
      value={{ 
        legalPages, 
        companyInfo, 
        updateLegalPage, 
        updateCompanyInfo, 
        getLegalPageByType 
      }}
    >
      {children}
    </LegalContext.Provider>
  );
};

export const useLegal = () => {
  const context = useContext(LegalContext);
  if (context === undefined) {
    throw new Error('useLegal must be used within a LegalProvider');
  }
  return context;
};