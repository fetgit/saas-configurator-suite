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
const demoMembers: CommunityMember[] = [];

const demoPosts: CommunityPost[] = [];
const demoGroups: CommunityGroup[] = [];
const demoEvents: CommunityEvent[] = [];

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