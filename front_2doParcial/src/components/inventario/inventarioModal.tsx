import React from 'react';
import { Modal } from '../usuario/Modal';
import { InventarioForm } from './inventarioForm';
import type { Inventario } from '../../types/inventario';

interface InventarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  inventario?: Inventario;
  onSuccess: () => void;
}

export const InventarioModal: React.FC<InventarioModalProps> = ({
  isOpen,
  onClose,
  mode,
  inventario,
  onSuccess
}) => {
  const getTitle = () => {
    return mode === 'create' 
      ? 'Crear Nuevo Inventario' 
      : `Editar Inventario: ${inventario?.producto.nombre}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="md"
    >
      <InventarioForm
        inventario={mode === 'edit' ? inventario : undefined}
        onSuccess={onSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};