export interface ProductoInventario {
  id: number;
  descripcion: string;
  nombre_categoria?: string;
  nombre_marca?: string;
}

export interface Inventario {
  id: number;
  cantidad: number;
  ubicacion: string;
  producto: number;
  producto_descripcion?: string;
  estado: boolean;
  fecha_actualizacion: string;
}

export interface InventarioFormData {
  cantidad: number;
  ubicacion: string;
  producto_id: string;
  estado: boolean;
}