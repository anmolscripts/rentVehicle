// In frontend/src/app/page.tsx (or a new route like /book)
"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";

import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  AlertTitle,
} from "@mui/material";

// Define minimal types needed for this trimmed example
interface VehicleTypeAPI {
  id: number;
  name: string;
  wheels: number;
}

interface FormData {
  numberOfWheels: "2" | "4" | null;
  vehicleTypeId: string | null;
}

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/";

// --- Validation Schema for wheels ---
const wheelsSchema = yup.object().shape({
  numberOfWheels: yup
    .string()
    .oneOf(["2", "4"], "Please select number of wheels")
    .required("Please select number of wheels"),
});

export default function VehicleTypeSelector() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeAPI[]>([]);

  const methods = useForm<FormData>({
    resolver: yupResolver(wheelsSchema), // Only validating wheels
    mode: "onChange",
    defaultValues: {
      numberOfWheels: null,
      vehicleTypeId: null, // Keep this if you want to display selected type later
    },
  });

  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  const watchedWheels = watch("numberOfWheels");

  // Effect to fetch vehicle types when number of wheels changes
  useEffect(() => {
    if (watchedWheels) {
      setLoading(true);
      setError(null);
      axios
        .get(`${backendUrl}vehicle-types?wheels=${watchedWheels}`)
        .then((response) => {
          setVehicleTypes(response.data);
          setValue("vehicleTypeId", null); // Reset previous selection if needed
        })
        .catch((err) => {
          console.error("Failed to fetch vehicle types", err);
          setError(
            err.response?.data?.error || "Failed to fetch vehicle types."
          );
          setVehicleTypes([]);
        })
        .finally(() => setLoading(false));
    } else {
      setVehicleTypes([]); // Clear types if no wheels are selected
      setValue("vehicleTypeId", null);
    }
  }, [watchedWheels, setValue]);

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Select Vehicle Type by Wheels
        </Typography>

        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset" error={!!errors.numberOfWheels}>
            <FormLabel component="legend">Number of wheels?</FormLabel>
            <Controller
              name="numberOfWheels"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} row>
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label="2 Wheels"
                  />
                  <FormControlLabel
                    value="4"
                    control={<Radio />}
                    label="4 Wheels"
                  />
                </RadioGroup>
              )}
            />
            {errors.numberOfWheels && (
              <Typography color="error" variant="caption">
                {errors.numberOfWheels.message}
              </Typography>
            )}
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" error={!!errors.vehicleTypeId}>
              <FormLabel component="legend">Available Vehicle Types:</FormLabel>
              {vehicleTypes.length > 0 ? (
                <Controller
                  name="vehicleTypeId"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      {vehicleTypes.map((type) => (
                        <FormControlLabel
                          key={type.id}
                          value={String(type.id)}
                          control={<Radio />}
                          label={type.name}
                        />
                      ))}
                    </RadioGroup>
                  )}
                />
              ) : (
                <Typography sx={{ mt: 1 }}>
                  {watchedWheels
                    ? "No vehicle types found for selected wheels."
                    : "Please select number of wheels to see vehicle types."}
                </Typography>
              )}
              {errors.vehicleTypeId && (
                <Typography color="error" variant="caption">
                  {errors.vehicleTypeId.message}
                </Typography>
              )}
            </FormControl>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}
