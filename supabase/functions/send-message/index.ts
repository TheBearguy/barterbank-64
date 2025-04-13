
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { senderId, recipientId, subject, content, replyToId } = await req.json();
    
    // Validate required parameters
    if (!senderId || !recipientId || !subject || !content) {
      console.error("Missing required parameters:", { senderId, recipientId, subject });
      throw new Error("Missing required parameters");
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

    console.log("Attempting to send message from", senderId, "to", recipientId);

    // Insert directly into the messages table using RPC
    const { data, error } = await supabaseClient.rpc('send_message', {
      p_sender_id: senderId,
      p_recipient_id: recipientId,
      p_subject: subject,
      p_content: content,
      p_reply_to: replyToId || null
    });

    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }

    console.log("Message sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-message function:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
