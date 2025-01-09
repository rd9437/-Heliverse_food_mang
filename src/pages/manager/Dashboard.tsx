import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Utensils, TruckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: patientsCount } = useQuery({
    queryKey: ["patients-count"],
    queryFn: async () => {
      console.log("Fetching patients count...");
      const { count, error } = await supabase
        .from("patients")
        .select("*", { count: 'exact', head: true });

      if (error) {
        console.error("Error fetching patients count:", error);
        throw error;
      }
      console.log("Patients count:", count);
      return count;
    },
  });

  const { data: staffCount } = useQuery({
    queryKey: ["staff-count"],
    queryFn: async () => {
      console.log("Fetching staff count...");
      const { count, error } = await supabase
        .from("staff")
        .select("*", { count: 'exact', head: true });

      if (error) {
        console.error("Error fetching staff count:", error);
        throw error;
      }
      console.log("Staff count:", count);
      return count;
    },
  });

  const { data: pantryOrdersCount } = useQuery({
    queryKey: ["pantry-orders-count"],
    queryFn: async () => {
      console.log("Fetching pantry orders count...");
      const { count, error } = await supabase
        .from("pantry_orders")
        .select("*", { count: 'exact', head: true });

      if (error) {
        console.error("Error fetching pantry orders count:", error);
        throw error;
      }
      console.log("Pantry orders count:", count);
      return count;
    },
  });

  console.log("Manager Dashboard rendered", { user, patientsCount, staffCount, pantryOrdersCount });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8">
      <main className="flex-grow container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Welcome, {user?.name}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Patient Management</CardTitle>
              <Users className="h-6 w-6 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2">
                <p className="text-2xl font-bold">{patientsCount || 0}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
              <Button 
                onClick={() => navigate("/manager/patients")}
                className="w-full mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Manage Patients
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Pantry Overview</CardTitle>
              <Utensils className="h-6 w-6 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2">
                <p className="text-2xl font-bold">{pantryOrdersCount || 0}</p>
                <p className="text-sm text-gray-600">Active Orders</p>
              </div>
              <Button 
                onClick={() => navigate("/manager/pantry")}
                className="w-full mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                View Pantry
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Staff Management</CardTitle>
              <TruckIcon className="h-6 w-6 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2">
                <p className="text-2xl font-bold">{staffCount || 0}</p>
                <p className="text-sm text-gray-600">Total Staff</p>
              </div>
              <Button 
                onClick={() => navigate("/manager/staff")}
                className="w-full mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Manage Staff
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;