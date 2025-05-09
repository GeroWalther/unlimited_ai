import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase';

/**
 * API route handler for liking/unliking content.
 * Expects:
 * - creation_id: UUID of the creation to like/unlike
 * - user_id: (Optional) Client-side generated persistent user ID
 *
 * Returns:
 * - success: true if operation succeeded
 * - liked: boolean indicating if the item is now liked (true) or unliked (false)
 * - id: ID of the like record (if liked)
 */
export async function POST(req) {
  try {
    const { creation_id, user_id: clientUserId } = await req.json();

    if (!creation_id) {
      return NextResponse.json(
        { error: 'Missing creation_id' },
        { status: 400 }
      );
    }

    // Use client-provided ID if available, otherwise generate from request headers
    let userId;
    if (clientUserId && clientUserId.startsWith('anon-')) {
      // Use the client-provided ID if it has the expected format
      userId = clientUserId;
    } else {
      // Generate a simple user ID based on a hash of the request info
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      userId = `anon-${Buffer.from(ip + userAgent)
        .toString('base64')
        .substring(0, 12)}`;
    }

    // Check if user has already liked this creation
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('creation_id', creation_id)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "No rows returned" which is expected
      console.error('Like check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing like' },
        { status: 500 }
      );
    }

    // If already liked, remove the like (unlike)
    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Unlike error:', deleteError);
        return NextResponse.json(
          { error: 'Failed to unlike content' },
          { status: 500 }
        );
      }

      // Get the updated like count
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('creation_id', creation_id);

      if (countError) {
        console.error('Count error:', countError);
      }

      return NextResponse.json({
        success: true,
        liked: false,
        message: 'Content unliked',
        count: count || 0,
      });
    }

    // Add new like
    const { data, error } = await supabase
      .from('likes')
      .insert({
        creation_id,
        user_id: userId,
      })
      .select();

    if (error) {
      console.error('Like error:', error);
      return NextResponse.json(
        { error: 'Failed to like content' },
        { status: 500 }
      );
    }

    // Get the updated like count
    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('creation_id', creation_id);

    if (countError) {
      console.error('Count error:', countError);
    }

    return NextResponse.json({
      success: true,
      liked: true,
      id: data[0].id,
      count: count || 1,
    });
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json(
      { error: 'Failed to like content' },
      { status: 500 }
    );
  }
}
