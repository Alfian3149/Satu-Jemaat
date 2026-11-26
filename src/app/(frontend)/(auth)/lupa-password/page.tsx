import { AuthForm } from '@/components/AuthForm'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const { error, sent } = await searchParams
  return (
    <AuthForm
      error={error ? 'Masukkan alamat email yang benar.' : undefined}
      mode="forgot"
      success={sent ? 'Jika email terdaftar, tautan pengaturan ulang sudah dikirim.' : undefined}
    />
  )
}
