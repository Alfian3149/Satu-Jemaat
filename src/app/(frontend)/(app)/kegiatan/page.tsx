import { Banknote, CalendarDays, MapPin, Plus, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { appAuth } from '@/lib/app-auth'
import { listActivities } from '@/lib/church'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const rupiah = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency',
})

export default async function ActivitiesPage() {
  const user = await appAuth.currentUser()
  if (!user) return null
  if (!['admin', 'sector-officer'].includes(user.role)) redirect('/dashboard')
  const activities = await listActivities()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-extrabold text-church-roof">Pelayanan gereja</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
            Rekam kegiatan
          </h1>
          <p className="mt-2 text-slate-500">
            Riwayat kegiatan, jumlah kehadiran, dan pemasukan per sektor.
          </p>
        </div>
        <Link className="primary-button" href="/kegiatan/baru">
          <Plus aria-hidden="true" className="size-5" />
          Rekam kegiatan
        </Link>
      </div>

      {activities.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {activities.map((activity) => {
            const type = activity.typeName
            const sector = activity.sectorName
            return (
              <article
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                key={activity.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-church-sky-soft text-church-deep">
                    <CalendarDays aria-hidden="true" className="size-6" />
                  </span>
                  {activity.hasIncome && (
                    <span className="rounded-full bg-church-gold/20 px-3 py-1 text-xs font-extrabold text-church-deep">
                      Ada pemasukan
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-extrabold text-slate-950">{type}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {dateFormatter.format(new Date(activity.date))} · {activity.time}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <MapPin aria-hidden="true" className="size-4 text-church-roof" />
                    {activity.place} · {sector}
                  </span>
                  <span className="flex items-center gap-2">
                    <UsersRound aria-hidden="true" className="size-4 text-church-roof" />
                    {activity.attendeeCount} orang hadir
                  </span>
                </div>
                {activity.hasIncome && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex items-center gap-2 font-bold text-slate-600">
                      <Banknote aria-hidden="true" className="size-5" />
                      Total pemasukan
                    </span>
                    <strong className="text-church-deep">
                      {rupiah.format(activity.grandTotal ?? 0)}
                    </strong>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-church-sky-soft text-church-deep">
              <CalendarDays aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-slate-950">Belum ada kegiatan</h2>
            <p className="mt-2 text-slate-500">Mulai dengan merekam kegiatan pertama.</p>
          </div>
        </div>
      )}
    </div>
  )
}
