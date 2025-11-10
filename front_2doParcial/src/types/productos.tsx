import { type ReactNode } from 'react';

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Marca {
  id: number;
  nombre: string;
}

export interface Especificacion {
  id: number;
  nombre: string;
  descripcion: string;
  estado?: boolean;
}

export interface Imagen {
  id: number;
  imagen: string | ArrayBuffer | null;
  es_principal: boolean;
  estado?: boolean;
  file?: File;
}

export interface Producto {
  id?: number;
  descripcion: string;
  precio: number | string;
  categoria?: Categoria;
  marca?: Marca;
  estado: boolean;
  imagenes: Imagen[];
  especificaciones: Especificacion[];
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ProductoFormProps {
  producto?: Producto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface FormDataState {
  descripcion: string;
  precio: number | string;
  categoria_id: number | string;
  marca_id: number | string;
  estado: boolean;
}

export interface NuevaEspecificacionState {
  nombre: string;
  descripcion: string;
}