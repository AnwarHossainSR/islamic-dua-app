import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabase } from '@/lib/supabase/client';

export const settingsApi = {
  async getAll(category?: string) {
    let query = supabase.from('app_settings').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async update(key: string, value: any) {
    const { error } = await supabase
      .from('app_settings')
      .update({ value: JSON.stringify(value) })
      .eq('key', key);
    if (error) throw error;
  },

  async getDbStats() {
    const [duas, challenges, progress, admins] = await Promise.all([
      supabase.from('duas').select('*', { count: 'exact', head: true }),
      supabase.from('challenge_templates').select('*', { count: 'exact', head: true }),
      supabase.from('user_challenge_progress').select('*', { count: 'exact', head: true }),
      supabase.from('admin_users').select('*', { count: 'exact', head: true }),
    ]);

    const totalRecords =
      (duas.count || 0) + (challenges.count || 0) + (progress.count || 0) + (admins.count || 0);

    return {
      totalRecords,
      duasCount: duas.count || 0,
      challengesCount: challenges.count || 0,
      activeUsers: progress.count || 0,
      adminsCount: admins.count || 0,
      dbSize: 'N/A',
    };
  },

  async getBackups() {
    const { data, error } = await supabaseAdmin.storage.from('backups').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) throw error;
    return (
      data?.map((file) => ({
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
      })) || []
    );
  },

  async createBackup(storeInSupabase: boolean) {
    const tables = [
      'permissions',
      'user_roles',
      'admin_users',
      'app_settings',
      'user_settings',
      'dua_categories',
      'duas',
      'activity_stats',
      'challenge_templates',
      'role_permissions',
      'user_activity_stats',
      'challenge_activity_mapping',
      'user_challenge_progress',
      'user_challenge_daily_logs',
      'user_missed_challenges',
      'notifications',
      'api_logs',
    ];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `islamic-dua-app-backup-${timestamp}.sql`;

    let backupContent = `-- Islamic Dua App Database Backup\n`;
    backupContent += `-- Generated on: ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      if (error || !data || data.length === 0) continue;

      const columns = Object.keys(data[0]);
      backupContent += `\n-- Data for table ${table}\n`;
      backupContent += `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES\n`;

      const values = data
        .map((row: any) => {
          const rowValues = columns
            .map((col) => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'boolean') return val ? 'true' : 'false';
              return `'${String(val)}'`;
            })
            .join(', ');
          return `  (${rowValues})`;
        })
        .join(',\n');

      backupContent += `${values};\n`;
    }

    if (storeInSupabase) {
      const { error } = await supabaseAdmin.storage
        .from('backups')
        .upload(filename, backupContent, {
          contentType: 'application/sql',
          upsert: false,
        });
      if (error) throw error;
      return { success: true, filename };
    } else {
      return new Blob([backupContent], { type: 'application/sql' });
    }
  },

  async downloadBackup(filename: string) {
    const { data, error } = await supabaseAdmin.storage.from('backups').download(filename);
    if (error) throw error;
    return data;
  },

  async deleteBackup(filename: string) {
    const { error } = await supabaseAdmin.storage.from('backups').remove([filename]);
    if (error) throw error;
    return { success: true };
  },

  async optimizeDatabase() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true };
  },

  async getCredentials() {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async deleteCredential(credentialId: string) {
    const { error } = await supabase
      .from('webauthn_credentials')
      .delete()
      .eq('credential_id', credentialId);
    if (error) throw error;
    return { success: true };
  },
};
