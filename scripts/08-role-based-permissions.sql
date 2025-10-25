-- ============================================
-- ROLE-BASED PERMISSION SYSTEM
-- ============================================

-- Create roles enum
CREATE TYPE user_role AS ENUM ('user', 'editor', 'super_admin');

-- Update admin_users table to include role
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Update existing admin users to super_admin
UPDATE admin_users SET role = 'super_admin' WHERE is_active = true;

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL, -- challenges, duas, users, settings, logs
  action TEXT NOT NULL,   -- create, read, update, delete, manage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Insert base permissions
INSERT INTO permissions (name, description, resource, action) VALUES
-- Challenges
('challenges.create', 'Create new challenges', 'challenges', 'create'),
('challenges.read', 'View challenges', 'challenges', 'read'),
('challenges.update', 'Edit challenges', 'challenges', 'update'),
('challenges.delete', 'Delete challenges', 'challenges', 'delete'),
('challenges.manage', 'Full challenge management', 'challenges', 'manage'),

-- Duas
('duas.create', 'Create new duas', 'duas', 'create'),
('duas.read', 'View duas', 'duas', 'read'),
('duas.update', 'Edit duas', 'duas', 'update'),
('duas.delete', 'Delete duas', 'duas', 'delete'),
('duas.manage', 'Full duas management', 'duas', 'manage'),

-- Users
('users.read', 'View users', 'users', 'read'),
('users.update', 'Edit users', 'users', 'update'),
('users.delete', 'Delete users', 'users', 'delete'),
('users.manage', 'Full user management', 'users', 'manage'),

-- Settings
('settings.read', 'View settings', 'settings', 'read'),
('settings.update', 'Edit settings', 'settings', 'update'),
('settings.manage', 'Full settings management', 'settings', 'manage'),

-- Logs
('logs.read', 'View logs', 'logs', 'read'),
('logs.delete', 'Delete logs', 'logs', 'delete'),
('logs.manage', 'Full logs management', 'logs', 'manage'),

-- Activities
('activities.read', 'View activities', 'activities', 'read'),
('activities.manage', 'Manage activities', 'activities', 'manage'),

-- Dashboard
('dashboard.read', 'View dashboard', 'dashboard', 'read'),
('dashboard.manage', 'Full dashboard access', 'dashboard', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- USER role (basic access)
INSERT INTO role_permissions (role, permission_id) 
SELECT 'user', id FROM permissions WHERE name IN (
  'challenges.read',
  'duas.read',
  'dashboard.read'
) ON CONFLICT DO NOTHING;

-- EDITOR role (content management)
INSERT INTO role_permissions (role, permission_id) 
SELECT 'editor', id FROM permissions WHERE name IN (
  'challenges.create', 'challenges.read', 'challenges.update', 'challenges.delete',
  'duas.create', 'duas.read', 'duas.update', 'duas.delete',
  'activities.read',
  'dashboard.read',
  'settings.read'
) ON CONFLICT DO NOTHING;

-- SUPER_ADMIN role (full access)
INSERT INTO role_permissions (role, permission_id) 
SELECT 'super_admin', id FROM permissions ON CONFLICT DO NOTHING;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Get user role
  SELECT au.role INTO user_role
  FROM admin_users au
  WHERE au.user_id = $1 AND au.is_active = true;
  
  -- If no role found, return false
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if role has permission
  RETURN EXISTS (
    SELECT 1 
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role = user_role AND p.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT au.role INTO user_role
  FROM admin_users au
  WHERE au.user_id = $1 AND au.is_active = true;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use role-based permissions
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can manage activity stats" ON activity_stats;
DROP POLICY IF EXISTS "Admins can manage challenge activity mapping" ON challenge_activity_mapping;

-- Create new role-based policies
CREATE POLICY "Role-based activity stats access" ON activity_stats
  FOR ALL USING (
    user_has_permission(auth.uid(), 'activities.manage') OR
    user_has_permission(auth.uid(), 'activities.read')
  );

CREATE POLICY "Role-based challenge mapping access" ON challenge_activity_mapping
  FOR ALL USING (
    user_has_permission(auth.uid(), 'challenges.manage') OR
    user_has_permission(auth.uid(), 'challenges.read')
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);

-- Create view for user permissions
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
  au.user_id,
  au.role,
  p.name as permission_name,
  p.resource,
  p.action,
  p.description
FROM admin_users au
JOIN role_permissions rp ON rp.role = au.role::user_role
JOIN permissions p ON p.id = rp.permission_id
WHERE au.is_active = true;