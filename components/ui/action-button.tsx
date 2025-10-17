// components/ui/action-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { toast } from '@/hooks/use-toast'
import { LucideIcon, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ActionButtonProps {
  icon?: LucideIcon
  label?: string
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive'
  modalIcon?: 'warning' | 'info' | 'success' | 'error'
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  // Generic action that accepts any parameters
  action: any //(...args: any[]) => Promise<void>
  actionParams?: any[] // Parameters to pass to the action
  refreshOnSuccess?: boolean // Whether to refresh the page after success
}

export function ActionButton({
  icon: Icon = Trash2,
  label,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  modalIcon = 'warning',
  variant = 'ghost',
  size = 'sm',
  className = '',
  action,
  actionParams = [],
  refreshOnSuccess = true,
}: ActionButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await action(...actionParams)
      setOpen(false)
      if (refreshOnSuccess) {
        router.refresh()
      }
      toast({ title: 'Success', description: 'Action completed successfully.' })
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setOpen(true)}
        className={className}
        title={label}
      >
        <Icon className="h-3 w-3" />
        {label && <span className="ml-1">{label}</span>}
      </Button>

      <ConfirmationModal
        open={open}
        title={title}
        description={description}
        cancelText={cancelText}
        confirmText={confirmText}
        confirmVariant={confirmVariant}
        icon={modalIcon}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  )
}
