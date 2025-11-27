import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export const logsApi = {
  getLogs: async (
    page: number = 1,
    level: string = "all",
    limit: number = 25
  ) => {
    let query = supabase
      .from("api_logs")
      .select("*", { count: "exact" })
      .order("timestamp", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (level !== "all") {
      query = query.eq("level", level);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { logs: data, total: count || 0 };
  },

  clearAllLogs: async () => {
    const { error } = await supabaseAdmin
      .from("api_logs")
      .delete()
      .gte("timestamp", 0);

    if (error) throw error;
  },
};
