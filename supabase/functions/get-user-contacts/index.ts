
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Contact {
  id: string;
  name: string;
}

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
    
    let contacts: Contact[] = [];

    // Get contacts based on user role
    if (userRole === 'borrower') {
      // Borrowers can message lenders
      console.log("Fetching all lenders for borrower");
      
      try {
        // Try using RPC function first
        const { data: lenders, error: rpcError } = await supabaseClient
          .rpc('get_all_lenders');
          
        if (rpcError) {
          console.error("RPC error in lenders query:", rpcError);
          throw rpcError;
        }
        
        if (lenders && Array.isArray(lenders)) {
          contacts = lenders;
          console.log(`Found ${contacts.length} lenders`);
        } else {
          console.warn("No lenders found or invalid response format");
          contacts = [];
        }
      } catch (error) {
        console.error("Error fetching lenders:", error);
        // Instead of re-throwing, we'll return empty array with error in response
        return new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error fetching lenders",
          source: "get-user-contacts edge function" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } else if (userRole === 'lender') {
      // Lenders can message borrowers
      console.log("Fetching all borrowers for lender");
      
      try {
        // Try using RPC function first
        const { data: borrowers, error: rpcError } = await supabaseClient
          .rpc('get_all_borrowers');
          
        if (rpcError) {
          console.error("RPC error in borrowers query:", rpcError);
          throw rpcError;
        }
        
        if (borrowers && Array.isArray(borrowers)) {
          contacts = borrowers;
          console.log(`Found ${contacts.length} borrowers`);
        } else {
          console.warn("No borrowers found or invalid response format");
          contacts = [];
        }
      } catch (error) {
        console.error("Error fetching borrowers:", error);
        // Return empty array with error in response
        return new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error fetching borrowers",
          source: "get-user-contacts edge function" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } else {
      // Fallback to all users for any other roles
      console.log("Using fallback method to get all users except current user");
      
      try {
        // Try using RPC function
        const { data: allUsers, error: rpcError } = await supabaseClient
          .rpc('get_all_users_except', { exclude_id: userId });
          
        if (rpcError) {
          console.error("RPC error in all users query:", rpcError);
          throw rpcError;
        }
        
        if (allUsers && Array.isArray(allUsers)) {
          contacts = allUsers;
          console.log(`Found ${contacts.length} general contacts`);
        } else {
          console.warn("No general contacts found or invalid response format");
          contacts = [];
        }
      } catch (error) {
        console.error("Error fetching all users:", error);
        // Return empty array with error in response
        return new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error fetching all users",
          source: "get-user-contacts edge function" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    // If no contacts found, return empty array
    if (!contacts || contacts.length === 0) {
      console.log("No contacts found, returning empty array");
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    console.log("Returning contacts:", contacts);
    
    return new Response(JSON.stringify(contacts), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error instanceof Error ? error.message : "Unknown error");
    // Return empty array on error with error message in the body for debugging
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      source: "get-user-contacts edge function" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
