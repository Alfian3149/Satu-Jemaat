import { createClient } from '@/lib/supabase/server'

const formValue = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim()
const redirectTo = (location: string) =>
  new Response(null, { status: 303, headers: { Location: location } })

export async function POST(request: Request) {
  const formData = await request.formData()
  const password = formValue(formData, 'password')
  const confirmation = formValue(formData, 'passwordConfirmation')

  if (password.length < 8) return redirectTo('/reset-password?error=password')
  if (password !== confirmation) return redirectTo('/reset-password?error=confirmation')

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims.sub) return redirectTo('/reset-password?error=invalid')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return redirectTo('/reset-password?error=invalid')
  return redirectTo('/login?reset=success')
}
