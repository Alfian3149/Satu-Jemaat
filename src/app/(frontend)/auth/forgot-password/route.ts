import { isSupabaseConfigured, siteOrigin } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

const formValue = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim()
const redirectTo = (location: string) =>
  new Response(null, { status: 303, headers: { Location: location } })

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formValue(formData, 'email').toLowerCase()
  if (!email.includes('@')) return redirectTo('/lupa-password?error=email')
  if (!isSupabaseConfigured()) return redirectTo('/lupa-password?sent=1')

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin(request)}/auth/callback?next=/reset-password`,
  })
  return redirectTo('/lupa-password?sent=1')
}
