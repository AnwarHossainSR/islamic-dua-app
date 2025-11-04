export interface Permission {
  id: string
  name: string
  description: string | null
  resource?: string
  action?: string
  created_at?: Date | null | string
}

export interface Role {
  role: string
  permissions: Permission[]
}

export interface UserWithPermissions {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  permissions: Permission[]
}