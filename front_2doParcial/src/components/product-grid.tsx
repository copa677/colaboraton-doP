// components/product-grid.tsx - MODIFICADO
import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Eye, LogIn } from 'lucide-react';
import { listarProductos, type Producto } from '../services/productos.service';
import { type ImagenProducto } from '../services/imagenesProductos.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const { isAuthenticated, user, isCliente, login } = useAuth();

  // Cargar productos al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        const productosData = await listarProductos();
        console.log('Productos cargados:', productosData); // ← VER QUÉ VIENE DEL BACKEND
      console.log('Primer producto imágenes:', productosData[0]?.imagenes); // ← VER IMÁGENES
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
    if (!imagenes || !Array.isArray(imagenes) || imagenes.length === 0) {
      return '/placeholder-product.jpg';
    }

    // Buscar imagen principal activa
    const imagenPrincipal = imagenes.find(img => img.es_principal && img.estado !== false);
    if (imagenPrincipal?.imagen_url) {
      return imagenPrincipal.imagen_url;
    }

    // Si no hay principal, tomar la primera imagen activa
    const primeraImagenActiva = imagenes.find(img => img.estado !== false);
    if (primeraImagenActiva?.imagen_url) {
      return primeraImagenActiva.imagen_url;
    }

    // Si no hay imágenes activas, tomar cualquier imagen
    const cualquierImagen = imagenes[0]?.imagen_url;
    return cualquierImagen || '/placeholder-product.jpg';
  };

  // Formatear precio
  const formatPrice = (price: string): string => {
    return `$${parseFloat(price).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Manejar agregar al carrito - CON AUTENTICACIÓN
  const handleAddToCart = async (product: Producto) => {
    // Verificar si el usuario está autenticado y es cliente
    if (!isAuthenticated || !isCliente) {
      toast.error('Debes iniciar sesión como cliente para agregar productos al carrito', {
        duration: 4000,
        position: 'top-right'
      });
      return;
    }

    // Verificar stock
    if (!product.inventario || product.inventario.cantidad === 0) {
      toast.error('Producto sin stock disponible', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }

    try {
      setAddingToCart(product.id);

      // Actualizar el carrito local
      const imagenPrincipal = getImagenPrincipal(product.imagenes);
      onAddToCart({
        id: product.id,
        name: product.descripcion,
        price: parseFloat(product.precio),
        image: imagenPrincipal
      });

      toast.success('Producto agregado al carrito', {
        duration: 3000,
        position: 'top-right'
      });

    } catch (error: any) {
      console.error('Error al agregar al carrito:', error);
      const errorMessage = error.response?.data?.error || 'Error al agregar producto al carrito';
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right'
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // Botón para redirigir al login
  const handleLoginRedirect = () => {
    // Puedes usar tu sistema de routing aquí
    window.location.href = '/login';
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

  // ... resto del código del ProductGrid se mantiene igual hasta el botón ...

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Productos Destacados</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </span>
            {!isAuthenticated && (
              <button
                onClick={handleLoginRedirect}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2"
              >
                <LogIn size={16} />
                Iniciar Sesión
              </button>
            )}
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

                {/* Rating */}
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

                {/* Botón agregar al carrito - MODIFICADO */}
                {!isAuthenticated ? (
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} />
                    Iniciar Sesión para Comprar
                  </button>
                ) : !isCliente ? (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-2 rounded-lg font-semibold cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    Solo para Clientes
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={
                      addingToCart === product.id ||
                      !product.inventario ||
                      product.inventario.cantidad === 0
                    }
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {addingToCart === product.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Agregando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        Agregar al Carrito
                      </>
                    )}
                  </button>
                )}
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