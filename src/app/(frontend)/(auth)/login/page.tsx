import { CheckCircle2 } from 'lucide-react'
import { AuthForm } from '@/components/AuthForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>
}) {
  const { error, reset } = await searchParams
  const messages: Record<string, string> = {
    confirm: 'Email belum dikonfirmasi. Buka tautan di email, lalu masuk lagi.',
    config: 'Supabase belum terhubung. Isi URL proyek dan kunci publishable di .env.local.',
    credentials: 'Email atau kata sandi tidak sesuai.',
    incomplete: 'Isi email dan kata sandi.',
  }
  const errorMessage = error ? messages[error] : undefined
  return (
    <>
      {reset === 'success' && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 font-bold text-white">
          <CheckCircle2 aria-hidden="true" className="size-5" />
          Kata sandi berhasil diperbarui. Silakan masuk.
        </p>
      )}
      <AuthForm error={errorMessage} mode="login" />
    </>
  )
}
