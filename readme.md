Rent Vehicle 
Overview 🚗💨
Rent Vehicle is a full-stack web application designed to provide users with an intuitive multi-step form to collect their information and details about a vehicle they wish to rent, including the rental dates. The application features a Next.js frontend with Material UI and a Node.js (Express.js) backend with Prisma ORM and an SQLite database.

Features ✨
Multi-Step Form: User-friendly interface guiding users through questions one by one.
Dynamic Data Loading: Vehicle types and models are fetched from the database based on user selections.
Input Validation: Ensures users provide necessary information before proceeding to the next step or submitting the form.
Booking System: Allows users to book a specific vehicle for a selected date range.
Overlap Prevention: Backend logic prevents double-booking of the same vehicle for overlapping dates.
Database Seeding: Initial dataset of vehicle types and vehicles.
Tech Stack 🛠️
Frontend:
Next.js (React Framework)
Material UI (MUI) (UI Component Library)
React Hook Form (Form Management and Validation)
Yup (Schema-based Validation)
Axios (HTTP Client)
@mui/x-date-pickers & date-fns (Date Picker)
TypeScript
Backend:
Node.js
Express.js (Web Framework)
Prisma (ORM)
SQLite (SQL Database for development)
cors (Cross-Origin Resource Sharing)
dotenv (Environment Variable Management)
Development:
nodemon (Automatic server restarts)
Prerequisites
Node.js (v18.x or later recommended)
npm (comes with Node.js) or yarn
Git
Project Setup 🚀
Clone the Repository:

```Bash

git clone https://github.com/anmolscripts/rentVehicle.git
cd rentVehicle
Backend Setup:
Navigate to the backend directory:
```

```Bash
cd backend
```
Install Dependencies:

```Bash
npm i
```
Environment Variables: Create a .env file in the backend directory by copying the example:

```Bash

cp .env.example .env
The default DATABASE_URL for SQLite is usually:
DATABASE_URL="file:./dev.db"
```
Ensure this file is present and correctly configured.
Database Migrations: Apply Prisma migrations to set up the database schema. This will also create the dev.db SQLite file if it doesn't exist.
```Bash

npx prisma migrate dev --name init
```

```Bash
npx prisma db seed
```
Frontend Setup:
Navigate to the frontend directory (from the project root):

```Bash

cd frontend
```
Install Dependencies:
```Bash

npm install
```
Environment Variables: Create a .env.local file in the frontend directory:
```Bash

cp .env.local.example .env.local  # If you create an example file
Add the backend API URL:
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
```
(Replace 3001 if your backend runs on a different port)
Running the Application 🏃‍♂️🏃‍♀️
You'll need two terminal windows to run both the backend and frontend servers simultaneously.

Start the Backend Server:
In your first terminal, navigate to the backend directory:

```Bash

cd backend
npm run dev
```
The backend server should start, typically on http://localhost:3001.

Start the Frontend Server:
In your second terminal, navigate to the frontend directory:

```Bash

cd frontend
npm run dev
```
The frontend development server should start, typically on http://localhost:3000.

Open your browser and go to http://localhost:3000 to use the application.

Database Seeding (If not done during setup) 🌱
If you need to re-seed the database or missed the setup step:

Ensure your backend server is not running or stop it.
Navigate to the backend directory:
```Bash

cd backend
```
Run the seed command:
```Bash

npx prisma db seed
```
This will execute the script defined in prisma/seed.js to populate the database.
API Endpoints (Backend) 📡

GET /api/vehicle-types?wheels=<number>: Fetches vehicle types based on the number of wheels.

GET /api/vehicles?vehicleTypeId=<id>: Fetches specific vehicle models for a given vehicle type ID.

POST /api/bookings: Submits a new vehicle booking.