import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizeClasses =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
      ? "max-w-3xl"
      : "max-w-xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`relative w-full ${sizeClasses} bg-white rounded-2xl shadow-lg overflow-hidden`}
        style={{ maxHeight: "90vh" }} // 👈 limita el alto total del modal
      >
        {/* Contenedor desplazable */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {title && (
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {title}
            </h2>
          )}
          {children}
        </div>

        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Modal;
