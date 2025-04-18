import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Create likes table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
        artwork_id UUID REFERENCES artworks ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        UNIQUE(user_id, artwork_id)
      );

      -- Add RLS policies for likes
      ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing likes (public)
      CREATE POLICY IF NOT EXISTS "Likes are viewable by everyone" 
      ON likes FOR SELECT 
      USING (true);

      -- Policy for inserting likes (authenticated users only)
      CREATE POLICY IF NOT EXISTS "Users can insert their own likes" 
      ON likes FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = user_id);

      -- Policy for deleting likes (owner only)
      CREATE POLICY IF NOT EXISTS "Users can delete their own likes" 
      ON likes FOR DELETE 
      TO authenticated 
      USING (auth.uid() = user_id);
    `)

    // Create comments table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
        artwork_id UUID REFERENCES artworks ON DELETE CASCADE NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
      );

      -- Add RLS policies for comments
      ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing comments (public)
      CREATE POLICY IF NOT EXISTS "Comments are viewable by everyone" 
      ON comments FOR SELECT 
      USING (true);

      -- Policy for inserting comments (authenticated users only)
      CREATE POLICY IF NOT EXISTS "Users can insert their own comments" 
      ON comments FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = user_id);

      -- Policy for updating comments (owner only)
      CREATE POLICY IF NOT EXISTS "Users can update their own comments" 
      ON comments FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = user_id);

      -- Policy for deleting comments (owner only)
      CREATE POLICY IF NOT EXISTS "Users can delete their own comments" 
      ON comments FOR DELETE 
      TO authenticated 
      USING (auth.uid() = user_id);
    `)

    // Create conversations table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
      );

      -- Add RLS policies for conversations
      ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
    `)

    // Create conversation participants table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        conversation_id UUID REFERENCES conversations ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        UNIQUE(conversation_id, user_id)
      );

      -- Add RLS policies for conversation participants
      ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing conversation participants (participants only)
      CREATE POLICY IF NOT EXISTS "Users can view conversations they are part of" 
      ON conversation_participants FOR SELECT 
      USING (user_id = auth.uid());

      -- Policy for inserting conversation participants
      CREATE POLICY IF NOT EXISTS "Users can add themselves to conversations" 
      ON conversation_participants FOR INSERT 
      TO authenticated 
      WITH CHECK (user_id = auth.uid());
    `)

    // Create messages table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        conversation_id UUID REFERENCES conversations ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
      );

      -- Add RLS policies for messages
      ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing messages (participants only)
      CREATE POLICY IF NOT EXISTS "Users can view messages in their conversations" 
      ON messages FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_participants.conversation_id = messages.conversation_id
          AND conversation_participants.user_id = auth.uid()
        )
      );

      -- Policy for inserting messages (participants only)
      CREATE POLICY IF NOT EXISTS "Users can insert messages in their conversations" 
      ON messages FOR INSERT 
      TO authenticated 
      WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_participants.conversation_id = messages.conversation_id
          AND conversation_participants.user_id = auth.uid()
        )
      );
    `)

    // Create open_calls table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS open_calls (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        organization_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        location TEXT,
        requirements TEXT,
        eligibility TEXT,
        fees TEXT,
        prizes TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
      );

      -- Add RLS policies for open_calls
      ALTER TABLE open_calls ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing open calls (public)
      CREATE POLICY IF NOT EXISTS "Open calls are viewable by everyone" 
      ON open_calls FOR SELECT 
      USING (true);

      -- Policy for inserting open calls (authenticated users only)
      CREATE POLICY IF NOT EXISTS "Users can insert their own open calls" 
      ON open_calls FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = organization_id);

      -- Policy for updating open calls (owner only)
      CREATE POLICY IF NOT EXISTS "Users can update their own open calls" 
      ON open_calls FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = organization_id);

      -- Policy for deleting open calls (owner only)
      CREATE POLICY IF NOT EXISTS "Users can delete their own open calls" 
      ON open_calls FOR DELETE 
      TO authenticated 
      USING (auth.uid() = organization_id);
    `)

    // Create open_call_submissions table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS open_call_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        open_call_id UUID REFERENCES open_calls(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
        statement TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        UNIQUE(open_call_id, user_id)
      );

      -- Add RLS policies for open_call_submissions
      ALTER TABLE open_call_submissions ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing submissions (owner and organization only)
      CREATE POLICY IF NOT EXISTS "Users can view their own submissions" 
      ON open_call_submissions FOR SELECT 
      USING (
        auth.uid() = user_id OR 
        EXISTS (
          SELECT 1 FROM open_calls
          WHERE open_calls.id = open_call_submissions.open_call_id
          AND open_calls.organization_id = auth.uid()
        )
      );

      -- Policy for inserting submissions (authenticated users only)
      CREATE POLICY IF NOT EXISTS "Users can insert their own submissions" 
      ON open_call_submissions FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = user_id);

      -- Policy for updating submissions (owner only)
      CREATE POLICY IF NOT EXISTS "Users can update their own submissions" 
      ON open_call_submissions FOR UPDATE 
      TO authenticated 
      USING (
        auth.uid() = user_id OR
        EXISTS (
          SELECT 1 FROM open_calls
          WHERE open_calls.id = open_call_submissions.open_call_id
          AND open_calls.organization_id = auth.uid()
        )
      );
    `)

    // Add admin role to profiles table
    await supabase.query(`
      -- Add is_admin column to profiles if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' AND column_name = 'is_admin'
        ) THEN
          ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `)

    // Create reports table for admin moderation
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        reported_type TEXT NOT NULL CHECK (reported_type IN ('artwork', 'profile', 'comment', 'open_call')),
        reported_id UUID NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
      );

      -- Add RLS policies for reports
      ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing reports (admin only)
      CREATE POLICY IF NOT EXISTS "Admins can view all reports" 
      ON reports FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );

      -- Policy for inserting reports (authenticated users only)
      CREATE POLICY IF NOT EXISTS "Users can insert reports" 
      ON reports FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = reporter_id);

      -- Policy for updating reports (admin only)
      CREATE POLICY IF NOT EXISTS "Admins can update reports" 
      ON reports FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
    `)

    // Create collections table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
      );

      -- Add RLS policies for collections
      ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing collections (public or owner)
      CREATE POLICY IF NOT EXISTS "Public collections are viewable by everyone" 
      ON collections FOR SELECT 
      USING (is_public OR auth.uid() = user_id);

      -- Policy for inserting collections (authenticated users only)
      CREATE POLICY IF NOT EXISTS "Users can insert their own collections" 
      ON collections FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = user_id);

      -- Policy for updating collections (owner only)
      CREATE POLICY IF NOT EXISTS "Users can update their own collections" 
      ON collections FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = user_id);

      -- Policy for deleting collections (owner only)
      CREATE POLICY IF NOT EXISTS "Users can delete their own collections" 
      ON collections FOR DELETE 
      TO authenticated 
      USING (auth.uid() = user_id);
    `)

    // Create collection_items table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS collection_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
        artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        UNIQUE(collection_id, artwork_id)
      );

      -- Add RLS policies for collection_items
      ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

      -- Policy for viewing collection items (public collections or owner)
      CREATE POLICY IF NOT EXISTS "Collection items are viewable if collection is public or owned" 
      ON collection_items FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM collections
          WHERE collections.id = collection_items.collection_id
          AND (collections.is_public OR collections.user_id = auth.uid())
        )
      );

      -- Policy for inserting collection items (owner only)
      CREATE POLICY IF NOT EXISTS "Users can insert items to their own collections" 
      ON collection_items FOR INSERT 
      TO authenticated 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM collections
          WHERE collections.id = collection_items.collection_id
          AND collections.user_id = auth.uid()
        )
      );

      -- Policy for deleting collection items (owner only)
      CREATE POLICY IF NOT EXISTS "Users can delete items from their own collections" 
      ON collection_items FOR DELETE 
      TO authenticated 
      USING (
        EXISTS (
          SELECT 1 FROM collections
          WHERE collections.id = collection_items.collection_id
          AND collections.user_id = auth.uid()
        )
      );
    `)

    // Add view counts to artworks
    await supabase.query(`
      -- Add view_count column to artworks if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'artworks' AND column_name = 'view_count'
        ) THEN
          ALTER TABLE artworks ADD COLUMN view_count INTEGER DEFAULT 0;
        END IF;
      END $$;
    `)

    return NextResponse.json({ success: true, message: "Tables created successfully" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
