# Admin User Setup Guide

## Creating Your First Admin User

Since the app uses Supabase authentication, you need to follow these steps to create an admin user:

### Step 1: Sign Up Through the App

1. Go to your app's signup page: `/signup`
2. Create an account with your admin email:
   - **Email**: `mahedianwar@gmail.com`
   - **Password**: `S2vMzy%%QaEW74p3!2fZwjGH2`
3. Check your email inbox for the confirmation link
4. Click the confirmation link to verify your email

### Step 2: Promote to Admin

After confirming your email, run the SQL script to promote yourself to super admin:

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Run the script: `scripts/03-create-admin-user.sql`

This will add your user to the `admin_users` table with `super_admin` role.

### Step 3: Access Admin Panel

1. Log in to the app with your credentials
2. Navigate to: `/admin`
3. You now have full admin access!

---

## Admin Roles

- **super_admin**: Full access to all admin features including user management
- **admin**: Can manage content (duas, categories, tags) but not other admins

---

## Promoting Additional Admins

To promote other users to admin:

1. Have them sign up through the app first
2. Modify the SQL script with their email
3. Run the script to promote them

\`\`\`sql
INSERT INTO admin_users (user_id, email, role, is_active)
SELECT
id,
email,
'admin', -- or 'super_admin'
true
FROM auth.users
WHERE email = 'new-admin@example.com'
ON CONFLICT (user_id)
DO UPDATE SET
role = 'admin',
is_active = true,
updated_at = now();
\`\`\`

---

## Troubleshooting

**"Email not confirmed" error when logging in:**

- Check your email inbox for the confirmation link
- Check spam/junk folder
- In Supabase Dashboard → Authentication → Settings, you can disable email confirmation for development (not recommended for production)

**Can't access admin panel:**

- Verify you ran the `04-create-admin-user.sql` script
- Check if your user exists in `admin_users` table
- Ensure `is_active` is `true` and `role` is set correctly
