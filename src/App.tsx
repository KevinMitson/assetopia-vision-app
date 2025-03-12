import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Component, ErrorInfo, ReactNode } from "react";
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
import AssetDetail from "./pages/Assets/AssetDetail";
import ManageDepartments from "./pages/Management/ManageDepartments";
import ManageStations from "./pages/Management/ManageStations";
import ManageAssetTypes from "./pages/Management/ManageAssetTypes";
import ManageRoles from "./pages/Management/ManageRoles";
import Users from "./pages/Users";
import Maintenance from "./pages/Maintenance";

// Error boundary component to catch unhandled errors
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-muted p-3 rounded-md mb-4 overflow-auto">
                <p className="font-mono text-sm">{this.state.error.toString()}</p>
              </div>
            )}
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
              <Route path="/assets/add" element={<ProtectedRoute><AddAsset /></ProtectedRoute>} />
              <Route path="/assets/:assetId" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/stations" element={<ProtectedRoute><Stations /></ProtectedRoute>} />
              <Route path="/personnel" element={<ProtectedRoute><Personnel /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
              
              {/* Admin Only Routes */}
              <Route path="/permissions" element={<ProtectedRoute requireAdmin={true}><Permissions /></ProtectedRoute>} />
              <Route path="/management/departments" element={<ProtectedRoute requireAdmin={true}><ManageDepartments /></ProtectedRoute>} />
              <Route path="/management/stations" element={<ProtectedRoute requireAdmin={true}><ManageStations /></ProtectedRoute>} />
              <Route path="/management/asset-types" element={<ProtectedRoute requireAdmin={true}><ManageAssetTypes /></ProtectedRoute>} />
              <Route path="/management/roles" element={<ProtectedRoute requireAdmin={true}><ManageRoles /></ProtectedRoute>} />
              
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
