import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { samplePatients } from "@/utils/sampleData";

interface Patient {
  id: string;
  name: string;
  room_number: string;
  diet_type: string;
  allergies: string[];
}

interface PatientFormData {
  name: string;
  room_number: string;
  diet_type: string;
  allergies: string;
}

const PatientsPage: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, reset } = useForm<PatientFormData>();
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      console.log("Fetching patients data...");
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching patients:", error);
          toast.error("Failed to fetch patients");
          return samplePatients;
        }

        if (!data || data.length === 0) {
          console.log("No patients found, using sample data");
          return samplePatients;
        }

        console.log("Patients data fetched:", data);
        return data;
      } catch (error) {
        console.error("Error in queryFn:", error);
        return samplePatients;
      }
    },
  });

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting patient with ID:", id);
      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) {
        console.error("Error deleting patient:", error);
        toast.error("Failed to delete patient");
        return;
      }

      toast.success("Patient deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("An error occurred while deleting the patient");
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      console.log("Creating new patient:", data);
      
      const allergiesArray = data.allergies
        ? data.allergies.split(",").map((a) => a.trim())
        : [];

      const { error } = await supabase.from("patients").insert([
        {
          name: data.name,
          room_number: data.room_number,
          diet_type: data.diet_type,
          allergies: allergiesArray,
        },
      ]);

      if (error) {
        console.error("Error creating patient:", error);
        toast.error("Failed to create patient");
        return;
      }

      toast.success("Patient created successfully");
      reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("An error occurred while creating the patient");
    }
  };

  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Fill in the patient details below. For allergies, use commas to separate multiple items.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} required />
              </div>
              <div>
                <Label htmlFor="room_number">Room Number</Label>
                <Input id="room_number" {...register("room_number")} required />
              </div>
              <div>
                <Label htmlFor="diet_type">Diet Type</Label>
                <Input id="diet_type" {...register("diet_type")} required />
              </div>
              <div>
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input id="allergies" {...register("allergies")} />
              </div>
              <Button type="submit" className="w-full">
                Create Patient
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {patients && patients.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Room Number</TableHead>
              <TableHead>Diet Type</TableHead>
              <TableHead>Allergies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.room_number}</TableCell>
                <TableCell>{patient.diet_type}</TableCell>
                <TableCell>{patient.allergies.join(", ")}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(patient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No patients found. Add your first patient using the button above.
        </div>
      )}
    </div>
  );
};

export default PatientsPage;