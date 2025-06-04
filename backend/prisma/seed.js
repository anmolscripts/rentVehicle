// In backend/prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Seed Vehicle Types
  const hatchback = await prisma.vehicleType.upsert({
    where: { name: "Hatchback" },
    update: {},
    create: { name: "Hatchback", numberOfWheels: 4 },
  });

  const suv = await prisma.vehicleType.upsert({
    where: { name: "SUV" },
    update: {},
    create: { name: "SUV", numberOfWheels: 4 },
  });

  const sedan = await prisma.vehicleType.upsert({
    where: { name: "Sedan" },
    update: {},
    create: { name: "Sedan", numberOfWheels: 4 },
  });

  const cruiser = await prisma.vehicleType.upsert({
    where: { name: "Cruiser Bike" },
    update: {},
    create: { name: "Cruiser Bike", numberOfWheels: 2 },
  });

  const sportsBike = await prisma.vehicleType.upsert({
    where: { name: "Sports Bike" },
    update: {},
    create: { name: "Sports Bike", numberOfWheels: 2 },
  });
  // Added one more bike type for variety, as "1 bike type" might be a minimum

  console.log("Seeded vehicle types.");

  // Seed Vehicles
  // Hatchbacks
  await prisma.vehicle.upsert({
    where: { modelName: "Maruti Swift" },
    update: {},
    create: { modelName: "Maruti Swift", vehicleTypeId: hatchback.id },
  });
  await prisma.vehicle.upsert({
    where: { modelName: "Hyundai i20" },
    update: {},
    create: { modelName: "Hyundai i20", vehicleTypeId: hatchback.id },
  });

  // SUVs
  await prisma.vehicle.upsert({
    where: { modelName: "Toyota Fortuner" },
    update: {},
    create: { modelName: "Toyota Fortuner", vehicleTypeId: suv.id },
  });
  await prisma.vehicle.upsert({
    where: { modelName: "Mahindra XUV700" },
    update: {},
    create: { modelName: "Mahindra XUV700", vehicleTypeId: suv.id },
  });

  // Sedans
  await prisma.vehicle.upsert({
    where: { modelName: "Honda City" },
    update: {},
    create: { modelName: "Honda City", vehicleTypeId: sedan.id },
  });
  await prisma.vehicle.upsert({
    where: { modelName: "Volkswagen Virtus" },
    update: {},
    create: { modelName: "Volkswagen Virtus", vehicleTypeId: sedan.id },
  });

  // Cruiser Bikes
  await prisma.vehicle.upsert({
    where: { modelName: "Royal Enfield Classic 350" },
    update: {},
    create: {
      modelName: "Royal Enfield Classic 350",
      vehicleTypeId: cruiser.id,
    },
  });
  await prisma.vehicle.upsert({
    where: { modelName: "Bajaj Avenger Cruise 220" },
    update: {},
    create: {
      modelName: "Bajaj Avenger Cruise 220",
      vehicleTypeId: cruiser.id,
    },
  });

  // Sports Bikes
  await prisma.vehicle.upsert({
    where: { modelName: "Yamaha R15 V4" },
    update: {},
    create: { modelName: "Yamaha R15 V4", vehicleTypeId: sportsBike.id },
  });
  await prisma.vehicle.upsert({
    where: { modelName: "KTM RC 200" },
    update: {},
    create: { modelName: "KTM RC 200", vehicleTypeId: sportsBike.id },
  });

  console.log("Seeded vehicles.");
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
