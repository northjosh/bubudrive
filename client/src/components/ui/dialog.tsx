import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ComponentChildren;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onOpenChange(false);
        }
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface DialogContentProps {
  children: ComponentChildren;
  className?: string;
}

export function DialogContent({
  children,
  className = "",
}: DialogContentProps) {
  return (
    <div
      className={`relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: ComponentChildren;
  className?: string;
}

export function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface DialogTitleProps {
  children: ComponentChildren;
  className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

interface DialogDescriptionProps {
  children: ComponentChildren;
  className?: string;
}

export function DialogDescription({
  children,
  className = "",
}: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
  );
}

interface DialogFooterProps {
  children: ComponentChildren;
  className?: string;
}

export function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`flex justify-end space-x-3 mt-6 ${className}`}>
      {children}
    </div>
  );
}
