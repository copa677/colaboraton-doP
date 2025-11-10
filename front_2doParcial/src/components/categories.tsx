const categories = [
  { name: "Laptops", icon: "💻", color: "from-blue-500/20 to-blue-600/20" },
  { name: "Televisores", icon: "📺", color: "from-purple-500/20 to-purple-600/20" },
  { name: "Electrodomésticos", icon: "🍳", color: "from-orange-500/20 to-orange-600/20" },
  { name: "Accesorios", icon: "🖱️", color: "from-green-500/20 to-green-600/20" },
  { name: "Componentes", icon: "🔧", color: "from-red-500/20 to-red-600/20" },
  { name: "Audio", icon: "🎧", color: "from-pink-500/20 to-pink-600/20" },
]

export default function Categories() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-balance">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`bg-gradient-to-br ${category.color} border border-border rounded-lg p-6 hover:shadow-lg transition text-center`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <p className="font-semibold text-sm text-foreground">{category.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
