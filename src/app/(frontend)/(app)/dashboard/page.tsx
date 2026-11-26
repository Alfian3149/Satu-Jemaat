import { ArrowRight, UserPlus, UserRound, UsersRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { claimFirstAdminAction } from '@/app/(frontend)/actions'
import { ActionForm } from '@/components/ActionForm'
import { appAuth } from '@/lib/app-auth'
import { adminExists, countTable } from '@/lib/church'
import { ChurchMark } from '@/components/ChurchMark'

export default async function DashboardPage() {
  const user = await appAuth.currentUser()
  if (!user) return null
  const [members, households, adminReady] = await Promise.all([
    countTable('members'),
    countTable('households'),
    adminExists(),
  ])

  const canManage = user.role === 'admin' || user.role === 'sector-officer'

  return (
    <div className="space-y-7">
      <section className="relative min-h-72 overflow-hidden rounded-[2rem] bg-church-deep text-white shadow-xl shadow-church-deep/15">
        <Image
          alt=""
          aria-hidden="true"
          className="object-cover object-[72%_center]"
          fill
          priority
          sizes="(min-width: 768px) 70vw, 100vw"
          src="/images/gereja-satujemaat.png"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-church-deep via-church-deep/85 to-church-deep/15" />
        <div className="relative max-w-2xl p-6 sm:p-8">
          <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-white/90 text-church-deep shadow-sm">
            <ChurchMark className="size-11" />
          </span>
          <p className="font-semibold text-church-sky-soft">Selamat datang,</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{user.name}</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-white/90">
            Kelola data jemaat dan hubungan keluarga dengan lebih rapi dalam satu tempat.
          </p>
        </div>
      </section>

      {!adminReady && user.role !== 'admin' && (
        <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold text-slate-950">Jadikan akun ini admin</h2>
          <p className="mt-2 text-slate-600">
            Belum ada admin aplikasi. Peran ini disimpan di Supabase, lalu akun ini dapat mengatur
            akun lain dari menu Pengaturan.
          </p>
          <div className="mt-5">
            <ActionForm action={claimFirstAdminAction} submitLabel="Jadikan admin">
              <input name="confirm" type="hidden" value="1" />
            </ActionForm>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-extrabold text-slate-950">Ringkasan data</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatCard
            color="sky"
            href="/jemaat"
            icon={UserRound}
            label="Jemaat dapat diakses"
            value={members}
          />
          <StatCard
            color="amber"
            href="/keluarga"
            icon={UsersRound}
            label="Kartu Keluarga"
            value={households}
          />
        </div>
      </section>

      {canManage ? (
        <section>
          <h2 className="text-xl font-extrabold text-slate-950">Aksi cepat</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickLink
              description="Catat identitas, baptis, sidi, dan keluarga."
              href="/jemaat/tambah"
              icon={UserPlus}
              label="Tambah jemaat"
            />
            <QuickLink
              description="Buat kelompok keluarga sebelum menambah anggota."
              href="/keluarga/tambah"
              icon={UsersRound}
              label="Tambah keluarga"
            />
          </div>
        </section>
      ) : members === 0 ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-amber-950">Akun belum terhubung</h2>
          <p className="mt-2 leading-relaxed text-amber-800">
            Hubungi admin gereja untuk menghubungkan akun Anda dengan data jemaat dan Kartu
            Keluarga.
          </p>
        </section>
      ) : null}
    </div>
  )
}

function StatCard({
  color,
  href,
  icon: Icon,
  label,
  value,
}: {
  color: 'amber' | 'sky'
  href: string
  icon: typeof UserRound
  label: string
  value: number
}) {
  return (
    <Link
      className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      href={href}
    >
      <span
        className={`grid size-14 place-items-center rounded-2xl ${color === 'sky' ? 'bg-church-sky-soft text-church-deep' : 'bg-amber-100 text-amber-700'}`}
      >
        <Icon aria-hidden="true" className="size-7" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-3xl font-extrabold text-slate-950">{value}</strong>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-church-roof"
      />
    </Link>
  )
}

function QuickLink({
  description,
  href,
  icon: Icon,
  label,
}: {
  description: string
  href: string
  icon: typeof UserRound
  label: string
}) {
  return (
    <Link
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-church-sky hover:shadow-md"
      href={href}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-church-sky-soft text-church-deep">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <strong className="mt-4 block text-lg font-bold text-slate-950">{label}</strong>
      <span className="mt-1 block text-sm leading-relaxed text-slate-500">{description}</span>
    </Link>
  )
}
