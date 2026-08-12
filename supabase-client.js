const config = window.RITM_SUPABASE_CONFIG || {};

export const isSupabaseConfigured = Boolean(
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(String(config.url || '').trim()) &&
  String(config.publishableKey || '').trim()
);

let clientPromise;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) return Promise.resolve(null);

  if (!clientPromise) {
    clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.3/+esm')
      .then(({ createClient }) => createClient(
        String(config.url).trim(),
        String(config.publishableKey).trim(),
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      ));
  }

  return clientPromise;
}
