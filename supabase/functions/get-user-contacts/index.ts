
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

    // Logging request parameters
    console.log(`Fetching contacts for userId: ${userId}, userRole: ${userRole}`);

    // Get contacts based on user role
    if (userRole === 'borrower') {
      // Borrowers can message lenders
      console.log("Fetching all lenders for borrower");
      await fetchLendersForBorrower();
    } else if (userRole === 'lender') {
      // Lenders can message borrowers
      console.log("Fetching all borrowers for lender");
      await fetchBorrowersForLender();
    } else {
      // Fallback to the original function
      console.log("Using fallback get_user_contacts RPC function");
      await useFallbackMethod();
    }
    
    // Helper function to fetch lenders for borrower
    async function fetchLendersForBorrower() {
      try {
        // Try profiles table first
        const result = await supabaseClient
          .from('profiles')
          .select('id, name')
          .eq('user_metadata->role', 'lender');
        
        if (result.error || !result.data || result.data.length === 0) {
          console.log("No results with eq query, trying alternative approaches");
          
          // Try other queries if the first one fails
          await tryAlternativeQueries('lender');
        } else {
          data = result.data;
          error = result.error;
        }
      } catch (err) {
        console.error("Error fetching lenders:", err);
        // Try alternative approaches
        await tryAlternativeQueries('lender');
      }
    }
    
    // Helper function to fetch borrowers for lender
    async function fetchBorrowersForLender() {
      try {
        // Try profiles table first
        const result = await supabaseClient
          .from('profiles')
          .select('id, name')
          .eq('user_metadata->role', 'borrower');
        
        if (result.error || !result.data || result.data.length === 0) {
          console.log("No results with eq query, trying alternative approaches");
          
          // Try other queries if the first one fails
          await tryAlternativeQueries('borrower');
        } else {
          data = result.data;
          error = result.error;
          console.log("Found borrowers:", data);
        }
      } catch (err) {
        console.error("Error fetching borrowers:", err);
        // Try alternative approaches
        await tryAlternativeQueries('borrower');
      }
    }
    
    // Helper function to try alternative query approaches
    async function tryAlternativeQueries(targetRole) {
      console.log(`Trying alternative queries for role: ${targetRole}`);
      
      // Try simpler query
      const fallbackResult = await supabaseClient
        .from('profiles')
        .select('id, name, role, user_metadata');
        
      if (!fallbackResult.error && fallbackResult.data) {
        console.log(`Found ${fallbackResult.data.length} profiles, filtering for ${targetRole}`);
        
        // Filter based on role
        data = fallbackResult.data
          .filter(profile => {
            // Check both profile.role and profile.user_metadata.role
            const profileRole = profile.role || 
                            (profile.user_metadata && profile.user_metadata.role);
            
            const isMatch = profileRole === targetRole;
            return isMatch;
          })
          .map(profile => ({
            id: profile.id,
            name: profile.name || 'Unknown User'
          }));
          
        console.log(`Filtered ${data.length} ${targetRole}s`);
      } else {
        console.error("Alternative query failed:", fallbackResult.error);
        
        // Last resort: direct query on auth.users table
        console.log("Trying direct auth.users query");
        const userResult = await supabaseClient
          .from('users')
          .select('id, raw_user_meta_data');
          
        if (!userResult.error && userResult.data) {
          data = userResult.data
            .filter(user => 
              user.raw_user_meta_data && 
              user.raw_user_meta_data.role === targetRole
            )
            .map(user => ({
              id: user.id,
              name: user.raw_user_meta_data?.name || 'Unknown'
            }));
            
          console.log(`Found ${data.length} ${targetRole}s from users table`);
        }
      }
    }
    
    // Fallback to RPC function if other methods fail
    async function useFallbackMethod() {
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

    // If still no data, return empty array
    const finalResult = data || [];
    console.log("Returning contacts:", JSON.stringify(finalResult));
    
    return new Response(JSON.stringify(finalResult), {
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
