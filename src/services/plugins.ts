// ============================================================
// Plugin Data Server Functions
// Generic JSONB store per plugin per user
// ============================================================

import { supabase, isDemoMode, requireUserId } from "@/lib/supabase";

const LS_PLUGINS = "mindmate.plugins.v1";

function getLocalPlugins(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(LS_PLUGINS) ?? "{}");
  } catch {
    return {};
  }
}

function setLocalPlugins(data: Record<string, unknown>) {
  try {
    localStorage.setItem(LS_PLUGINS, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export async function getPluginData<T>(pluginName: string): Promise<T | null> {
  if (isDemoMode || !supabase) {
    const local = getLocalPlugins();
    return (local[pluginName] as T) ?? null;
  }

  try {
    const userId = await requireUserId();
    const { data, error } = await supabase!
      .from("plugin_data")
      .select("data")
      .eq("user_id", userId)
      .eq("plugin_name", pluginName)
      .single();
    if (error || !data) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any).data as T;
  } catch {
    const local = getLocalPlugins();
    return (local[pluginName] as T) ?? null;
  }
}

export async function savePluginData<T>(pluginName: string, data: T): Promise<void> {
  if (isDemoMode || !supabase) {
    const local = getLocalPlugins();
    local[pluginName] = data;
    setLocalPlugins(local);
    return;
  }

  try {
    const userId = await requireUserId();
    await supabase!.from("plugin_data").upsert(
      {
        user_id: userId,
        plugin_name: pluginName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
        updated_at: new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      { onConflict: "user_id,plugin_name" },
    );
  } catch {
    const local = getLocalPlugins();
    local[pluginName] = data;
    setLocalPlugins(local);
  }
}

export async function logBreathingSession(params: {
  session_type: string;
  duration_seconds: number;
  completed_cycles: number;
  calming_score?: number;
}): Promise<void> {
  if (isDemoMode || !supabase) return;

  try {
    const userId = await requireUserId();
    await supabase!.from("breathing_sessions").insert({
      user_id: userId,
      session_type: params.session_type,
      duration_seconds: params.duration_seconds,
      completed_cycles: params.completed_cycles,
      calming_score: params.calming_score,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } catch (error) {
    console.warn("Breathing session log failed:", error);
  }
}
