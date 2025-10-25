'use client'

import { Confirm } from '@/components/ui/confirm'

interface ActionButtonProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive'
  icon?: 'warning' | 'info' | 'success' | 'error'
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  action: (...args: any[]) => Promise<void>
  actionParams?: any[]
  refreshOnSuccess?: boolean
  successMessage?: string
  errorMessage?: string
  children: React.ReactNode
}

export function ActionButton({
  children,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  icon = 'warning',
  variant = 'ghost',
  size = 'sm',
  className = '',
  action,
  actionParams = [],
  refreshOnSuccess = true,
  successMessage = 'Action completed successfully',
  errorMessage = 'Action failed',
}: ActionButtonProps) {
  const handleConfirm = async () => {
    await action(...actionParams)
  }

  return (
    <Confirm
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmVariant={confirmVariant}
      icon={icon}
      variant={variant}
      size={size}
      className={className}
      onConfirm={handleConfirm}
      refreshOnSuccess={refreshOnSuccess}
      successMessage={successMessage}
      errorMessage={errorMessage}
    >
      {children}
    </Confirm>
  )
}
