import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequestProvider } from "@/contexts/RequestContext";
import { PNRProvider } from "@/contexts/PNRContext";
import Index from "./pages/Index";
import SolicitarManutencao from "./pages/SolicitarManutencao";
import ConsultarStatus from "./pages/ConsultarStatus";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import OrdemServico from "./pages/OrdemServico";
import GerenciarPNRs from "./pages/GerenciarPNRs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RequestProvider>
        <PNRProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
            </BrowserRouter>
          </TooltipProvider>
        </PNRProvider>
      </RequestProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

