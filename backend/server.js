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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
