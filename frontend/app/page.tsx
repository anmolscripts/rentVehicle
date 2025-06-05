// In frontend/src/app/page.tsx (or a new route like /book)
"use client";
import React, { useState, useEffect } from "react";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";

import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  AlertTitle,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"; // For date-fns v3
// If not using pro, use two separate DatePicker components.
// For simplicity, let's assume two separate DatePickers for now if Pro is an issue.
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { FormData, VehicleTypeAPI, VehicleAPI } from "../types/index"; // Create this types file

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/";

// --- Validation Schemas for each step ---
const nameSchema = yup.object().shape({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
});

const wheelsSchema = yup.object().shape({
  numberOfWheels: yup
    .string()
    .oneOf(["2", "4"], "Please select number of wheels")
    .required("Please select number of wheels"),
});

const vehicleTypeSchema = yup.object().shape({
  vehicleTypeId: yup.string().required("Please select a vehicle type"),
});

const vehicleModelSchema = yup.object().shape({
  vehicleModelId: yup.string().required("Please select a specific model"),
});

const dateRangeSchema = yup.object().shape({
  // Using separate start and end dates
  startDate: yup
    .date()
    .nullable()
    .required("Start date is required")
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Start date cannot be in the past"
    ),
  endDate: yup
    .date()
    .nullable()
    .required("End date is required")
    .when("startDate", (startDateArray, schema) => {
      // startDate is an array with one item
      const startDate = startDateArray[0];
      return startDate
        ? schema.min(startDate, "End date must be after start date")
        : schema;
    }),
});

const steps = [
  "Your Name",
  "Number of Wheels",
  "Vehicle Type",
  "Vehicle Model",
  "Booking Dates",
];
const stepSchemas: yup.AnyObjectSchema[] = [
  nameSchema,
  wheelsSchema,
  vehicleTypeSchema,
  vehicleModelSchema,
  dateRangeSchema,
];

