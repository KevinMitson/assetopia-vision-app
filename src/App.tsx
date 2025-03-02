
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
import Activity from "./pages/Activity";
import Inventory from "./pages/Inventory";
import Stations from "./pages/Stations";
import Personnel from "./pages/Personnel";
import Permissions from "./pages/Permissions";
import Settings from "./pages/Settings";
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
          <Route path="/assets" element={<Assets />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
