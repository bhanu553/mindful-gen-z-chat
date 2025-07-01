
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthHandler from "@/components/auth/AuthHandler";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from "@/components/ui/footer";
import Index from "./pages/Index";
import Therapy from "./pages/Therapy";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import Login from "./pages/Login";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import FreePlanDetails from "./pages/FreePlanDetails";
import PremiumPlanDetails from "./pages/PremiumPlanDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <AuthProvider>
            <AuthHandler />
            <div className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute requireAuth={false}>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/therapy" element={
                  <ProtectedRoute>
                    <Therapy />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/summary" element={
                  <ProtectedRoute>
                    <Summary />
                  </ProtectedRoute>
                } />
                <Route path="/free-plan-details" element={
                  <ProtectedRoute requireAuth={false}>
                    <FreePlanDetails />
                  </ProtectedRoute>
                } />
                <Route path="/premium-plan-details" element={
                  <ProtectedRoute requireAuth={false}>
                    <PremiumPlanDetails />
                  </ProtectedRoute>
                } />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </AuthProvider>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
