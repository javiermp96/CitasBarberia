import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cheri Barber",
  description: "Gestión de citas para Cheri Barber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col relative`}>
        <div className="fixed inset-0 z-[-1]">
          <Image
            src="/logo.jpeg"
            alt="Fondo Cheri Barber"
            fill
            quality={80}
            priority
            className="object-cover object-center"
          />
          {/* Capa de opacidad para asegurar que el texto sea siempre legible */}
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
