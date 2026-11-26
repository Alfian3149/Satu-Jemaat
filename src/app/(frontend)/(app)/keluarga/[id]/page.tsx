import { ArrowLeft, Home, MapPin, Phone, UserRound } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { appAuth } from '@/lib/app-auth'
import { getHousehold, listFamilyMembers } from '@/lib/church'

export default async function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await appAuth.currentUser()
  if (!user) return null
  const { id } = await params
  const household = await getHousehold(id)
  if (!household) notFound()
  const members = await listFamilyMembers(household.id)
  const sector = household.sectorName || 'Belum diisi'

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 font-bold text-emerald-700" href="/keluarga">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Data keluarga
      </Link>

      <section className="rounded-[2rem] bg-amber-500 p-6 text-amber-950 shadow-lg sm:p-8">
        <p className="font-bold uppercase tracking-wider text-amber-900/70">Kartu Keluarga</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Keluarga {household.familyName}
        </h1>
        <p className="mt-3 flex items-center gap-2 font-semibold">
          <MapPin aria-hidden="true" className="size-5" />
          {sector}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Home aria-hidden="true" className="size-5 text-emerald-700" />
          <p className="mt-3 text-sm font-bold text-slate-500">Alamat</p>
          <p className="mt-1 whitespace-pre-line font-bold text-slate-950">{household.address}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <UserRound aria-hidden="true" className="size-5 text-emerald-700" />
          <p className="mt-3 text-sm font-bold text-slate-500">Jumlah anggota</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-950">{members.length}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-extrabold text-slate-950">Anggota keluarga</h2>
        {members.length ? (
          <div className="mt-4 divide-y divide-slate-100">
            {members.map((member) => (
              <Link
                className="flex items-center gap-3 py-4"
                href={`/jemaat/${member.id}`}
                key={member.id}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 font-extrabold text-emerald-800">
                  {member.fullName.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-slate-950">{member.fullName}</strong>
                  <span className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                    <Phone aria-hidden="true" className="size-3.5" />
                    {member.phone}
                  </span>
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {member.familyRole ? roleLabel(member.familyRole) : 'Anggota'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-600">
            Belum ada jemaat yang dihubungkan ke keluarga ini.
          </p>
        )}
      </section>
    </div>
  )
}

function roleLabel(value: string) {
  return {
    child: 'Anak',
    head: 'Kepala keluarga',
    other: 'Anggota lain',
    parent: 'Ayah/Ibu',
    spouse: 'Suami/Istri',
  }[value]
}
