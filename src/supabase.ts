export function getProjectURL() {
  return getEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  );
}

export function getAPIKey() {
  return getEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export function getConnectionString() {
  const raw =
    process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  const conn = getEnvVar(raw, "SUPABASE_DATABASE_URL or DATABASE_URL");
  try {
    const url = new URL(conn);
    // devs sometimes copy the db host ending with .supabase.co which only
    // resolves within Supabase. Use the public pooler host instead.
    if (url.hostname.endsWith(".supabase.co")) {
      url.hostname = url.hostname.replace(
        ".supabase.co",
        ".pooler.supabase.com",
      );
      return url.toString();
    }
  } catch {
    // ignore parse errors and fall through
  }
  return conn;
}

function getEnvVar(v: string | undefined, n: string) {
  if (!v) {
    throw new Error(`Required env var '${n}' was not set`);
  }
  return v;
}
