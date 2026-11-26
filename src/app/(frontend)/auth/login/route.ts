import { isSupabaseConfigured, siteOrigin } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

const formValue = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim()
const redirectTo = (location: string) =>
  new Response(null, { status: 303, headers: { Location: location } })

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formValue(formData, 'email').toLowerCase()
  const password = formValue(formData, 'password')

  if (!isSupabaseConfigured()) return redirectTo('/login?error=config')
  if (!email || !password) return redirectTo('/login?error=incomplete')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.code === 'email_not_confirmed') return redirectTo('/login?error=confirm')
    return redirectTo('/login?error=credentials')
  }
  return redirectTo(new URL('/dashboard', siteOrigin(request)).pathname)
}
