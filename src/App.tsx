import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Note: React Query DevTools can be added later if needed
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useRealtimeSubscriptions } from "./hooks/useRealtime";
import { supabase } from './integrations/supabase/client';


import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";

import AuthTest from "./pages/AuthTest";

import AdminDashboard from "./pages/admin/Dashboard";
import PropertyManagement from "./pages/admin/PropertyManagement";
import AgentDashboard from "./pages/agent/Dashboard";
import NotFound from "./pages/NotFound";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";


// Create a stable React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Component to initialize realtime subscriptions
const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRealtimeSubscriptions();
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes - No Auth Required */}
                    <Route path="/" element={<Index />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/property/:id" element={<PropertyDetail />} />
                    <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/test-auth" element={<AuthTest />} />
                  <Route path="/sign_up" element={<SignUp />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Routes - Auth Required */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/property-management" element={
                      <ProtectedRoute requiredRole="admin">
                        <PropertyManagement />
                      </ProtectedRoute>
                    } />
                    {/* Agent Routes */}
                    <Route path="/agent/dashboard" element={
                      <ProtectedRoute requiredRole="agent">
                        <AgentDashboard />
                      </ProtectedRoute>
                    } />
                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Toaster />
                <Sonner />
                <Footer />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </RealtimeProvider>
    </QueryClientProvider>
  );
};

export default App;
