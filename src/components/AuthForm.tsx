import { CheckCircle2, LockKeyhole, Mail, UserRound } from 'lucide-react'
import Link from 'next/link'
import { AuthSubmitButton } from './AuthSubmitButton'
import { PasswordField } from './PasswordField'

type Mode = 'forgot' | 'login' | 'register' | 'reset'

const actionPaths = {
  forgot: '/auth/forgot-password',
  login: '/auth/login',
  register: '/auth/register',
  reset: '/auth/reset-password',
}

const content = {
  forgot: {
    title: 'Lupa kata sandi?',
    description: 'Masukkan email akun. Kami akan mengirim tautan untuk membuat kata sandi baru.',
    submit: 'Kirim tautan reset',
  },
  login: {
    title: 'Selamat datang',
    description: 'Masuk untuk melihat dan mengelola data jemaat.',
    submit: 'Masuk ke aplikasi',
  },
  register: {
    title: 'Buat akun jemaat',
    description: 'Akun baru perlu dihubungkan ke data jemaat oleh admin gereja.',
    submit: 'Buat akun',
  },
  reset: {
    title: 'Buat kata sandi baru',
    description: 'Gunakan minimal 8 karakter yang mudah Anda ingat tetapi sulit ditebak.',
    submit: 'Simpan kata sandi',
  },
}

export function AuthForm({
  error,
  mode,
  success,
  token,
}: {
  error?: string
  mode: Mode
  success?: string
  token?: string
}) {
  const copy = content[mode]

  return (
    <div className="w-full rounded-[2rem] border border-emerald-950/10 bg-white p-6 shadow-[0_24px_70px_rgba(20,83,45,0.12)] sm:p-8">
      <div className="mb-7">
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <LockKeyhole aria-hidden="true" className="size-6" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{copy.title}</h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">{copy.description}</p>
      </div>

      <form action={actionPaths[mode]} className="space-y-5" method="post">
        {mode === 'reset' && <input name="token" type="hidden" value={token ?? ''} />}

        {mode === 'register' && (
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-800">Nama lengkap</span>
            <span className="relative block">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              />
              <input
                autoComplete="name"
                className="form-control pl-12"
                name="name"
                placeholder="Contoh: Maria Siregar"
                required
              />
            </span>
          </label>
        )}

        {mode !== 'reset' && (
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-800">Alamat email</span>
            <span className="relative block">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              />
              <input
                autoComplete="email"
                className="form-control pl-12"
                inputMode="email"
                name="email"
                placeholder="nama@email.com"
                required
                type="email"
              />
            </span>
          </label>
        )}

        {mode !== 'forgot' && (
          <PasswordField
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            label="Kata sandi"
            name="password"
            placeholder="Minimal 8 karakter"
            withIcon
          />
        )}

        {(mode === 'register' || mode === 'reset') && (
          <PasswordField
            autoComplete="new-password"
            label="Ulangi kata sandi"
            name="passwordConfirmation"
            placeholder="Ketik sekali lagi"
          />
        )}

        {error && (
          <p
            className="rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-800"
            role="status"
          >
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            {success}
          </p>
        )}

        <AuthSubmitButton label={copy.submit} />
      </form>

      <div className="mt-6 space-y-3 text-center text-base">
        {mode === 'login' && (
          <>
            <Link
              className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
              href="/lupa-password"
            >
              Lupa kata sandi?
            </Link>
            <p className="text-slate-600">
              Belum punya akun?{' '}
              <Link className="font-bold text-emerald-700" href="/daftar">
                Daftar
              </Link>
            </p>
          </>
        )}
        {mode !== 'login' && (
          <Link
            className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
            href="/login"
          >
            Kembali ke halaman masuk
          </Link>
        )}
      </div>
    </div>
  )
}
