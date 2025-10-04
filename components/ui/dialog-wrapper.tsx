"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose
} from "@/components/ui/dialog";

interface DialogWrapperProps extends React.PropsWithChildren {
  open: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * DialogWrapper component that properly handles dialog state and focus management
 * This component fixes the issue where UI becomes uninteractable after closing a dialog
 */
export const DialogWrapper: React.FC<DialogWrapperProps> = ({
  open,
  onClose,
  children,
  className = "",
}) => {
  // Use React's state to ensure proper control of the dialog
  const [isOpen, setIsOpen] = React.useState(open);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  
  // Store the active element before opening dialog
  React.useEffect(() => {
    if (open && !isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [open, isOpen]);

  // Sync the internal state with the external state
  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Handle the close event properly
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // First update our internal state
      setIsOpen(false);
      
      // Then handle external state cleanup with a slight delay
      // This ensures DOM operations complete before state changes
      requestAnimationFrame(() => {
        onClose();
        
        // Return focus to the previously focused element
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus({ preventScroll: true });
        }
      });
    } else {
      setIsOpen(true);
    }
  };

  // Ensure cleanup on unmount
  React.useEffect(() => {
    return () => {
      // If component unmounts while dialog is open, restore focus
      if (isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
      modal={true} // Ensures proper a11y and focus management
    >
      <DialogContent 
        className={className}
        onEscapeKeyDown={() => handleOpenChange(false)}
        onInteractOutside={(e) => {
          e.preventDefault();
          handleOpenChange(false);
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};
