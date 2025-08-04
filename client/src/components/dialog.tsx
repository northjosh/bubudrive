import React, { useState, useEffect, useCallback } from 'react';


interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    // Cleanup the event listener when the component unmounts or dialog closes
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }
  return (
    <div class="dialog-overlay" onClick={onClose}>
      {/* The dialog itself, stopping propagation to prevent closing when clicked inside */}
      <div class="dialog-container" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <div class="dialog-header">
          <h2 class="dialog-title">{title}</h2>
          <button class="dialog-close-button" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <div style="dialog-content">
          {children}
        </div>
      </div>
    </div>
  );
};




