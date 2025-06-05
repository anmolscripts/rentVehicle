import { ReactNode } from "react";

// Example in frontend/src/types/index.ts (or similar)
export interface FormData {
  firstName: string;
  lastName: string;
  numberOfWheels: "2" | "4" | null;
  vehicleTypeId: string | null; // Store ID
  vehicleModelId: string | null; // Store ID
  startDate: Date | null;
  endDate: Date | null;
}

export interface VehicleTypeAPI {
  id: number;
  name: string;
  numberOfWheels: number;
}

export interface VehicleAPI {
  name: ReactNode;
  id: number;
  modelName: string;
  vehicleTypeId: number;
}
