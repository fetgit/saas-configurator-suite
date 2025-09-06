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
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Contact } from "./pages/Contact";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminDatabase } from "./pages/admin/AdminDatabase";
import { AdminAppearance } from "./pages/admin/AdminAppearance";
import { AdminLegal } from "./pages/admin/AdminLegal";
import { AdminMailing } from "./pages/admin/AdminMailing";
import { AdminCommunity } from "./pages/admin/AdminCommunity";
import { AdminChatbot } from "./pages/admin/AdminChatbot";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminCompanies } from "./pages/admin/AdminCompanies";
import { AdminSecurity } from "./pages/admin/AdminSecurity";
import { AdminSecurityHeaders } from "./pages/admin/AdminSecurityHeaders";
import AdminSystem from "./pages/admin/AdminSystem";
import { MediaShowcase } from "./pages/MediaShowcase";
import { CommunityDashboard } from "./pages/community/CommunityDashboard";
import { PrivacyPolicy } from "./pages/legal/PrivacyPolicy";
import { TermsOfService } from "./pages/legal/TermsOfService";
import { LegalNotice } from "./pages/legal/LegalNotice";
import { CookiePolicy } from "./pages/legal/CookiePolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/contact" element={<Contact />} />
                      
                      {/* Pages d'administration */}
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
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
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