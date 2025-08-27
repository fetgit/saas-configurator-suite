import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Types pour le système de communauté
export interface CommunityMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'superadmin';
  company?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  joinDate: string;
  lastActive: string;
  isOnline: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author: CommunityMember;
  title: string;
  content: string;
  category: 'general' | 'help' | 'announcement' | 'feature' | 'bug';
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  likes: number;
  replies: CommunityReply[];
  isPinned: boolean;
  isResolved?: boolean;
  company?: string; // Pour les communautés d'entreprise
}

export interface CommunityReply {
  id: string;
  authorId: string;
  author: CommunityMember;
  postId: string;
  content: string;
  createdAt: string;
  likes: number;
  isAnswer?: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: 'team' | 'project' | 'interest' | 'company';
  members: CommunityMember[];
  admins: string[];
  isPrivate: boolean;
  company?: string;
  createdAt: string;
  lastActivity: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number; // en minutes
  type: 'webinar' | 'meeting' | 'workshop' | 'social';
  organizer: CommunityMember;
  attendees: string[];
  maxAttendees?: number;
  isOnline: boolean;
  location?: string;
  meetingLink?: string;
  company?: string;
}

interface CommunityContextType {
  members: CommunityMember[];
  posts: CommunityPost[];
  groups: CommunityGroup[];
  events: CommunityEvent[];
  
  // Actions pour les posts
  createPost: (post: Omit<CommunityPost, 'id' | 'author' | 'createdAt' | 'likes' | 'replies'>) => void;
  updatePost: (postId: string, updates: Partial<CommunityPost>) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => void;
  
  // Actions pour les réponses
  addReply: (reply: Omit<CommunityReply, 'id' | 'author' | 'createdAt' | 'likes'>) => void;
  likeReply: (replyId: string) => void;
  markAsAnswer: (replyId: string) => void;
  
  // Actions pour les groupes
  createGroup: (group: Omit<CommunityGroup, 'id' | 'createdAt' | 'lastActivity'>) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // Actions pour les événements
  createEvent: (event: Omit<CommunityEvent, 'id' | 'attendees'>) => void;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  
  // Filtres et recherche
  getPostsByCompany: (company?: string) => CommunityPost[];
  getGroupsByCompany: (company?: string) => CommunityGroup[];
  getEventsByCompany: (company?: string) => CommunityEvent[];
}

// Données de démonstration
const demoMembers: CommunityMember[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'admin@example.com',
    role: 'superadmin',
    company: 'SaaS Company',
    title: 'Fondateur & CEO',
    bio: 'Passionné par l\'innovation et les technologies SaaS',
    skills: ['Leadership', 'Strategy', 'SaaS', 'Management'],
    joinDate: '2024-01-01T00:00:00Z',
    lastActive: new Date().toISOString(),
    isOnline: true,
  },
  {
    id: '2',
    name: 'Manager Client',
    email: 'manager@client.com',
    role: 'admin',
    company: 'Client Company',
    title: 'Directeur Technique',
    bio: 'Expert en transformation digitale',
    skills: ['Management', 'Digital', 'Innovation'],
    joinDate: '2024-01-05T00:00:00Z',
    lastActive: new Date(Date.now() - 300000).toISOString(),
    isOnline: true,
  },
  {
    id: '3',
    name: 'User Client',
    email: 'user@client.com',
    role: 'user',
    company: 'Client Company',
    title: 'Développeur',
    bio: 'Développeur full-stack passionné',
    skills: ['React', 'Node.js', 'TypeScript', 'SaaS'],
    joinDate: '2024-01-10T00:00:00Z',
    lastActive: new Date(Date.now() - 600000).toISOString(),
    isOnline: false,
  },
];

