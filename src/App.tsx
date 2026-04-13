import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Positions from "./pages/Positions";
import Orders from "./pages/Orders";
import Strategies from "./pages/Strategies";
import Performance from "./pages/Performance";
import Risk from "./pages/Risk";
import Backtest from "./pages/Backtest";
import DagsterJobs from "./pages/DagsterJobs";
import DataManagement from "./pages/DataManagement";
import Settings from "./pages/Settings";
import SystemHealth from "./pages/SystemHealth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/jobs" element={<DagsterJobs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
