import React from 'react';
import { Modal } from '../usuario/Modal';
import { ProductoForm } from './ProductoForm';

interface Categoria {
  id: number;
  descripcion: string;
  estado?: boolean;
}

interface Marca {
  id: number;
  nombre: string;
  estado?: boolean;
}

interface Producto {
  id?: number;
  descripcion: string;
  precio: number | string;
  categoria?: Categoria;
  marca?: Marca;
  estado: boolean;
  imagenes: any[];
  especificaciones: any[];
}

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  producto?: Producto | null;
  categorias: Categoria[];
  marcas: Marca[];
  onSuccess: () => void;
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
  isOpen,
  onClose,
  mode,
  producto,
  categorias,
  marcas,
  onSuccess
}) => {
  const getTitle = () => {
    return mode === 'create' 
      ? 'Crear Nuevo Producto' 
      : `Editar Producto: ${producto?.descripcion}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
    >
      <ProductoForm
        producto={mode === 'edit' ? producto : undefined}
        categorias={categorias}
        marcas={marcas}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
};