import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MemberForm } from '@/components/MemberForm'
import { appAuth } from '@/lib/app-auth'
import { listHouseholds, listMemberOptions, listSectors } from '@/lib/church'

export default async function AddMemberPage() {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) redirect('/jemaat')
  const [sectors, households, members] = await Promise.all([
    listSectors(),
    listHouseholds(),
    listMemberOptions(),
  ])

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 font-bold text-emerald-700" href="/jemaat">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Kembali
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Tambah jemaat</h1>
        <p className="mt-1 text-slate-500">Isian bertanda wajib harus dilengkapi.</p>
      </div>
      {sectors.length ? (
        <MemberForm
          households={households.map((item) => ({ id: item.id, label: item.familyName }))}
          members={members}
          sectors={sectors.map((item) => ({ id: item.id, label: item.name }))}
        />
      ) : (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-amber-950">Tambahkan sektor terlebih dahulu</h2>
          <p className="mt-2 text-amber-800">
            Admin perlu membuat minimal satu sektor melalui menu Pengaturan.
          </p>
        </div>
      )}
    </div>
  )
}
