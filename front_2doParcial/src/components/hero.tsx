export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-pretty">
              Los mejores gadgets y electrónica
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Descubre nuestra amplia selección de laptops, televisores, electrodomésticos y componentes a los mejores
              precios.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition">
              Explorar Catálogo
            </button>
          </div>
          <div className="bg-muted rounded-lg h-64 sm:h-80 flex items-center justify-center">
            <div className="text-6xl">📱</div>
          </div>
        </div>
      </div>
    </section>
  )
}
