import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ActivityRecordForm } from '@/components/ActivityRecordForm'
import { appAuth } from '@/lib/app-auth'
import { listActivityTypes, listIncomeSources, listSectors } from '@/lib/church'

export default async function NewActivityPage() {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) redirect('/kegiatan')
  const [activityTypes, incomeSources, sectors] = await Promise.all([
    listActivityTypes(true),
    listIncomeSources(true),
    listSectors(),
  ])
  const defaultSector = user.sector ?? undefined

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 font-bold text-church-deep" href="/kegiatan">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Daftar kegiatan
      </Link>

      {!activityTypes.length ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-extrabold text-amber-950">Master kegiatan belum tersedia</h1>
          <p className="mt-2 text-amber-800">
            Admin perlu menambahkan nama kegiatan sebelum petugas dapat membuat rekaman.
          </p>
          {user.role === 'admin' && (
            <Link className="secondary-button mt-5 w-fit" href="/pengaturan">
              <Settings aria-hidden="true" className="size-5" />
              Buka pengaturan
            </Link>
          )}
        </section>
      ) : (
        <ActivityRecordForm
          activityTypes={activityTypes.map((item) => ({
            id: item.id,
            label: item.name,
          }))}
          defaultSector={defaultSector}
          incomeSources={incomeSources.map((item) => ({
            id: item.id,
            label: item.name,
          }))}
          sectors={sectors.map((item) => ({ id: item.id, label: item.name }))}
        />
      )}
    </div>
  )
}
