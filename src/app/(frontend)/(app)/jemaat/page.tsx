import { ChevronRight, MapPin, Plus, Search, UserRound } from 'lucide-react'
import Link from 'next/link'
import { appAuth } from '@/lib/app-auth'
import { listMembers } from '@/lib/church'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const user = await appAuth.currentUser()
  if (!user) return null
  const { q = '' } = await searchParams
  const members = await listMembers(q)
  const canManage = user.role === 'admin' || user.role === 'sector-officer'

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          canManage ? (
            <Link className="primary-button" href="/jemaat/tambah">
              <Plus aria-hidden="true" className="size-5" />
              Tambah
            </Link>
          ) : null
        }
        description="Cari berdasarkan nama, nomor HP, atau NIK."
        title="Data jemaat"
      />

      <form className="relative" role="search">
        <Search
          aria-hidden="true"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
        />
        <input
          className="form-control bg-white pl-12 pr-28"
          defaultValue={q}
          name="q"
          placeholder="Cari jemaat…"
        />
        <button
          className="absolute right-2 top-1/2 min-h-10 -translate-y-1/2 rounded-xl bg-slate-900 px-4 font-bold text-white"
          type="submit"
        >
          Cari
        </button>
      </form>

      {members.length ? (
        <div className="space-y-3">
          {members.map((member) => {
            const sector = member.sectorName || 'Tanpa sektor'
            return (
              <Link
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                href={`/jemaat/${member.id}`}
                key={member.id}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 font-extrabold text-emerald-800">
                  {member.fullName.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-lg text-slate-950">
                    {member.fullName}
                  </strong>
                  <span className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-500">
                    <MapPin aria-hidden="true" className="size-4" />
                    {sector} · {member.phone}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-5 text-slate-300 group-hover:text-emerald-700"
                />
              </Link>
            )
          })}
        </div>
      ) : (
        <EmptyState
          description={
            q ? 'Coba gunakan kata pencarian lain.' : 'Belum ada data jemaat yang dapat Anda akses.'
          }
          icon={UserRound}
          title={q ? 'Jemaat tidak ditemukan' : 'Data jemaat masih kosong'}
        />
      )}
    </div>
  )
}

function PageHeader({
  action,
  description,
  title,
}: {
  action: React.ReactNode
  description: string
  title: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-1 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

function EmptyState({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: typeof UserRound
  title: string
}) {
  return (
    <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon aria-hidden="true" className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-slate-500">{description}</p>
      </div>
    </div>
  )
}
