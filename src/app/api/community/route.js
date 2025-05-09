import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * API route handler for fetching community content.
 * Supports pagination and filtering.
 */
export async function GET(req) {
  try {
    // Get URL params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // Optional filter: 'image' or 'text'
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query from the community_feed view
    let query = supabase
      .from('community_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply type filter if provided
    if (type) {
      query = query.eq('type', type);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch community content' },
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
    console.error('Community API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community content' },
      { status: 500 }
    );
  }
}
