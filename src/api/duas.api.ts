import { supabase } from "@/lib/supabase/client";
import type { Dua, DuaCategory, DuaStats } from "@/lib/types/duas";

export const duasApi = {
  getAll: async (filters?: {
    category?: string;
    search?: string;
    isImportant?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    let query = supabase.from("duas").select("*").eq("is_active", true);

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `title_bn.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%,dua_text_ar.ilike.%${filters.search}%`
      );
    }

    if (filters?.isImportant) {
      query = query.eq("is_important", true);
    }

    query = query.order("created_at", { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Dua[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from("duas")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data as Dua;
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from("dua_categories")
      .select("*")
      .eq("is_active", true)
      .order("name_bn");

    if (error) throw error;
    return data as DuaCategory[];
  },

  getStats: async (): Promise<DuaStats> => {
    const { data: allDuas, error } = await supabase
      .from("duas")
      .select("category, is_important")
      .eq("is_active", true);

    if (error) throw error;

    const total = allDuas?.length || 0;
    const important = allDuas?.filter((d) => d.is_important).length || 0;
    const byCategory =
      allDuas?.reduce((acc: Record<string, number>, dua) => {
        acc[dua.category] = (acc[dua.category] || 0) + 1;
        return acc;
      }, {}) || {};

    return { total, important, byCategory };
  },

  create: async (duaData: Omit<Dua, "id" | "created_at" | "updated_at">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("duas")
      .insert({ ...duaData, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Dua;
  },

  update: async (
    id: string,
    duaData: Partial<Omit<Dua, "id" | "created_at" | "updated_at" | "created_by">>
  ) => {
    const { data, error } = await supabase
      .from("duas")
      .update({ ...duaData, updated_at: Date.now() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Dua;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from("duas")
      .update({ is_active: false, updated_at: Date.now() })
      .eq("id", id);

    if (error) throw error;
  },
};
