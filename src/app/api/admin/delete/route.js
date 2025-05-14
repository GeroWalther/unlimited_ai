import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * API route handler for deleting content from the database and storage.
 * Expects:
 * - id: UUID of the creation to delete
 */
export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing creation id' },
        { status: 400 }
      );
    }

    // First, get the item to find its storage_path
    const { data: item, error: fetchError } = await supabase
      .from('creations')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch item' },
        { status: 500 }
      );
    }

    // If there's a storage path, delete from storage
    if (item?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('creations')
        .remove([item.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway, as we want to delete the database entry
      }
    }

    // Delete any likes associated with this creation
    await supabase.from('likes').delete().eq('creation_id', id);

    // Delete the creation from the database
    const { error: deleteError } = await supabase
      .from('creations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
