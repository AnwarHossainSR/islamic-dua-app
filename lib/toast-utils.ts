import { toast } from '@/hooks/use-toast'

export const toastUtils = {
  success: (message: string, description?: string) => {
    toast({
      title: '✅ Success',
      description: message,
      variant: 'default'
    })
  },

  error: (message: string, description?: string) => {
    toast({
      title: '❌ Error',
      description: message,
      variant: 'destructive'
    })
  },

  warning: (message: string, description?: string) => {
    toast({
      title: '⚠️ Warning',
      description: message,
      variant: 'default'
    })
  },

  info: (message: string, description?: string) => {
    toast({
      title: 'ℹ️ Info',
      description: message,
      variant: 'default'
    })
  },

  loading: (message: string = 'Loading...') => {
    return toast({
      title: '⏳ Loading',
      description: message,
      duration: 0 // Don't auto-dismiss
    })
  },

  promise: async <T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Something went wrong'
    }: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    }
  ) => {
    const loadingToast = toastUtils.loading(loading)

    try {
      const result = await promise
      loadingToast.dismiss?.()
      
      const successMessage = typeof success === 'function' ? success(result) : success
      toastUtils.success(successMessage)
      
      return result
    } catch (err) {
      loadingToast.dismiss?.()
      
      const errorMessage = typeof error === 'function' ? error(err) : error
      toastUtils.error(errorMessage)
      
      throw err
    }
  }
}