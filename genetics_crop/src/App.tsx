import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import CropRecords from "./pages/user/CropRecords";
import GeneticTraits from "./pages/user/GeneticTraits";
import ClimateData from "./pages/user/ClimateData";
import SoilAnalysis from "./pages/user/SoilAnalysis";
import Predictions from "./pages/user/Predictions";
import Reports from "./pages/user/Reports";
import DataManagement from "./pages/admin/DataManagement";
import BulkUpload from "./pages/admin/BulkUpload";
import UserManagement from "./pages/admin/UserManagement";
import MLModel from "./pages/admin/MLModel";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'user' }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/data-management" element={<ProtectedRoute requiredRole="admin"><DataManagement /></ProtectedRoute>} />
      <Route path="/admin/bulk-upload" element={<ProtectedRoute requiredRole="admin"><BulkUpload /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/ml-model" element={<ProtectedRoute requiredRole="admin"><MLModel /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/crops" element={<ProtectedRoute requiredRole="user"><CropRecords /></ProtectedRoute>} />
      <Route path="/dashboard/traits" element={<ProtectedRoute requiredRole="user"><GeneticTraits /></ProtectedRoute>} />
      <Route path="/dashboard/climate" element={<ProtectedRoute requiredRole="user"><ClimateData /></ProtectedRoute>} />
      <Route path="/dashboard/soil" element={<ProtectedRoute requiredRole="user"><SoilAnalysis /></ProtectedRoute>} />
      <Route path="/dashboard/predictions" element={<ProtectedRoute requiredRole="user"><Predictions /></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute requiredRole="user"><Reports /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
