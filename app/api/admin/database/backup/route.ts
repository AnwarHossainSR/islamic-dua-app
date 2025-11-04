import { checkPermission } from '@/lib/actions/auth';
import { PERMISSIONS } from '@/lib/permissions/constants';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Table export order (parents first, children last)
const TABLE_EXPORT_ORDER = [
  // Core tables (no dependencies)
  'permissions',
  'user_roles', 
  'admin_users',
  'app_settings',
  'user_settings',
  'user_preferences',
  'dua_categories',
  'duas',
  'activity_stats',
  'challenge_templates',
  'challenge_achievements',
  
  // Tables with foreign keys
  'role_permissions',
  'user_activity_stats',
  'challenge_activity_mapping',
  'user_challenge_progress',
  'user_challenge_bookmarks',
  'user_achievements',
  'user_challenge_daily_logs',
  'notifications',
  'api_logs'
];

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (Array.isArray(value)) return `'{${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(',')}}'`;
  return `'${String(value)}'`;
}

async function exportTableData(supabase: any, tableName: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true, nullsFirst: false });
    
    if (error) {
      console.warn(`Error backing up table ${tableName}:`, error.message);
      return `-- Error backing up table ${tableName}: ${error.message}\n\n`;
    }

    if (!data || data.length === 0) {
      return `-- Table ${tableName} is empty\n\n`;
    }

    let tableSQL = `--\n-- Data for table ${tableName}\n--\n\n`;
    
    const columns = Object.keys(data[0]);
    const columnsList = columns.map(col => `"${col}"`).join(', ');
    
    tableSQL += `-- Dumping data for table ${tableName}\n`;
    
    // Batch insert statements
    const batchSize = 50;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      tableSQL += `INSERT INTO "${tableName}" (${columnsList}) VALUES\n`;
      
      const values = batch.map((row: any) => {
        const rowValues = columns.map(col => formatValue(row[col])).join(', ');
        return `  (${rowValues})`;
      }).join(',\n');
      
      tableSQL += values + ';\n\n';
    }
    
    return tableSQL;
  } catch (tableError) {
    console.error(`Exception backing up table ${tableName}:`, tableError);
    return `-- Exception backing up table ${tableName}: ${tableError}\n\n`;
  }
}

export async function POST(request: Request) {
  try {
    await checkPermission(PERMISSIONS.SETTINGS_MANAGE);

    const { storeInSupabase } = await request.json().catch(() => ({ storeInSupabase: false }));
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `islamic-dua-app-backup-${timestamp}.sql`;

    // Generate backup content
    let backupContent = `-- Islamic Dua App Database Backup\n`;
    backupContent += `-- Generated on: ${new Date().toISOString()}\n`;
    backupContent += `-- Database: Islamic Dua App\n\n`;
    backupContent += `SET statement_timeout = 0;\n`;
    backupContent += `SET lock_timeout = 0;\n`;
    backupContent += `SET client_encoding = 'UTF8';\n\n`;

    // Export tables in dependency order
    for (const tableName of TABLE_EXPORT_ORDER) {
      const tableData = await exportTableData(supabase, tableName);
      backupContent += tableData;
    }

    backupContent += `-- Backup completed at ${new Date().toISOString()}\n`;

    if (storeInSupabase) {
      // Store in Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('backups')
        .upload(filename, backupContent, {
          contentType: 'application/sql',
          upsert: false
        });

      if (uploadError) {
        console.error('Failed to store backup in Supabase:', uploadError);
        return NextResponse.json({ error: 'Failed to store backup' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        filename,
        path: uploadData.path,
        message: 'Backup stored successfully' 
      });
    } else {
      // Return as download
      return new NextResponse(backupContent, {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Backup failed:', error);
    return NextResponse.json({ error: 'Backup failed: ' + error.message }, { status: 500 });
  }
}