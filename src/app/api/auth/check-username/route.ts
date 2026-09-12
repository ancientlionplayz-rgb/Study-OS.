import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (!username || username.length < 3 || username.length > 25) {
      return NextResponse.json(
        { available: false, message: 'Username must be between 3 and 25 alphanumeric or underscore characters.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Database username check error:', error.message);
      }

      if (data) {
        return NextResponse.json({ available: false, message: `The username @${username} is already taken.` });
      }
    }

    return NextResponse.json({ available: true, username });
  } catch (err: any) {
    console.error('Username check route exception:', err);
    return NextResponse.json({ available: true });
  }
}
