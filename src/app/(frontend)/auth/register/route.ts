import { isSupabaseConfigured, siteOrigin } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

const formValue = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim()
const redirectTo = (location: string) =>
  new Response(null, { status: 303, headers: { Location: location } })

export async function POST(request: Request) {
  const formData = await request.formData()
  const name = formValue(formData, 'name')
  const email = formValue(formData, 'email').toLowerCase()
  const password = formValue(formData, 'password')
  const confirmation = formValue(formData, 'passwordConfirmation')

  if (!isSupabaseConfigured()) return redirectTo('/daftar?error=config')
  if (name.length < 3 || !email.includes('@')) return redirectTo('/daftar?error=identity')
  if (password.length < 8) return redirectTo('/daftar?error=password')
  if (password !== confirmation) return redirectTo('/daftar?error=confirmation')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    options: {
      data: { name },
      emailRedirectTo: `${siteOrigin(request)}/auth/callback?next=/dashboard`,
    },
    password,
  })
  if (error || !data.user) {
    const code = error?.code ?? ''
    const message = error?.message ?? ''
    if (code === 'over_email_send_rate_limit') return redirectTo('/daftar?error=rate')
    if (message.includes('Error sending confirmation email')) return redirectTo('/daftar?error=mail')
    return redirectTo('/daftar?error=exists')
  }
  if (!data.session) return redirectTo('/daftar?confirm=1')
  return redirectTo('/dashboard')
}
