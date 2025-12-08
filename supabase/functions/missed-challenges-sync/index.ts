import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting missed challenges sync...");

    // Get all users with active challenges
    const { data: activeUsers } = await supabaseClient
      .from("user_challenge_progress")
      .select("user_id")
      .eq("status", "active");

    if (!activeUsers || activeUsers.length === 0) {
      console.log("No active users found");
      return new Response(JSON.stringify({ success: true, message: "No active users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uniqueUsers = [...new Set(activeUsers.map((u) => u.user_id))];
    console.log(`Processing ${uniqueUsers.length} users`);

    // Get yesterday's date in Bangladesh timezone
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayBd = new Date(yesterday.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const yesterdayDate = yesterdayBd.toLocaleDateString("en-CA");

    let totalMissed = 0;

    for (const userId of uniqueUsers) {
      try {
        // Get active challenges for user
        const { data: activeProgress } = await supabaseClient
          .from("user_challenge_progress")
          .select("challenge_id")
          .eq("user_id", userId)
          .eq("status", "active");

        if (!activeProgress || activeProgress.length === 0) continue;

        // Check which challenges were completed yesterday
        const { data: completedYesterday } = await supabaseClient
          .from("user_challenge_daily_logs")
          .select("challenge_id")
          .eq("user_id", userId)
          .eq("completion_date", yesterdayDate)
          .eq("is_completed", true);

        const completedIds = new Set(completedYesterday?.map((c) => c.challenge_id) || []);
        const missedChallenges = activeProgress.filter((p) => !completedIds.has(p.challenge_id));

        // Insert missed challenges (avoid duplicates)
        if (missedChallenges.length > 0) {
          const { error } = await supabaseClient.from("user_missed_challenges").upsert(
            missedChallenges.map((c) => ({
              user_id: userId,
              challenge_id: c.challenge_id,
              missed_date: yesterdayDate,
              reason: "not_completed",
              was_active: true,
            })),
            {
              onConflict: "user_id,challenge_id,missed_date",
              ignoreDuplicates: true,
            }
          );

          if (error) {
            console.error(`Error for user ${userId}:`, error);
          } else {
            totalMissed += missedChallenges.length;
            console.log(`User ${userId}: ${missedChallenges.length} missed challenges`);
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
      }
    }

    console.log(`Sync completed. Total missed: ${totalMissed}`);

    return new Response(
      JSON.stringify({
        success: true,
        usersProcessed: uniqueUsers.length,
        totalMissed,
        date: yesterdayDate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
