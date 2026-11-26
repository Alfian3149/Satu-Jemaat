export function supabaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  try {
    return new URL(raw).origin
  } catch {
    return raw.replace(/\/$/, '')
  }
}

export function supabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  )
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseKey())
}

export function siteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.FIGMA_PUBLIC_URL
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      return new URL(request.url).origin
    }
  }
  return new URL(request.url).origin
}
