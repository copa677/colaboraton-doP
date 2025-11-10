import React from 'react';
import { Modal } from '../usuario/Modal';
import { EmpleadoForm } from './EmpleadoForm';
import type { Empleado } from '../../services/empleados.service';

interface EmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  empleado?: Empleado;
  onSuccess: () => void;
}

export const EmpleadoModal: React.FC<EmpleadoModalProps> = ({
  isOpen,
  onClose,
  mode,
  empleado,
  onSuccess
}) => {
  const getTitle = () => {
    return mode === 'create' 
      ? 'Crear Nuevo Empleado' 
      : `Editar Empleado: ${empleado?.nombre_completo}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
    >
      <EmpleadoForm
        empleado={mode === 'edit' ? empleado : undefined}
        onSuccess={onSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};