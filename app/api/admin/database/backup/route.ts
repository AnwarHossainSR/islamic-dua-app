import { checkPermission } from '@/lib/actions/auth'
import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to export table data
async function exportTableData(supabase: any, tableName: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true, nullsFirst: false })
    
    if (error) {
      return `-- Error backing up table ${tableName}: ${error.message}\n\n`
    }

    if (!data || data.length === 0) {
      return `-- Table ${tableName} is empty\n\n`
    }

    let tableSQL = `--\n-- Data for table ${tableName}\n--\n\n`
    
    const columns = Object.keys(data[0])
    const columnsList = columns.map(col => `"${col}"`).join(', ')
    
    tableSQL += `-- Dumping data for table ${tableName}\n`
    tableSQL += `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;\n\n`
    
    // Batch insert statements
    const batchSize = 100
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      
      tableSQL += `INSERT INTO "${tableName}" (${columnsList}) VALUES\n`
      
      const values = batch.map((row:any) => {
        const rowValues = columns.map(col => {
          const value = row[col]
          if (value === null) return 'NULL'
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`
          }
          if (typeof value === 'boolean') return value ? 'true' : 'false'
          if (value instanceof Date) return `'${value.toISOString()}'`
          if (Array.isArray(value)) return `'{${value.map(v => `"${v}"`).join(',')}}'`
          return `'${value}'`
        }).join(', ')
        return `  (${rowValues})`
      }).join(',\n')
      
      tableSQL += values + ';\n\n'
    }
    
    return tableSQL
  } catch (tableError) {
    return `-- Exception backing up table ${tableName}: ${tableError}\n\n`
  }
}

export async function POST() {
  try {
    await checkPermission(PERMISSIONS.SETTINGS_MANAGE)
    
    const supabase = await getSupabaseServerClient()
    
    // Generate SQL dump header
    let sqlDump = `-- Islamic Dua App Database Backup
-- Generated on: ${new Date().toISOString()}
-- PostgreSQL Database Dump

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`

    // Export all tables
    const tables = [
      'challenge_templates', 'user_challenge_progress', 'user_challenge_daily_logs',
      'user_challenge_bookmarks', 'activity_stats', 'user_activity_stats',
      'challenge_activity_mapping', 'user_roles', 'permissions', 'role_permissions',
      'admin_users', 'duas', 'dua_categories', 'app_settings', 'user_settings',
      'notifications', 'api_logs', 'user_preferences', 'challenge_achievements', 'user_achievements'
    ]
    
    for (const tableName of tables) {
      const tableSQL = await exportTableData(supabase, tableName)
      sqlDump += tableSQL
    }

    // Add footer
    sqlDump += `-- Backup completed at ${new Date().toISOString()}\n`
    sqlDump += `-- Total tables processed: ${tables.length}\n`

    const buffer = Buffer.from(sqlDump, 'utf-8')

    apiLogger.info('SQL database backup created successfully', {
      tablesCount: tables.length
    })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="islamic-dua-app-backup-${new Date().toISOString().split('T')[0]}.sql"`,
      },
    })
  } catch (error: any) {
    if (error.message === 'Access denied') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    apiLogger.error('Failed to create backup', { error })
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}