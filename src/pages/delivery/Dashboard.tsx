import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Package, CheckCircle } from "lucide-react";
import { sampleOrders } from "@/utils/sampleData";

const DeliveryDashboard = () => {
  const { user } = useAuth();
  console.log("Delivery Dashboard rendered", { user });

  const { data: orders, refetch } = useQuery({
    queryKey: ["delivery-orders"],
    queryFn: async () => {
      console.log("Fetching delivery orders...");
      try {
        const { data, error } = await supabase
          .from("pantry_orders")
          .select(`
            *,
            patients (
              name,
              room_number,
              diet_type,
              allergies
            )
          `)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load orders");
          return sampleOrders.filter(order => order.status === 'completed');
        }

        if (!data || data.length === 0) {
          console.log("No orders found, using sample data");
          return sampleOrders.filter(order => order.status === 'completed');
        }

        console.log("Fetched orders:", data);
        return data;
      } catch (error) {
        console.error("Error in queryFn:", error);
        return sampleOrders.filter(order => order.status === 'completed');
      }
    },
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log("Updating order status", { orderId, newStatus });
    const { error } = await supabase
      .from("pantry_orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
      return;
    }

    toast.success(`Order marked as ${newStatus}`);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pending Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders?.filter((order) => order.status === "completed").length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Meal Type</TableHead>
                <TableHead>Special Instructions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.patients?.name}</TableCell>
                  <TableCell>{order.patients?.room_number}</TableCell>
                  <TableCell>{order.meal_type}</TableCell>
                  <TableCell>{order.special_instructions || 'None'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Delivered
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!orders || orders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No orders ready for delivery at the moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
