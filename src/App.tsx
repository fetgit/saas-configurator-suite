import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LegalProvider } from "@/contexts/LegalContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { MailingProvider } from "@/contexts/MailingContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { MediaProvider } from "@/contexts/MediaContext";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { DynamicHead } from "@/components/DynamicHead";
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Contact } from "./pages/Contact";
import { AdminSecurity } from "./pages/admin/AdminSecurity";
import { AdminSecurityHeaders } from "./pages/admin/AdminSecurityHeaders";

// Lazy loading pour les composants lourds
const AdminAnalytics = React.lazy(() => import("./pages/admin/AdminAnalytics").then(module => ({ default: module.AdminAnalytics })));
const AdminCompanies = React.lazy(() => import("./pages/admin/AdminCompanies").then(module => ({ default: module.AdminCompanies })));
const AdminCommunity = React.lazy(() => import("./pages/admin/AdminCommunity").then(module => ({ default: module.AdminCommunity })));
const AdminMailing = React.lazy(() => import("./pages/admin/AdminMailing").then(module => ({ default: module.AdminMailing })));
const AdminAppearance = React.lazy(() => import("./pages/admin/AdminAppearance").then(module => ({ default: module.AdminAppearance })));
const AdminLegal = React.lazy(() => import("./pages/admin/AdminLegal").then(module => ({ default: module.AdminLegal })));
const AdminUsers = React.lazy(() => import("./pages/admin/AdminUsers").then(module => ({ default: module.AdminUsers })));
const AdminDatabase = React.lazy(() => import("./pages/admin/AdminDatabase").then(module => ({ default: module.AdminDatabase })));
const AdminChatbot = React.lazy(() => import("./pages/admin/AdminChatbot").then(module => ({ default: module.AdminChatbot })));
const AdminSettings = React.lazy(() => import("./pages/admin/AdminSettings").then(module => ({ default: module.AdminSettings })));
const AdminSystem = React.lazy(() => import("./pages/admin/AdminSystem"));
const AdminPerformance = React.lazy(() => import("./pages/admin/AdminPerformance").then(module => ({ default: module.AdminPerformance })));
const AdminSecurityIntegrated = React.lazy(() => import("./pages/admin/AdminSecurityIntegrated").then(module => ({ default: module.AdminSecurityIntegrated })));
const AdminPricing = React.lazy(() => import("./pages/admin/AdminPricing").then(module => ({ default: module.AdminPricing })));

// Lazy loading pour les pages publiques
const MediaShowcase = React.lazy(() => import("./pages/MediaShowcase").then(module => ({ default: module.MediaShowcase })));
const CommunityDashboard = React.lazy(() => import("./pages/community/CommunityDashboard").then(module => ({ default: module.CommunityDashboard })));
const Pricing = React.lazy(() => import("./pages/Pricing").then(module => ({ default: module.Pricing })));
const Features = React.lazy(() => import("./pages/Features").then(module => ({ default: module.Features })));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard").then(module => ({ default: module.AdminDashboard })));

// Lazy loading pour les pages légales
const PrivacyPolicy = React.lazy(() => import("./pages/legal/PrivacyPolicy").then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import("./pages/legal/TermsOfService").then(module => ({ default: module.TermsOfService })));
const CookiePolicy = React.lazy(() => import("./pages/legal/CookiePolicy").then(module => ({ default: module.CookiePolicy })));
const LegalNotice = React.lazy(() => import("./pages/legal/LegalNotice").then(module => ({ default: module.LegalNotice })));
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant de chargement pour le lazy loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <LegalProvider>
        <AuthProvider>
          <AppearanceProvider>
            <CommunityProvider>
              <MailingProvider>
                <ChatbotProvider>
                  <MediaProvider>
                  <TooltipProvider>
                  <DynamicHead />
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/features" element={<Features />} />
                      
                      {/* Pages d'administration */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/admin/database" element={<AdminDatabase />} />
                      <Route path="/admin/appearance" element={<AdminAppearance />} />
                      <Route path="/admin/legal" element={<AdminLegal />} />
                      <Route path="/admin/mailing" element={<AdminMailing />} />
                      <Route path="/admin/community" element={<AdminCommunity />} />
                      <Route path="/admin/chatbot" element={<AdminChatbot />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="/admin/companies" element={<AdminCompanies />} />
                      <Route path="/admin/security" element={<AdminSecurity />} />
                      <Route path="/admin/security-headers" element={<AdminSecurityHeaders />} />
                      <Route path="/admin/system" element={<AdminSystem />} />
                      
                      {/* Page de démonstration des médias */}
                      <Route path="/media-showcase" element={<MediaShowcase />} />
                      
                      {/* Pages communauté */}
                      <Route path="/community" element={<CommunityDashboard />} />
                      
                      {/* Pages légales */}
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/legal" element={<LegalNotice />} />
                      <Route path="/cookies" element={<CookiePolicy />} />
                      
                      {/* Page d'optimisation des performances */}
                      <Route path="/admin/performance" element={<AdminPerformance />} />
                      
                      {/* Page de sécurité intégrée */}
                      <Route path="/admin/security-integrated" element={<AdminSecurityIntegrated />} />
                      
                      {/* Page de gestion des tarifs */}
                      <Route path="/admin/pricing" element={<AdminPricing />} />
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    </React.Suspense>
                    <ChatbotWidget />
                  </BrowserRouter>
                </TooltipProvider>
                </MediaProvider>
              </ChatbotProvider>
            </MailingProvider>
          </CommunityProvider>
        </AppearanceProvider>
      </AuthProvider>
    </LegalProvider>
  </LanguageProvider>
</QueryClientProvider>
);

export default App;