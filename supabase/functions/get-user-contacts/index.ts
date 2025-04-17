
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

    // Logging request parameters
    console.log(`Fetching contacts for userId: ${userId}, userRole: ${userRole}`);
    
    let data: { id: string, name: string }[] = [];

    // Get contacts based on user role
    if (userRole === 'borrower') {
      // Borrowers can message lenders
      console.log("Fetching all lenders for borrower");
      
      const { data: lenders, error: lendersError } = await supabaseClient
        .from('profiles')
        .select('id, name')
        .eq('role', 'lender');
        
      if (lendersError) {
        console.error("Error in lenders query:", lendersError);
        throw lendersError;
      }
      
      data = lenders || [];
      console.log(`Found ${data.length} lenders`);
    } else if (userRole === 'lender') {
      // Lenders can message borrowers
      console.log("Fetching all borrowers for lender");
      
      const { data: borrowers, error: borrowersError } = await supabaseClient
        .from('profiles')
        .select('id, name')
        .eq('role', 'borrower');
        
      if (borrowersError) {
        console.error("Error in borrowers query:", borrowersError);
        throw borrowersError;
      }
      
      data = borrowers || [];
      console.log(`Found ${data.length} borrowers`);
    } else {
      // Fallback to all users for any other roles
      console.log("Using fallback method to get all users except current user");
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('id, name')
        .neq('id', userId);
        
      if (profilesError) {
        console.error("Error fetching all profiles:", profilesError);
        throw profilesError;
      }
        
      data = profiles || [];
      console.log(`Found ${data.length} general contacts`);
    }
    
    // If no contacts found, return empty array
    if (!data || data.length === 0) {
      console.log("No contacts found, returning empty array");
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    console.log("Returning contacts:", data);
    
    return new Response(JSON.stringify(data), {
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
