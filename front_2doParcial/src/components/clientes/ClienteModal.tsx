import React from 'react';
import { Modal } from '../usuario/Modal';
import { ClienteForm } from './ClienteForm';
import type { Cliente } from '../../services/clientes.service'; 

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  cliente?: Cliente;
  onSuccess: () => void;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  onClose,
  mode,
  cliente,
  onSuccess
}) => {
  const getTitle = () => {
    return mode === 'create' 
      ? 'Crear Nuevo Cliente' 
      : `Editar Cliente: ${cliente?.nombre_completo}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
    >
      <ClienteForm
        cliente={mode === 'edit' ? cliente : undefined}
        onSuccess={onSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};