import React from 'react';
import PropTypes from 'prop-types';

export default function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition"
        >
          <span className="sr-only">Cerrar</span>
          ✖
        </button>

        {/* Contenido dinámico del modal */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  children: PropTypes.node.isRequired, // Contenido dinámico dentro del modal
  onClose: PropTypes.func.isRequired, // Función para cerrar el modal
};