const demoPosts: CommunityPost[] = [
  {
    id: '1',
    authorId: '1',
    author: demoMembers[0],
    title: 'Bienvenue dans notre communauté SaaS !',
    content: 'Nous sommes ravis de vous accueillir dans notre communauté. Ici, vous pourrez échanger, poser vos questions et partager vos expériences avec d\'autres utilisateurs de notre plateforme.',
    category: 'announcement',
    tags: ['welcome', 'community', 'announcement'],
    createdAt: '2024-01-01T10:00:00Z',
    likes: 25,
    replies: [],
    isPinned: true,
    company: undefined, // Post global
  },
  {
    id: '2',
    authorId: '2',
    author: demoMembers[1],
    title: 'Comment optimiser l\'utilisation de la plateforme ?',
    content: 'Bonjour à tous, je cherche des conseils pour optimiser l\'utilisation de notre plateforme au sein de mon équipe. Avez-vous des bonnes pratiques à partager ?',
    category: 'help',
    tags: ['optimization', 'best-practices', 'team'],
    createdAt: '2024-01-15T14:30:00Z',
    likes: 8,
    replies: [
      {
        id: '1',
        authorId: '3',
        author: demoMembers[2],
        postId: '2',
        content: 'Je recommande de commencer par former tous les utilisateurs sur les fonctionnalités de base, puis d\'introduire progressivement les fonctionnalités avancées.',
        createdAt: '2024-01-15T15:45:00Z',
        likes: 5,
        isAnswer: true,
      }
    ],
    isPinned: false,
    isResolved: true,
    company: 'Client Company',
  },
];

const demoGroups: CommunityGroup[] = [
  {
    id: '1',
    name: 'Développeurs SaaS',
    description: 'Groupe pour les développeurs utilisant notre plateforme',
    category: 'interest',
    members: demoMembers,
    admins: ['1'],
    isPrivate: false,
    createdAt: '2024-01-01T00:00:00Z',
    lastActivity: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Équipe Client Company',
    description: 'Groupe privé pour l\'équipe de Client Company',
    category: 'company',
    members: [demoMembers[1], demoMembers[2]],
    admins: ['2'],
    isPrivate: true,
    company: 'Client Company',
    createdAt: '2024-01-05T00:00:00Z',
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
  },
];

