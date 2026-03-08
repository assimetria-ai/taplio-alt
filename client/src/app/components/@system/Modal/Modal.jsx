// @system — Modal/Dialog component
// Accessible modal with backdrop, animations, and responsive design
//
// Usage:
// <Modal open={isOpen} onClose={() => setOpen(false)} title="Title">
//   <p>Content</p>
// </Modal>

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'
import { Button } from '../ui/button'

/**
 * Modal — Accessible modal dialog component
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} [props.title] - Modal title
 * @param {string} [props.description] - Modal description
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} [props.footer] - Modal footer content
 * @param {string} [props.size='md'] - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} [props.showCloseButton=true] - Show close button
 * @param {boolean} [props.closeOnBackdrop=true] - Close on backdrop click
 * @param {boolean} [props.closeOnEscape=true] - Close on Escape key
 * @param {string} [props.className] - Additional CSS classes
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
}) {
  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={cn(
          'relative w-full bg-background rounded-lg shadow-lg animate-in zoom-in-95',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-muted-foreground mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 rounded-lg p-2 hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ConfirmModal — Pre-configured confirmation modal
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm handler
 * @param {string} props.title - Confirmation title
 * @param {string} [props.description] - Confirmation message
 * @param {string} [props.confirmText='Confirm'] - Confirm button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 * @param {string} [props.variant='default'] - Button variant: 'default', 'destructive'
 * @param {boolean} [props.loading=false] - Loading state
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Loading...' : confirmText}
          </Button>
        </>
      }
    />
  )
}
