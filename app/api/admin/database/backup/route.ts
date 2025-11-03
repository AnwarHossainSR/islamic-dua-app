import { checkPermission } from '@/lib/actions/auth';
import { PERMISSIONS } from '@/lib/permissions/constants';
import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import { promisify } from 'util';

const execAsync = promisify(exec);
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
    await checkPermission(PERMISSIONS.SETTINGS_MANAGE);

    const dbUrl = process.env.DATABASE_URL; // Your Supabase connection string
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `backup-${timestamp}.sql`;

    // Execute pg_dump
    const { stdout, stderr } = await execAsync(
      `pg_dump "${dbUrl}" --clean --if-exists --no-owner --no-acl -f ${filename}`
    );

    if (stderr) {
      console.error('pg_dump stderr:', stderr);
    }

    // Read the file and return it
    const fs = require('fs').promises;
    const fileContent = await fs.readFile(filename);
    await fs.unlink(filename); // Clean up

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Backup failed:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}