export default function BookingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeAPI[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleAPI[]>([]);
  const [fetchingVehicleTypes, setFetchingVehicleTypes] = useState(false);
  const [fetchingVehicleModels, setFetchingVehicleModels] = useState(false);

  const currentValidationSchema = stepSchemas[activeStep];
  const methods = useForm<FormData>({
    resolver: yupResolver(currentValidationSchema),
    mode: "onChange", // Validate on change for better UX
    defaultValues: {
      firstName: "",
      lastName: "",
      numberOfWheels: null,
      vehicleTypeId: null,
      vehicleModelId: null,
      startDate: null,
      endDate: null,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    reset,
    setValue,
  } = methods;

  const watchedWheels = watch("numberOfWheels");
  const watchedVehicleType = watch("vehicleTypeId");
  const watchedStartDate = watch("startDate");

  // Effect to fetch vehicle types when number of wheels changes
  useEffect(() => {
    if (activeStep === 2 && watchedWheels) {
      // Only fetch when on the vehicle type step and wheels are selected
      setFetchingVehicleTypes(true);
      setError(null);
      axios
        .get(`${backendUrl}vehicle-types?wheels=${watchedWheels}`)
        .then((response) => {
          setVehicleTypes(response.data);
          setValue("vehicleTypeId", null); // Reset previous selection
          setVehicleModels([]); // Reset models too
          setValue("vehicleModelId", null);
        })
        .catch((err) => {
          console.error("Failed to fetch vehicle types", err);
          setError(
            err.response?.data?.error || "Failed to fetch vehicle types."
          );
          setVehicleTypes([]);
        })
        .finally(() => setFetchingVehicleTypes(false));
    }
  }, [watchedWheels, activeStep, setValue]);

  // Effect to fetch vehicle models when vehicle type changes
  useEffect(() => {
    if (activeStep === 3 && watchedVehicleType) {
      // Only fetch when on vehicle model step and type is selected
      setFetchingVehicleModels(true);
      setError(null);
      axios
        .get(`${backendUrl}vehicles?vehicleTypeId=${watchedVehicleType}`)
        .then((response) => {
          setVehicleModels(response.data);
          setValue("vehicleModelId", null); // Reset previous selection
        })
        .catch((err) => {
          console.error("Failed to fetch vehicle models", err);
          setError(
            err.response?.data?.error || "Failed to fetch vehicle models."
          );
          setVehicleModels([]);
        })
        .finally(() => setFetchingVehicleModels(false));
    }
  }, [watchedVehicleType, activeStep, setValue]);

  const handleNext = async () => {
    const isStepValid = await trigger(); // Trigger validation for current step fields
    if (isStepValid) {
      if (activeStep === steps.length - 1) {
        // Last step, so submit the form
        handleSubmit(onSubmit)();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setError(null); // Clear previous errors when moving to next step
      }
    } else {
      // Errors will be displayed by RHF, but you can set a general error if needed
      console.log("Validation failed for step", activeStep, errors);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    console.log("Form Data to submit:", data);
    try {
      const response = await axios.post(`${backendUrl}bookings`, {
        firstName: data.firstName,
        lastName: data.lastName,
        vehicleId: data.vehicleModelId, // Ensure this is the ID
        startDate: data.startDate,
        endDate: data.endDate,
      });
      setSuccessMessage(
        `Booking successful! Your booking ID is ${response.data.id}. Vehicle: ${response.data.vehicle.modelName}`
      );
      reset(); // Reset form
      setActiveStep(0); // Go back to first step
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Booking submission error:", err.response);
        setError(
          err.response?.data?.error ||
            "An unexpected error occurred during booking."
        );
      } else {
        console.error("Unknown error during booking:", err);
        setError("An unexpected error occurred during booking.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("vehicleModels", vehicleModels);
    console.log("vehicleTypes", vehicleTypes);
  }, [vehicleModels, vehicleTypes]);
  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Name
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="h6">1. What is your name?</Typography>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Box>
        );
      case 1: // Number of wheels
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" error={!!errors.numberOfWheels}>
              <FormLabel component="legend">2. Number of wheels?</FormLabel>
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
        );
      case 2: // Type of vehicle
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" error={!!errors.vehicleTypeId}>
              <FormLabel component="legend">3. Type of vehicle?</FormLabel>
              {fetchingVehicleTypes ? (
                <CircularProgress size={24} />
              ) : vehicleTypes.length > 0 ? (
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
                <Typography>
                  No vehicle types found for selected wheels, or select number
                  of wheels first.
                </Typography>
              )}
              {errors.vehicleTypeId && (
                <Typography color="error" variant="caption">
                  {errors.vehicleTypeId.message}
                </Typography>
              )}
            </FormControl>
          </Box>
        );
      case 3: // Specific Model
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" error={!!errors.vehicleModelId}>
              <FormLabel component="legend">4. Specific Model?</FormLabel>
              {fetchingVehicleModels ? (
                <CircularProgress size={24} />
              ) : vehicleModels.length > 0 ? (
                <Controller
                  name="vehicleModelId"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      {vehicleModels.map((model) => (
                        <FormControlLabel
                          key={model.id}
                          value={String(model.id)}
                          control={<Radio />}
                          label={model.modelName}
                        />
                      ))}
                    </RadioGroup>
                  )}
                />
              ) : (
                <Typography>
                  No models found for selected type, or select vehicle type
                  first.
                </Typography>
              )}
              {errors.vehicleModelId && (
                <Typography color="error" variant="caption">
                  {errors.vehicleModelId.message}
                </Typography>
              )}
            </FormControl>
          </Box>
        );
      case 4: // Date range picker
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <Typography variant="h6">5. Select booking dates</Typography>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Start Date"
                    disablePast
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.startDate,
                        helperText: errors.startDate?.message,
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="End Date"
                    shouldDisableDate={(date) => {
                      return watchedStartDate ? date < watchedStartDate : false;
                    }}
                    minDate={watchedStartDate || undefined} // Ensure end date cannot be before start date
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.endDate,
                        helperText: errors.endDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Box>
          </LocalizationProvider>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Rental Vehicle
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {" "}
            {/* RHF handles submit on last step */}
            {getStepContent(activeStep)}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }} disabled={loading}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  loading ||
                  (activeStep === 2 && fetchingVehicleTypes) ||
                  (activeStep === 3 && fetchingVehicleModels)
                }
              >
                {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                {activeStep === steps.length - 1 ? "Book Vehicle" : "Next"}
              </Button>
            </Box>
          </form>
        </FormProvider>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <AlertTitle>Success</AlertTitle>
            {successMessage}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}
