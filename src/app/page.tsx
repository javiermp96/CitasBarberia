export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 text-center">
      <div className="space-y-4 mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent transform transition-all hover:scale-105 duration-300">
          Cheri Barber
        </h1>
        <p className="text-xl md:text-2xl font-medium text-foreground">
          Estilo joven. Elegancia clásica.
        </p>
      </div>
      <p className="text-lg text-muted-foreground mb-10 max-w-xl">
        Reserva tu corte o arreglo de barba de forma rápida y sencilla. Elige tu servicio, tu hora y nosotros hacemos el resto.
      </p>
      <div className="flex gap-4">
        <a href="/book" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 h-14 px-10 py-3 shadow-xl shadow-primary/30">
          Reservar Ahora
        </a>
      </div>
    </div>
  )
}
