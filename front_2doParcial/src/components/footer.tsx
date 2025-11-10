export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">TechMart</h3>
            <p className="text-sm opacity-90">Tu tienda de electrónica confiable con los mejores precios y servicio.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Laptops
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Televisores
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Componentes
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Garantía
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2025 TechMart. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
