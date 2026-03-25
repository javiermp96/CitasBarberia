import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import { Toaster } from "./ui/sonner";

export default function RootLayout() {
  return (
    <div className="font-sans min-h-screen flex flex-col relative w-full h-full">
      <div className="fixed inset-0 z-[-1] min-h-screen w-full">
        <img
          src="/logo.jpeg"
          alt="Fondo Cheri Barber"
          className="object-cover object-center w-full h-full"
        />
        {/* Capa de opacidad para asegurar que el texto sea siempre legible */}
        <div className="absolute inset-0 bg-background/80" />
      </div>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
