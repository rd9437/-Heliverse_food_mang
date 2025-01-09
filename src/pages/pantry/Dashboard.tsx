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
import { ClipboardList, Plus, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sampleOrders } from "@/utils/sampleData";

interface OrderFormData {
  patient_id: string;
  meal_type: string;
  meal_time: string;
  special_instructions: string;
}

const PantryDashboard = () => {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<OrderFormData>();

  console.log("Pantry Dashboard rendered", { user });

  const { data: orders, refetch } = useQuery({
    queryKey: ["pantry-orders"],
    queryFn: async () => {
      console.log("Fetching pantry orders...");
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
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load orders");
          return sampleOrders;
        }

        if (!data || data.length === 0) {
          console.log("No orders found, using sample data");
          return sampleOrders;
        }

        console.log("Fetched orders:", data);
        return data;
      } catch (error) {
        console.error("Error in queryFn:", error);
        return sampleOrders;
      }
    },
  });

  const { data: patients } = useQuery({
    queryKey: ["patients-for-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to load patients");
        throw error;
      }
      return data;
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

  const onSubmit = async (data: OrderFormData) => {
    console.log("Creating new order:", data);
    const { error } = await supabase.from("pantry_orders").insert([data]);

    if (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
      return;
    }

    toast.success("Order created successfully");
    reset();
    setOpen(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pantry Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <ClipboardList className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders?.filter((order) => order.status === "pending").length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="patient_id">Patient</Label>
                  <Select onValueChange={(value) => setValue("patient_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - Room {patient.room_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meal_type">Meal Type</Label>
                  <Select onValueChange={(value) => setValue("meal_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meal_time">Meal Time</Label>
                  <Select onValueChange={(value) => setValue("meal_time", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="special_instructions">Special Instructions</Label>
                  <Input
                    id="special_instructions"
                    {...register("special_instructions")}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Order
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Meal Type</TableHead>
                <TableHead>Diet Type</TableHead>
                <TableHead>Allergies</TableHead>
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
                  <TableCell>{order.patients?.diet_type}</TableCell>
                  <TableCell>
                    {order.patients?.allergies?.join(", ") || "None"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateOrderStatus(order.id, "in-progress")
                          }
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === "in-progress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "completed")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!orders || orders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No orders found. Create your first order using the button above.
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

export default PantryDashboard;
