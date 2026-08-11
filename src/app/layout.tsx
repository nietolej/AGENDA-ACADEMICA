import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { SemesterProvider } from "@/core/SemesterContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Agenda Académica",
  description: "Gestión de materias, horarios, notas y tareas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={inter.className}>
        <SemesterProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </SemesterProvider>
      </body>
    </html>
  );
}
