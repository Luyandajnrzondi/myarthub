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

    return NextResponse.json({ success: true, message: "Tables created successfully" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
