import { useEffect, useId, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
}

export default function Modal({
  isOpen,
  title,
  children,
  actions,
  onClose,
  closeOnBackdrop = true,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) {
      return;
    }

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="modal-overlay"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal-header">
          <h3 id={titleId}>{title}</h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            x
          </button>
        </header>

        <div className="modal-body">{children}</div>

        {actions ? <footer className="modal-actions">{actions}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}
