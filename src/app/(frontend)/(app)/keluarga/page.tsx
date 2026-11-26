import { ChevronRight, MapPin, Plus, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { appAuth } from '@/lib/app-auth'
import { listHouseholds } from '@/lib/church'

export default async function FamiliesPage() {
  const user = await appAuth.currentUser()
  if (!user) return null
  const households = await listHouseholds()
  const canManage = user.role === 'admin' || user.role === 'sector-officer'

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Data keluarga</h1>
          <p className="mt-1 text-slate-500">Kelompokkan jemaat dalam Kartu Keluarga.</p>
        </div>
        {canManage && (
          <Link className="primary-button" href="/keluarga/tambah">
            <Plus aria-hidden="true" className="size-5" />
            Tambah
          </Link>
        )}
      </div>

      {households.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {households.map((household) => {
            const sector = household.sectorName || 'Tanpa sektor'
            return (
              <Link
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                href={`/keluarga/${household.id}`}
                key={household.id}
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-800">
                    <UsersRound aria-hidden="true" className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-lg text-slate-950">
                      Keluarga {household.familyName}
                    </strong>
                    <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500">
                      <MapPin aria-hidden="true" className="size-4" />
                      {sector}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-5 text-slate-300 group-hover:text-emerald-700"
                  />
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {household.address}
                </p>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <UsersRound aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Data keluarga masih kosong</h2>
            <p className="mt-2 text-slate-500">
              Tambahkan Kartu Keluarga untuk mulai mengelompokkan jemaat.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
