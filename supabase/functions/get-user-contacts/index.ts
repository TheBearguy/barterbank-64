
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
      
      try {
        // Try using RPC function first
        const { data: lenders, error: rpcError } = await supabaseClient
          .rpc('get_all_lenders');
          
        if (rpcError) {
          console.error("RPC error in lenders query:", rpcError);
          // Fall back to direct query
          const { data: directLenders, error: directError } = await supabaseClient
            .from('profiles')
            .select('id, name')
            .eq('role', 'lender');
            
          if (directError) {
            console.error("Direct query error in lenders query:", directError);
            throw directError;
          }
          
          data = directLenders || [];
        } else {
          data = lenders || [];
        }
      } catch (error) {
        console.error("Error fetching lenders:", error);
        throw error;
      }
      
      console.log(`Found ${data.length} lenders`);
    } else if (userRole === 'lender') {
      // Lenders can message borrowers
      console.log("Fetching all borrowers for lender");
      
      try {
        // Try using RPC function first
        const { data: borrowers, error: rpcError } = await supabaseClient
          .rpc('get_all_borrowers');
          
        if (rpcError) {
          console.error("RPC error in borrowers query:", rpcError);
          // Fall back to direct query
          const { data: directBorrowers, error: directError } = await supabaseClient
            .from('profiles')
            .select('id, name')
            .eq('role', 'borrower');
            
          if (directError) {
            console.error("Direct query error in borrowers query:", directError);
            throw directError;
          }
          
          data = directBorrowers || [];
        } else {
          data = borrowers || [];
        }
      } catch (error) {
        console.error("Error fetching borrowers:", error);
        throw error;
      }
      
      console.log(`Found ${data.length} borrowers`);
    } else {
      // Fallback to all users for any other roles
      console.log("Using fallback method to get all users except current user");
      
      try {
        // Try using RPC function first
        const { data: allUsers, error: rpcError } = await supabaseClient
          .rpc('get_all_users_except', { exclude_id: userId });
          
        if (rpcError) {
          console.error("RPC error in all users query:", rpcError);
          // Fall back to direct query
          const { data: directUsers, error: directError } = await supabaseClient
            .from('profiles')
            .select('id, name')
            .neq('id', userId);
            
          if (directError) {
            console.error("Direct query error in all users query:", directError);
            throw directError;
          }
          
          data = directUsers || [];
        } else {
          data = allUsers || [];
        }
      } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
      }
      
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
    // Return empty array on error with error message in the body for debugging
    return new Response(JSON.stringify({ 
      error: error.message,
      source: "get-user-contacts edge function" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