const demoEvents: CommunityEvent[] = [
  {
    id: '1',
    title: 'Webinar : Nouveautés 2024',
    description: 'Découvrez les nouvelles fonctionnalités de notre plateforme pour 2024',
    date: '2024-02-15T14:00:00Z',
    duration: 60,
    type: 'webinar',
    organizer: demoMembers[0],
    attendees: ['2', '3'],
    maxAttendees: 100,
    isOnline: true,
    meetingLink: 'https://meet.example.com/webinar-2024',
  },
  {
    id: '2',
    title: 'Réunion équipe - Client Company',
    description: 'Point mensuel de l\'équipe Client Company',
    date: '2024-01-30T09:00:00Z',
    duration: 90,
    type: 'meeting',
    organizer: demoMembers[1],
    attendees: ['3'],
    isOnline: true,
    company: 'Client Company',
    meetingLink: 'https://meet.example.com/client-team',
  },
];

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [members] = useState<CommunityMember[]>(demoMembers);
  const [posts, setPosts] = useState<CommunityPost[]>(demoPosts);
  const [groups, setGroups] = useState<CommunityGroup[]>(demoGroups);
  const [events, setEvents] = useState<CommunityEvent[]>(demoEvents);

  // Actions pour les posts
  const createPost = (postData: Omit<CommunityPost, 'id' | 'author' | 'createdAt' | 'likes' | 'replies'>) => {
    if (!user) return;
    
    const author = members.find(m => m.id === user.id) || {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      joinDate: user.createdAt,
      lastActive: new Date().toISOString(),
      isOnline: true,
    } as CommunityMember;

    const newPost: CommunityPost = {
      ...postData,
      id: Date.now().toString(),
      author,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
      company: user.role !== 'superadmin' ? user.company : postData.company,
    };

    setPosts(prev => [newPost, ...prev]);
  };

  const updatePost = (postId: string, updates: Partial<CommunityPost>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates, updatedAt: new Date().toISOString() } : post
    ));
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  // Actions pour les réponses
  const addReply = (replyData: Omit<CommunityReply, 'id' | 'author' | 'createdAt' | 'likes'>) => {
    if (!user) return;

    const author = members.find(m => m.id === user.id) || {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      joinDate: user.createdAt,
      lastActive: new Date().toISOString(),
      isOnline: true,
    } as CommunityMember;

    const newReply: CommunityReply = {
      ...replyData,
      id: Date.now().toString(),
      author,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setPosts(prev => prev.map(post => 
      post.id === replyData.postId 
        ? { ...post, replies: [...post.replies, newReply] }
        : post
    ));
  };

  const likeReply = (replyId: string) => {
    setPosts(prev => prev.map(post => ({
      ...post,
      replies: post.replies.map(reply => 
        reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
      )
    })));
  };

  const markAsAnswer = (replyId: string) => {
    setPosts(prev => prev.map(post => ({
      ...post,
      replies: post.replies.map(reply => 
        reply.id === replyId ? { ...reply, isAnswer: true } : { ...reply, isAnswer: false }
      ),
      isResolved: true
    })));
  };

  // Actions pour les groupes
  const createGroup = (groupData: Omit<CommunityGroup, 'id' | 'createdAt' | 'lastActivity'>) => {
    const newGroup: CommunityGroup = {
      ...groupData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      company: user?.role !== 'superadmin' ? user?.company : groupData.company,
    };

    setGroups(prev => [newGroup, ...prev]);
  };

  const joinGroup = (groupId: string) => {
    if (!user) return;

    const member = members.find(m => m.id === user.id);
    if (!member) return;

    setGroups(prev => prev.map(group => 
      group.id === groupId && !group.members.find(m => m.id === user.id)
        ? { ...group, members: [...group.members, member] }
        : group
    ));
  };

  const leaveGroup = (groupId: string) => {
    if (!user) return;

    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: group.members.filter(m => m.id !== user.id) }
        : group
    ));
  };

  // Actions pour les événements
  const createEvent = (eventData: Omit<CommunityEvent, 'id' | 'attendees'>) => {
    const newEvent: CommunityEvent = {
      ...eventData,
      id: Date.now().toString(),
      attendees: [],
      company: user?.role !== 'superadmin' ? user?.company : eventData.company,
    };

    setEvents(prev => [newEvent, ...prev]);
  };

  const joinEvent = (eventId: string) => {
    if (!user) return;

    setEvents(prev => prev.map(event => 
      event.id === eventId && !event.attendees.includes(user.id)
        ? { ...event, attendees: [...event.attendees, user.id] }
        : event
    ));
  };

  const leaveEvent = (eventId: string) => {
    if (!user) return;

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, attendees: event.attendees.filter(id => id !== user.id) }
        : event
    ));
  };

  // Filtres
  const getPostsByCompany = (company?: string) => {
    if (!user) return [];
    
    if (user.role === 'superadmin') {
      return company ? posts.filter(p => p.company === company) : posts;
    }
    
    return posts.filter(p => !p.company || p.company === user.company);
  };

  const getGroupsByCompany = (company?: string) => {
    if (!user) return [];
    
    if (user.role === 'superadmin') {
      return company ? groups.filter(g => g.company === company) : groups;
    }
    
    return groups.filter(g => !g.company || g.company === user.company || !g.isPrivate);
  };

  const getEventsByCompany = (company?: string) => {
    if (!user) return [];
    
    if (user.role === 'superadmin') {
      return company ? events.filter(e => e.company === company) : events;
    }
    
    return events.filter(e => !e.company || e.company === user.company);
  };

  return (
    <CommunityContext.Provider 
      value={{ 
        members,
        posts,
        groups,
        events,
        createPost,
        updatePost,
        deletePost,
        likePost,
        addReply,
        likeReply,
        markAsAnswer,
        createGroup,
        joinGroup,
        leaveGroup,
        createEvent,
        joinEvent,
        leaveEvent,
        getPostsByCompany,
        getGroupsByCompany,
        getEventsByCompany,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};