import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ActiveEmailProvider } from "@/contexts/ActiveEmailContext";
import { SubscriptionProvider } from "@/lib/subscription";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import { AppLayout } from "./components/app/AppLayout";
import Integrations from "./pages/Integrations";
import IntegrationSetup from "./pages/IntegrationSetup";
import Categories from "./pages/Categories";
import Sync from "./pages/Sync";
import Settings from "./pages/Settings";
import EmailDraft from "./pages/EmailDraft";
import AIActivityDashboard from "./pages/AIActivityDashboard";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AIChat from "./pages/AIChat";
import AIDailyBrief from "./pages/AIDailyBrief";
import Pricing from "./pages/Pricing";
import SuperAdmin from "./pages/SuperAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ActiveEmailProvider>
          <SubscriptionProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* Backwards-compatible: older links/routes may still use /dashboard */}
                <Route path="/dashboard" element={<Navigate to="/integrations" replace />} />
                <Route element={<AppLayout />}>
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/integration-setup" element={<IntegrationSetup />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/sync" element={<Sync />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/email-draft" element={<EmailDraft />} />
                  <Route path="/ai-activity" element={<AIActivityDashboard />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/ai-daily-brief" element={<AIDailyBrief />} />
                  <Route path="/super-admin" element={<SuperAdmin />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SubscriptionProvider>
        </ActiveEmailProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
