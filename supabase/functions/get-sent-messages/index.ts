
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    console.log("Getting sent messages for userId:", userId);
    
    if (!userId) {
      throw new Error("userId is required");
    }
    
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Try direct query approach first instead of RPC
    console.log("Fetching sent messages with direct query");
    const { data: messagesData, error: queryError } = await supabaseClient
      .from('messages')
      .select(`
        id, 
        sender_id,
        recipient_id,
        recipient:profiles!recipient_id(name),
        subject,
        content,
        created_at,
        read,
        reply_to
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });
    
    if (queryError) {
      console.error("Direct query error:", queryError);
      throw queryError;
    }
    
    if (messagesData && messagesData.length > 0) {
      console.log(`Found ${messagesData.length} sent messages via direct query`);
      
      // Format the data to match the expected structure
      const formattedData = messagesData.map(message => ({
        id: message.id,
        sender_id: message.sender_id,
        recipient_id: message.recipient_id,
        recipient_name: message.recipient?.name || "Unknown User",
        subject: message.subject,
        content: message.content,
        created_at: message.created_at,
        read: message.read,
        reply_to: message.reply_to
      }));
      
      return new Response(JSON.stringify(formattedData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // If direct query returns no results, try the RPC as fallback
    console.log("Direct query returned no results, trying RPC");
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc('get_sent_messages', {
      user_id: userId
    });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      throw rpcError;
    }

    if (rpcData && rpcData.length > 0) {
      console.log(`Found ${rpcData.length} sent messages via RPC`);
      return new Response(JSON.stringify(rpcData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    console.log("No sent messages found");
    // Return empty array if no messages found
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error.message);
    // Return empty array on error
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
