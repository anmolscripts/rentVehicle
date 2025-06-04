// In frontend/src/app/layout.tsx
import ThemeRegistry from "../components/ThemeRegistry/ThemeRegistry";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octalogic Tech Vehicle Rental",
  description: "Rent a vehicle with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
