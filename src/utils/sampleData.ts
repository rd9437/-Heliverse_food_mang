// Sample data for development and testing
export const samplePatients = [
  {
    id: "1",
    name: "John Smith",
    room_number: "101",
    diet_type: "Regular",
    allergies: ["Peanuts", "Shellfish"],
    created_at: new Date().toISOString(),
  },
  {
    id: "2", 
    name: "Sarah Johnson",
    room_number: "202",
    diet_type: "Diabetic",
    allergies: ["Dairy"],
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Robert Davis",
    room_number: "303",
    diet_type: "Low Sodium",
    allergies: [],
    created_at: new Date().toISOString(),
  },
];

export const sampleOrders = [
  {
    id: "1",
    patient_id: "1",
    meal_type: "Breakfast",
    meal_time: "Morning",
    status: "pending",
    special_instructions: "Extra fruit please",
    created_at: new Date().toISOString(),
    patients: samplePatients[0],
  },
  {
    id: "2",
    patient_id: "2",
    meal_type: "Lunch",
    meal_time: "Afternoon",
    status: "completed",
    special_instructions: "No dairy products",
    created_at: new Date().toISOString(),
    patients: samplePatients[1],
  },
  {
    id: "3",
    patient_id: "3",
    meal_type: "Dinner",
    meal_time: "Evening",
    status: "delivered",
    special_instructions: null,
    created_at: new Date().toISOString(),
    patients: samplePatients[2],
  },
];