import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import ManagerDashboard from "./pages/manager/Dashboard";
import PatientsPage from "./pages/manager/Patients";
import PantryDashboard from "./pages/pantry/Dashboard";
import DeliveryDashboard from "./pages/delivery/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/patients" element={<PatientsPage />} />
                <Route path="/pantry/dashboard" element={<PantryDashboard />} />
                <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
              </Routes>
            </div>
            <footer className="py-4 text-center text-gray-600 bg-gray-100 sticky bottom-0">
              Made by Rudransh Das
            </footer>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;