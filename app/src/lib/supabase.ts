// The one Supabase client (PLAN Phase 1). Sessions persist through expo-sqlite's localStorage, as
// Expo's Supabase guide recommends. The URL and publishable key are public by design; access is
// enforced by row-level security. Without them (no app/.env) the build runs in sample mode and the
// sign-up screens continue without an account.
import "./localStorage";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// The web build also renders on the server (output "server"), where there is no localStorage:
// there the client keeps no session, and the browser takes over once the page loads.
const storage = typeof localStorage === "undefined" ? undefined : localStorage;

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          storage,
          autoRefreshToken: !!storage,
          persistSession: !!storage,
          detectSessionInUrl: false,
        },
      })
    : null;

/** False in sample builds without a backend: auth screens skip straight through. */
export const accountsEnabled = supabase !== null;

// Refresh tokens only while the app is in the foreground.
if (supabase) {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** Version of the Terms and Privacy Policy the consent checkbox refers to. */
export const POLICY_VERSION = "2026-11";
