import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase';

/**
 * API route handler for sharing content to the community.
 * Expects:
 * - type: "image" | "text"
 * - title: string
 * - prompt: string
 * - content: string (base64 for images, text content for text)
 * - username: string (optional)
 */
export async function POST(req) {
  try {
    const body = await req.json();

    // Destructure with let for content
    const { type, title, prompt, username = 'anonymous_user' } = body;
    let { content } = body;

    if (!type || !prompt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this creation
    const id = uuidv4();

    // Handle image uploads (store in Supabase Storage)
    let storagePath = null;
    if (type === 'image') {
      // For base64 images, we need to convert to a file first
      if (content.startsWith('data:')) {
        const contentType = content.split(';')[0].split(':')[1];
        const base64Data = content.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        // Store in Supabase storage
        const filename = `${id}.${contentType.split('/')[1] || 'png'}`;
        const path = `creations/${filename}`;

        const { data, error } = await supabase.storage
          .from('creations')
          .upload(path, buffer, {
            contentType,
            upsert: false,
          });

        if (error) {
          console.error('Storage error:', error);
          return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
          );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('creations')
          .getPublicUrl(path);

        storagePath = path;
        content = urlData.publicUrl; // Replace base64 with URL for storage
      }
    }

    // Store creation metadata in database
    const { data, error } = await supabase
      .from('creations')
      .insert({
        id,
        type,
        title,
        prompt,
        content,
        storage_path: storagePath,
        username,
        user_id: 'anon-' + id.substring(0, 8), // For now, use a random ID
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: 'Failed to share content' },
      { status: 500 }
    );
  }
}
