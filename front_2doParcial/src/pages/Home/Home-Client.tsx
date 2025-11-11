// pages/home-cliente.tsx - VERSIÓN COMPLETA INTEGRADA
"use client"

import { useState, useEffect } from "react";
import Header from "../../components/header";
import Hero from "../../components/hero";
import Categories from "../../components/categories";
import ProductGrid from "../../components/product-grid";
import Footer from "../../components/footer";
import Cart from "../../components/cart";
import { useAuth } from "../../context/AuthContext";
import { 
  obtenerCarritoUsuario, 
  type ItemCarrito, 
  eliminarItemCarrito, 
  actualizarItemCarrito,
  agregarItemCarrito,
  obtenerOCrearCarrito,
  vaciarCarrito
} from "../../services/carrito.service";
import { crearPedido } from "../../services/pedidos.service";
import { crearSesionPago } from "../../services/facturas.service";
import { obtenerProducto } from "../../services/productos.service";
import toast from "react-hot-toast";

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  itemId?: number
  productoId: number
}

interface PedidoFormData {
  direccion_envio: string;
  telefono_contacto: string;
  notas: string;
}

export default function HomeCliente() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [updatingItems, setUpdatingItems] = useState<number[]>([])
  const [currentCarritoId, setCurrentCarritoId] = useState<number | null>(null)
  
  const { isAuthenticated, user, isCliente } = useAuth();

  // Función para obtener imagen de un producto
  const obtenerImagenProducto = async (productoId: number): Promise<string> => {
    try {
      const producto = await obtenerProducto(productoId);
      if (producto.imagenes && producto.imagenes.length > 0) {
        const imagenPrincipal = producto.imagenes.find(img => img.es_principal);
        return imagenPrincipal?.imagen_url || producto.imagenes[0].imagen_url;
      }
      return '/placeholder-product.jpg';
    } catch (error) {
      console.error('Error al obtener imagen del producto:', error);
      return '/placeholder-product.jpg';
    }
  };

  // Cargar carrito del usuario al iniciar
  useEffect(() => {
    const cargarCarrito = async () => {
      if (isAuthenticated && isCliente && user) {
        try {
          const carrito = await obtenerCarritoUsuario(user.id);
          setCurrentCarritoId(carrito.id);
          
          const itemsConImagenes = await Promise.all(
            carrito.items
              .filter((item: ItemCarrito) => item.estado)
              .map(async (item: ItemCarrito) => {
                const imagen = await obtenerImagenProducto(item.producto);
                return {
                  id: item.id,
                  productoId: item.producto,
                  name: item.producto_descripcion,
                  price: parseFloat(item.precio_unitario),
                  quantity: item.cantidad,
                  image: imagen,
                  itemId: item.id
                };
              })
          );
          
          setCartItems(itemsConImagenes);
        } catch (error: any) {
          console.error('Error al cargar carrito:', error);
          if (error.response?.status !== 404) {
            toast.error('Error al cargar el carrito');
          }
        }
      }
    };

    cargarCarrito();
  }, [isAuthenticated, isCliente, user]);

  // Función para agregar al carrito
  const addToCart = async (product: { 
    id: number; 
    name: string; 
    price: number; 
    image: string;
  }) => {
    if (!isAuthenticated || !isCliente || !user) return;

    try {
      // Obtener o crear carrito
      const carrito = await obtenerOCrearCarrito(user.id);
      setCurrentCarritoId(carrito.id);
      
      // Agregar producto al carrito en el backend
      const itemBackend = await agregarItemCarrito(carrito.id, product.id, 1);
      
      // Buscar si ya existe en el carrito local
      const existingItem = cartItems.find(item => item.productoId === product.id);
      
      if (existingItem) {
        setCartItems(prev => 
          prev.map(item => 
            item.productoId === product.id 
              ? { 
                  ...item, 
                  quantity: item.quantity + 1,
                  itemId: itemBackend.id,
                  id: itemBackend.id
                }
              : item
          )
        );
      } else {
        const nuevoItem: CartItem = {
          id: itemBackend.id,
          productoId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          itemId: itemBackend.id
        };
        setCartItems(prev => [...prev, nuevoItem]);
      }

      toast.success('Producto agregado al carrito');
    } catch (error: any) {
      console.error('Error al agregar al carrito:', error);
      const errorMessage = error.response?.data?.error || 'Error al agregar producto al carrito';
      toast.error(errorMessage);
    }
  }

  // Función para actualizar cantidad
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (!isAuthenticated || !isCliente) return;

    const item = cartItems.find(item => item.id === itemId);
    if (!item) {
      console.error('Item no encontrado en el carrito:', itemId);
      return;
    }

    if (!item.itemId) {
      console.error('Item no tiene itemId:', item);
      toast.error('Error: producto no sincronizado con el servidor');
      return;
    }

    setUpdatingItems(prev => [...prev, itemId]);

    try {
      if (newQuantity <= 0) {
        await eliminarItemCarrito(item.itemId);
        setCartItems(prev => prev.filter(cartItem => cartItem.id !== itemId));
        toast.success('Producto eliminado del carrito');
      } else {
        await actualizarItemCarrito(item.itemId, newQuantity);
        setCartItems(prev => 
          prev.map(cartItem => 
            cartItem.id === itemId 
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          )
        );
      }
    } catch (error: any) {
      console.error('Error al actualizar carrito:', error);
      const errorMessage = error.response?.data?.error || 'Error al actualizar el carrito';
      toast.error(errorMessage);
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== itemId));
    }
  }

  // NUEVA FUNCIÓN: Manejar checkout y crear pedido
  const handleProceedToCheckout = async (formData: PedidoFormData) => {
    if (!currentCarritoId || !user) {
      toast.error('Error: No se pudo procesar el pedido');
      return;
    }

    try {
      // Mostrar loading
      toast.loading('Creando pedido...', { id: 'creando-pedido' });

      // 1. Crear el pedido
      const pedido = await crearPedido(currentCarritoId, {
        direccion_envio: formData.direccion_envio,
        telefono_contacto: formData.telefono_contacto,
        notas: formData.notas || ''
      });

      toast.success('Pedido creado exitosamente!', { id: 'creando-pedido' });

      // 2. Crear sesión de pago con Stripe
      toast.loading('Preparando pago...', { id: 'preparando-pago' });
      
      const sessionPago = await crearSesionPago(pedido.id);

      // 3. Vaciar carrito local
      setCartItems([]);
      
      // 4. Redirigir a Stripe Checkout
      window.location.href = sessionPago.checkout_url;

    } catch (error: any) {
      console.error('Error en el proceso de checkout:', error);
      toast.error(error.response?.data?.error || 'Error al procesar el pedido', { 
        id: 'creando-pedido',
        duration: 5000 
      });
    }
  }

  // Función para manejar cierre del carrito
  const handleCloseCart = () => {
    setCartOpen(false);
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-background">
      <Header 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartClick={() => {
          if (!isAuthenticated || !isCliente) {
            toast.error('Debes iniciar sesión como cliente para ver el carrito')
            return;
          }
          setCartOpen(!cartOpen)
        }} 
      />
      
      {cartOpen && isAuthenticated && isCliente && (
        <Cart 
          items={cartItems} 
          onClose={handleCloseCart}
          onUpdateQuantity={updateQuantity}
          updatingItems={updatingItems}
          onProceedToCheckout={handleProceedToCheckout} // ← CONECTADO
        />
      )}
      
      <Hero />
      <Categories />
      <ProductGrid onAddToCart={addToCart} />
      <Footer />
    </main>
  )
}