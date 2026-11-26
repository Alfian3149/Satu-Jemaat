import { AuthForm } from '@/components/AuthForm'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string; error?: string }>
}) {
  const { confirm, error } = await searchParams
  const messages: Record<string, string> = {
    confirmation: 'Konfirmasi kata sandi tidak sama.',
    config: 'Supabase belum terhubung. Isi URL proyek dan kunci publishable di .env.local.',
    exists: 'Akun tidak dapat dibuat. Email mungkin sudah terdaftar.',
    identity: 'Masukkan nama lengkap dan alamat email yang benar.',
    mail: 'Email konfirmasi gagal terkirim. Periksa SMTP Resend di Supabase: pengirim harus domain yang sudah diverifikasi, username resend, port 465.',
    password: 'Kata sandi minimal 8 karakter.',
    rate: 'Pengiriman email sedang dibatasi. Tunggu beberapa menit, lalu coba lagi.',
  }
  return (
    <AuthForm
      error={error ? messages[error] : undefined}
      mode="register"
      success={confirm ? 'Akun dibuat. Buka tautan konfirmasi di email sebelum masuk.' : undefined}
    />
  )
}
