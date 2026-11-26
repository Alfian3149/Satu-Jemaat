import { AuthForm } from '@/components/AuthForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token?: string }>
}) {
  const { error, token } = await searchParams
  const messages: Record<string, string> = {
    confirmation: 'Konfirmasi kata sandi tidak sama.',
    invalid: 'Tautan sudah kedaluwarsa atau tidak valid.',
    password: 'Kata sandi minimal 8 karakter.',
    token: 'Tautan pengaturan ulang tidak valid.',
  }
  return <AuthForm error={error ? messages[error] : undefined} mode="reset" token={token} />
}
