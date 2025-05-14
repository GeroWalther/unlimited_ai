import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * API route handler for fetching all creations for admin purposes.
 * Supports pagination.
 */
export async function GET(req) {
  try {
    // Get URL params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query all creations
    const { data, error, count } = await supabase
      .from('creations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch creations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: data,
      page,
      pageSize,
      total: count,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creations' },
      { status: 500 }
    );
  }
}
