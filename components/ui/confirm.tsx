'use client'

import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { toast } from '@/hooks/use-toast'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ConfirmProps {
  children: React.ReactNode
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  confirmVariant?: 'default' | 'destructive'
  icon?: 'warning' | 'info' | 'success' | 'error'
  className?: string
  disabled?: boolean
  onConfirm: () => Promise<void> | void
  successMessage?: string
  errorMessage?: string
  refreshOnSuccess?: boolean
}

export function Confirm({
  children,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  size = 'default',
  confirmVariant = 'default',
  icon = 'warning',
  className = '',
  disabled = false,
  onConfirm,
  successMessage = 'Action completed successfully',
  errorMessage = 'Action failed',
  refreshOnSuccess = false,
}: ConfirmProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
      if (refreshOnSuccess) {
        router.refresh()
      }
      toast({ title: 'Success', description: successMessage })
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || errorMessage, 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
        disabled={disabled}
      >
        {children}
      </Button>

      <ConfirmationModal
        open={open}
        title={title}
        description={description}
        cancelText={cancelText}
        confirmText={confirmText}
        confirmVariant={confirmVariant}
        icon={icon}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        isLoading={loading}
      />
    </>
  )
}

// Hook for programmatic confirmation
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    description: string
    confirmText: string
    cancelText: string
    confirmVariant: 'default' | 'destructive'
    icon: 'warning' | 'info' | 'success' | 'error'
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'default',
    icon: 'warning',
    onConfirm: () => {},
  })

  const confirm = (options: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    confirmVariant?: 'default' | 'destructive'
    icon?: 'warning' | 'info' | 'success' | 'error'
  }) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmVariant: options.confirmVariant || 'default',
        icon: options.icon || 'warning',
        onConfirm: () => {
          setState(prev => ({ ...prev, open: false }))
          resolve(true)
        },
      })
    })
  }

  const ConfirmDialog = () => (
    <ConfirmationModal
      open={state.open}
      title={state.title}
      description={state.description}
      cancelText={state.cancelText}
      confirmText={state.confirmText}
      confirmVariant={state.confirmVariant}
      icon={state.icon}
      onCancel={() => setState(prev => ({ ...prev, open: false }))}
      onConfirm={state.onConfirm}
    />
  )

  return { confirm, ConfirmDialog }
}