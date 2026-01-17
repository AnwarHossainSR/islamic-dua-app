import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export const logsApi = {
  getLogs: async (
    page: number = 1,
    level: string = "all",
    limit: number = 25,
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
    try {
      const { apiLogger } = await import("@/lib/logger");

      const { error } = await supabaseAdmin
        .from("api_logs")
        .delete()
        .lt("timestamp", Date.now() + 1000000);

      if (error) {
        apiLogger.error("Failed to clear logs", {
          error: error.message,
          code: error.code,
        });
        throw error;
      }
    } catch (error: any) {
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.error("Clear logs exception", { error: error.message });
      throw error;
    }
  },
};
