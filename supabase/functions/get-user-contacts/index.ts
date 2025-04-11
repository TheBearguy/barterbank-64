
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
    const { userId, userRole } = await req.json();
    
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

    let data;
    let error;

    // Log the request parameters to help diagnose issues
    console.log(`Fetching contacts for userId: ${userId}, userRole: ${userRole}`);

    // Based on the user role, fetch either all lenders (for borrowers) or all borrowers (for lenders)
    if (userRole === 'borrower') {
      // Get all lenders
      const result = await supabaseClient
        .from('profiles')
        .select('id, name')
        .eq('role', 'lender');
      
      data = result.data;
      error = result.error;
      
      console.log(`Found ${data?.length || 0} lenders`);
    } else if (userRole === 'lender') {
      // Get all borrowers
      const result = await supabaseClient
        .from('profiles')
        .select('id, name')
        .eq('role', 'borrower');
      
      data = result.data;
      error = result.error;
      
      console.log(`Found ${data?.length || 0} borrowers`);
    } else {
      // Fallback: use the original stored function
      const result = await supabaseClient.rpc('get_user_contacts', {
        user_id: userId
      });
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }

    // Return empty array instead of null if no contacts found
    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
