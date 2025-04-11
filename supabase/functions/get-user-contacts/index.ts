
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

    // Extensive logging to diagnose issues
    console.log(`Fetching contacts for userId: ${userId}, userRole: ${userRole}`);

    // Directly query the profiles table based on user role
    if (userRole === 'borrower') {
      // Get all lenders
      console.log("Fetching all lenders for borrower");
      const result = await supabaseClient
        .from('profiles')
        .select('id, name')
        .eq('user_metadata->role', 'lender');
      
      if (result.error) {
        console.error("Error with eq query:", result.error);
        // Fallback to a simpler query
        const fallbackResult = await supabaseClient
          .from('profiles')
          .select('id, name');
          
        data = fallbackResult.data?.filter(profile => 
          profile.role === 'lender' || 
          (profile.user_metadata && profile.user_metadata.role === 'lender')
        );
        error = fallbackResult.error;
      } else {
        data = result.data;
        error = result.error;
      }
      
      console.log(`Found ${data?.length || 0} lenders, Error: ${error ? JSON.stringify(error) : 'None'}`);
    } else if (userRole === 'lender') {
      // Get all borrowers
      console.log("Fetching all borrowers for lender");
      const result = await supabaseClient
        .from('profiles')
        .select('id, name')
        .eq('user_metadata->role', 'borrower');
      
      if (result.error) {
        console.error("Error with eq query:", result.error);
        // Fallback to a simpler query
        const fallbackResult = await supabaseClient
          .from('profiles')
          .select('id, name');
          
        data = fallbackResult.data?.filter(profile => 
          profile.role === 'borrower' || 
          (profile.user_metadata && profile.user_metadata.role === 'borrower')
        );
        error = fallbackResult.error;
      } else {
        data = result.data;
        error = result.error;
      }
      
      console.log(`Found ${data?.length || 0} borrowers, Error: ${error ? JSON.stringify(error) : 'None'}`);
      console.log("Raw result:", JSON.stringify(result));
      
      // If we still have no data, try a direct query on the auth.users table
      if (!data || data.length === 0) {
        console.log("No borrowers found, trying direct auth.users query");
        const userResult = await supabaseClient
          .from('users')
          .select('id, raw_user_meta_data->name')
          .eq('raw_user_meta_data->role', 'borrower');
          
        if (!userResult.error && userResult.data) {
          data = userResult.data.map(user => ({
            id: user.id,
            name: user.raw_user_meta_data?.name || 'Unknown'
          }));
          console.log("Users query result:", JSON.stringify(data));
        }
      }
    } else {
      // Fallback: use the original stored function
      console.log("Using fallback get_user_contacts RPC function");
      const result = await supabaseClient.rpc('get_user_contacts', {
        user_id: userId
      });
      
      data = result.data;
      error = result.error;
      
      console.log(`Fallback result: ${data ? JSON.stringify(data) : 'None'}, Error: ${error ? JSON.stringify(error) : 'None'}`);
    }

    if (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }

    // If still no data, try a last resort direct query
    if (!data || data.length === 0) {
      console.log("No contacts found with specialized queries, trying a generic query");
      const allUsersResult = await supabaseClient
        .from('profiles')
        .select('id, name, role, user_metadata');
        
      if (!allUsersResult.error) {
        // Filter based on the role we need
        const neededRole = userRole === 'lender' ? 'borrower' : 'lender';
        data = allUsersResult.data
          ?.filter(profile => {
            const profileRole = profile.role || 
                               (profile.user_metadata && profile.user_metadata.role);
            return profileRole === neededRole;
          })
          .map(profile => ({
            id: profile.id,
            name: profile.name || 'Unknown'
          }));
        console.log("Generic query found contacts:", JSON.stringify(data));
      }
    }

    // Return empty array instead of null if no contacts found
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
