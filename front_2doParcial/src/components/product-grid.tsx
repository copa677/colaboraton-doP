import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { listarProductos, type Producto } from '.././services/productos.service';
import { type ImagenProducto } from '.././services/imagenesProductos.service';

interface ProductGridProps {
  onAddToCart: (product: {
    id: number;
    name: string;
    price: number;
    image: string;
  }) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        const productosData = await listarProductos();
        setProducts(productosData);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // Obtener la imagen principal de un producto
  const getImagenPrincipal = (imagenes: ImagenProducto[]): string => {
    const imagenPrincipal = imagenes.find(img => img.es_principal);
    return imagenPrincipal?.imagen_url || '/placeholder-product.jpg';
  };

  // Formatear precio
  const formatPrice = (price: string): string => {
    return `$${parseFloat(price).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Manejar agregar al carrito
  const handleAddToCart = (product: Producto) => {
    onAddToCart({
      id: product.id,
      name: product.descripcion,
      price: parseFloat(product.precio),
      image: getImagenPrincipal(product.imagenes)
    });
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Productos Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-4 animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-4 rounded w-3/4 mb-3"></div>
                <div className="bg-muted h-6 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Productos Destacados</h2>
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <p className="text-destructive">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Productos Destacados</h2>
          <div className="bg-muted rounded-lg p-8">
            <p className="text-muted-foreground text-lg">No hay productos disponibles en este momento.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Productos Destacados</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              {/* Imagen del producto */}
              <div className="relative overflow-hidden bg-muted">
                <img
                  src={getImagenPrincipal(product.imagenes)}
                  alt={product.descripcion}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.jpg';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                    {product.nombre_categoria}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                    {product.nombre_marca}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-white/90 text-foreground p-2 rounded-full hover:bg-white transition">
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              {/* Información del producto */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 h-10">
                  {product.descripcion}
                </h3>

                {/* Rating (placeholder) */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < 4 ? "fill-current" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">(4.5)</span>
                </div>

                {/* Precio y stock */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.precio)}
                  </span>
                  {product.inventario && product.inventario.cantidad > 0 ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {product.inventario.cantidad} en stock
                    </span>
                  ) : (
                    <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                      Sin stock
                    </span>
                  )}
                </div>

                {/* Botón agregar al carrito */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inventario || product.inventario.cantidad === 0}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA al final */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            ¿No encuentras lo que buscas?
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition">
            Ver Todos los Productos
          </button>
        </div>
      </div>
    </section>
  );
}