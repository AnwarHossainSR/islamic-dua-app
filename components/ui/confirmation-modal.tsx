'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
  open: boolean
  title: string
  description: string
  cancelText?: string
  confirmText?: string
  confirmVariant?: 'default' | 'destructive'
  icon?: 'warning' | 'info' | 'success' | 'error'
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmationModal({
  open,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmVariant = 'default',
  icon = 'warning',
  onCancel,
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const iconClasses = {
    warning: 'text-amber-500',
    info: 'text-blue-500',
    success: 'text-emerald-500',
    error: 'text-red-500',
  }

  return (
    <AlertDialog open={open} onOpenChange={state => !state && onCancel()}>
      <AlertDialogContent className="w-[90vw] max-w-md rounded-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${iconClasses[icon]}`} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2 text-sm">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              confirmVariant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isLoading ? 'Loading...' : confirmText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
