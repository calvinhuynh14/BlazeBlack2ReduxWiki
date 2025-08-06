import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--background)] rounded-lg w-full max-w-md mx-auto border border-[var(--border)] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--text-color-light)]">
            Pokémon Details
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-color-light)] hover:text-gray-400 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
