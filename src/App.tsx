import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequestProvider } from "@/contexts/RequestContext";
import { PNRProvider } from "@/contexts/PNRContext";

// Lazy loading das páginas para otimização de performance
const Index = lazy(() => import("./pages/Index"));
const SolicitarManutencao = lazy(() => import("./pages/SolicitarManutencao"));
const ConsultarStatus = lazy(() => import("./pages/ConsultarStatus"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const OrdemServico = lazy(() => import("./pages/OrdemServico"));
const GerenciarPNRs = lazy(() => import("./pages/GerenciarPNRs"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Componente de loading exibido enquanto as páginas carregam
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RequestProvider>
        <PNRProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/solicitar" element={<SolicitarManutencao />} />
                  <Route path="/consultar" element={<ConsultarStatus />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/pnrs" element={<GerenciarPNRs />} />
                  <Route path="/admin/ordem-servico/:id" element={<OrdemServico />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </PNRProvider>
      </RequestProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
