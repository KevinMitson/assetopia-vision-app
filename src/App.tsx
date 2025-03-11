
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
import Activity from "./pages/Activity";
import Inventory from "./pages/Inventory";
import Stations from "./pages/Stations";
import Personnel from "./pages/Personnel";
import Permissions from "./pages/Permissions";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AddAsset from "./pages/Assets/AddAsset";
import ManageDepartments from "./pages/Management/ManageDepartments";
import ManageStations from "./pages/Management/ManageStations";
import ManageAssetTypes from "./pages/Management/ManageAssetTypes";
import ManageRoles from "./pages/Management/ManageRoles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
            <Route path="/assets/add" element={<ProtectedRoute><AddAsset /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/stations" element={<ProtectedRoute><Stations /></ProtectedRoute>} />
            <Route path="/personnel" element={<ProtectedRoute><Personnel /></ProtectedRoute>} />
            
            {/* Admin Only Routes */}
            <Route path="/permissions" element={<ProtectedRoute requireAdmin={true}><Permissions /></ProtectedRoute>} />
            <Route path="/management/departments" element={<ProtectedRoute requireAdmin={true}><ManageDepartments /></ProtectedRoute>} />
            <Route path="/management/stations" element={<ProtectedRoute requireAdmin={true}><ManageStations /></ProtectedRoute>} />
            <Route path="/management/asset-types" element={<ProtectedRoute requireAdmin={true}><ManageAssetTypes /></ProtectedRoute>} />
            <Route path="/management/roles" element={<ProtectedRoute requireAdmin={true}><ManageRoles /></ProtectedRoute>} />
            
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
