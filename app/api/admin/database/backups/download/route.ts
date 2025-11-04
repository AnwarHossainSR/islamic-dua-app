import { checkPermission } from '@/lib/actions/auth';
import { PERMISSIONS } from '@/lib/permissions/constants';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await checkPermission(PERMISSIONS.SETTINGS_MANAGE);

    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.storage
      .from('backups')
      .download(filename);

    if (error) {
      console.error('Failed to download backup:', error);
      return NextResponse.json({ error: 'Failed to download backup' }, { status: 500 });
    }

    const fileContent = await data.text();

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Failed to download backup:', error);
    return NextResponse.json({ error: 'Failed to download backup' }, { status: 500 });
  }
}