
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

    let data = [];
    let error = null;

    // Logging request parameters
    console.log(`Fetching contacts for userId: ${userId}, userRole: ${userRole}`);

    // Get contacts based on user role
    if (userRole === 'borrower') {
      // Borrowers can message lenders
      console.log("Fetching all lenders for borrower");
      const { data: lenders, error: lendersError } = await supabaseClient.rpc('get_all_lenders');
      data = lenders || [];
      error = lendersError;
      console.log(`Found ${data.length} lenders`);
    } else if (userRole === 'lender') {
      // Lenders can message borrowers
      console.log("Fetching all borrowers for lender");
      const { data: borrowers, error: borrowersError } = await supabaseClient.rpc('get_all_borrowers');
      data = borrowers || [];
      error = borrowersError;
      console.log(`Found ${data.length} borrowers`);
    } else {
      // Fallback to general contacts
      console.log("Using fallback method to get contacts");
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('id, name, role, user_metadata');
        
      if (!profilesError && profiles) {
        // Filter out the current user
        data = profiles
          .filter(profile => profile.id !== userId)
          .map(profile => ({
            id: profile.id,
            name: profile.name || 'Unknown User'
          }));
      } else {
        error = profilesError;
      }
      
      console.log(`Found ${data.length} general contacts`);
    }

    if (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }

    // If still no data, return mock data for testing
    if (!data || data.length === 0) {
      console.log("No contacts found, returning mock data for testing");
      data = [
        { id: "mock-user-1", name: "Test User 1" },
        { id: "mock-user-2", name: "Test User 2" }
      ];
    }
    
    console.log("Returning contacts:", data);
    
    return new Response(JSON.stringify(data), {
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
