import { checkPermission } from '@/lib/actions/auth';
import { PERMISSIONS } from '@/lib/permissions/constants';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await checkPermission(PERMISSIONS.SETTINGS_MANAGE);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: files, error } = await supabase.storage
      .from('backups')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Failed to list backups:', error);
      return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
    }

    const backups = files?.map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      created_at: file.created_at,
      updated_at: file.updated_at
    })) || [];

    return NextResponse.json({ backups });
  } catch (error: any) {
    console.error('Failed to list backups:', error);
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await checkPermission(PERMISSIONS.SETTINGS_MANAGE);

    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.storage
      .from('backups')
      .remove([filename]);

    if (error) {
      console.error('Failed to delete backup:', error);
      return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete backup:', error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}