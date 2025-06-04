// In backend/server.js (or app.js)
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Configure CORS appropriately for your frontend URL in production
app.use(express.json());

// --- API Endpoints ---

// 1. Get Vehicle Types based on number of wheels
app.get("/api/vehicle-types", async (req, res) => {
  try {
    const { wheels } = req.query;
    if (!wheels || !["2", "4"].includes(wheels)) {
      return res
        .status(400)
        .json({ error: "Valid number of wheels (2 or 4) is required." });
    }
    const numWheels = parseInt(wheels);
    const vehicleTypes = await prisma.vehicleType.findMany({
      where: {
        numberOfWheels: numWheels,
      },
      orderBy: {
        name: "asc",
      },
    });
    res.json(vehicleTypes);
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    res.status(500).json({ error: "Could not fetch vehicle types" });
  }
});

// 2. Get Specific Vehicle Models based on vehicle type ID
app.get("/api/vehicles", async (req, res) => {
  try {
    const { vehicleTypeId } = req.query;
    if (!vehicleTypeId) {
      return res.status(400).json({ error: "Vehicle type ID is required." });
    }
    const typeId = parseInt(vehicleTypeId);
    const vehicles = await prisma.vehicle.findMany({
      where: {
        vehicleTypeId: typeId,
      },
      orderBy: {
        modelName: "asc",
      },
    });
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Could not fetch vehicles" });
  }
});

// 3. Submit Booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { firstName, lastName, vehicleId, startDate, endDate } = req.body;

    // --- Basic Validation ---
    if (!firstName || !lastName || !vehicleId || !startDate || !endDate) {
      return res.status(400).json({
        error:
          "All fields are required: firstName, lastName, vehicleId, startDate, endDate.",
      });
    }

    const vehicleIdInt = parseInt(vehicleId);
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format for startDate or endDate." });
    }

    if (parsedEndDate < parsedStartDate) {
      return res
        .status(400)
        .json({ error: "End date must be after start date." });
    }
    if (parsedStartDate < new Date().setHours(0, 0, 0, 0)) {
      // Compare with start of today
      return res
        .status(400)
        .json({ error: "Start date cannot be in the past." });
    }

    // --- Overlap Check ---
    // "Assume that there is only 1 vehicle of each type so make a check to ensure
    // that bookings for the same vehicles don’t overlap."
    // This means checking for the specific vehicleId.
    const overlappingBookings = await prisma.booking.findFirst({
      where: {
        vehicleId: vehicleIdInt,
        OR: [
          {
            // New booking starts during an existing booking
            startDate: { lte: parsedEndDate }, // Existing booking starts before or at the same time new one ends
            endDate: { gte: parsedStartDate }, // Existing booking ends after or at the same time new one starts
          },
        ],
      },
    });

    if (overlappingBookings) {
      return res.status(409).json({
        // 409 Conflict
        error:
          "Vehicle not available for the selected dates. It is already booked.",
        conflictingBooking: {
          // Optionally send some info about the conflict
          startDate: overlappingBookings.startDate,
          endDate: overlappingBookings.endDate,
        },
      });
    }

    // --- Create User (or find existing) and Booking ---
    // For simplicity, creating a new user entry for each booking for now.
    // You might want to findOrCreate user based on first/last name if they are unique identifiers.
    let user = await prisma.user.findFirst({
      where: {
        firstName: firstName, // This is a simplification. Real user management is more complex.
        lastName: lastName,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
        },
      });
    }

    const newBooking = await prisma.booking.create({
      data: {
        firstName, // Storing directly as requested by form fields
        lastName, // Storing directly
        userId: user.id, // Link to user
        vehicleId: vehicleIdInt,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
      include: {
        // Include related vehicle information in the response
        vehicle: {
          include: {
            vehicleType: true,
          },
        },
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    if (
      error.code === "P2003" &&
      error.meta?.field_name?.includes("vehicleId")
    ) {
      return res
        .status(404)
        .json({ error: "Selected vehicle does not exist." });
    }
    res.status(500).json({ error: "Could not create booking." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
