import {
  ArrowLeft,
  CalendarDays,
  Church,
  ClipboardList,
  ImageIcon,
  Home,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { appAuth } from '@/lib/app-auth'
import { getMember, listFamilyMembers, readMemberNik } from '@/lib/church'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const relationLabels: Record<string, string> = {
  child: 'Anak',
  father: 'Ayah',
  husband: 'Suami',
  mother: 'Ibu',
  wife: 'Istri',
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await appAuth.currentUser()
  if (!user) return null
  const { id } = await params
  const member = await getMember(id)
  if (!member) notFound()
  const [family, nik] = await Promise.all([
    member.householdID ? listFamilyMembers(member.householdID) : Promise.resolve([]),
    readMemberNik(member.id),
  ])
  const sector = member.sectorName || 'Belum diisi'
  const canManageAdvanced = user.role === 'admin' || user.role === 'sector-officer'

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 font-bold text-emerald-700" href="/jemaat">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Data jemaat
      </Link>

      <section className="rounded-[2rem] bg-emerald-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold">
            {member.fullName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">
              Profil jemaat
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{member.fullName}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-emerald-100">
              <MapPin aria-hidden="true" className="size-4" />
              {sector}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <ImageIcon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-extrabold text-slate-950">Foto jemaat</p>
            <p className="text-sm text-slate-500">
              {member.profilePhoto || member.selfiePhoto
                ? `${member.profilePhoto ? 'Profil tersimpan' : ''}${member.profilePhoto && member.selfiePhoto ? ' · ' : ''}${member.selfiePhoto ? 'Selfie tersimpan' : ''}`
                : 'Belum ada foto'}
            </p>
          </div>
        </div>
        {canManageAdvanced && (
          <Link
            className="group flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition hover:border-amber-300"
            href={`/jemaat/${member.id}/lanjutan`}
          >
            <span className="grid size-11 place-items-center rounded-xl bg-amber-200 text-amber-800">
              <ClipboardList aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-slate-950">Data lanjutan 5 bidang</strong>
              <span className="text-sm text-slate-600">Teologi hingga potensi ekonomi</span>
            </span>
          </Link>
        )}
      </section>

      {canManageAdvanced && (
        <Link className="primary-button w-full sm:w-fit" href={`/jemaat/${member.id}/edit`}>
          <Pencil aria-hidden="true" className="size-5" />
          Perbarui data jemaat
        </Link>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={Mail} label="Email" value={member.email || 'Belum diisi'} />
        <InfoCard icon={Phone} label="Nomor HP/WA" value={member.phone} />
        <InfoCard icon={MapPin} label="Tempat lahir" value={member.birthPlace || 'Belum diisi'} />
        <InfoCard icon={CalendarDays} label="Tanggal lahir" value={formatDate(member.birthDate)} />
        <InfoCard icon={ShieldCheck} label="NIK" value={maskNIK(nik)} />
        <InfoCard icon={Home} label="Alamat" value={member.address} />
        <InfoCard
          icon={CalendarDays}
          label="Terdaftar di jemaat sejak"
          value={member.registeredSince ? formatDate(member.registeredSince) : 'Belum diisi'}
        />
        <InfoCard
          icon={Church}
          label="Pindah dari gereja / jemaat"
          value={member.previousChurch || 'Belum diisi'}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Church aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-xl font-extrabold text-slate-950">Hari Besar</h2>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Sacrament date={member.baptismDate} label="Baptis" place={member.baptismPlace} />
          <Sacrament
            date={member.confirmationDate}
            label="Sidi"
            place={member.confirmationPlace}
          />
          <Sacrament
            date={member.blessingDate}
            label="Pemberkatan"
            place={member.blessingPlace}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <UsersRound aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Family Core</h2>
            <p className="text-sm text-slate-500">
              {member.householdName
                ? `Keluarga ${member.householdName}`
                : 'Belum terhubung ke Kartu Keluarga'}
            </p>
          </div>
        </div>
        {family.length ? (
          <div className="mt-5 divide-y divide-slate-100">
            {family.map((relative) => (
              <Link
                className="flex min-h-14 items-center justify-between py-3 font-bold text-slate-800"
                href={`/jemaat/${relative.id}`}
                key={relative.id}
              >
                <span>{relative.fullName}</span>
                <span className="text-sm font-semibold text-slate-500">
                  {relative.familyRole ? familyRole(relative.familyRole) : 'Anggota'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-600">
            Belum ada anggota keluarga lain.
          </p>
        )}
        {member.relations.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <h3 className="font-extrabold text-slate-900">Relasi langsung</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {member.relations.map((relation) => (
                <span
                  className="rounded-full bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800"
                  key={relation.id}
                >
                  {relationLabels[relation.relationType]}: {relation.memberName}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon aria-hidden="true" className="size-5 text-emerald-700" />
      <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-line text-base font-bold text-slate-950">{value}</p>
    </div>
  )
}

function Sacrament({
  date,
  label,
  place,
}: {
  date?: null | string
  label: string
  place?: null | string
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <h3 className="font-extrabold text-slate-900">{label}</h3>
      <p className="mt-2 text-sm text-slate-600">
        {date ? formatDate(date) : 'Tanggal belum diisi'}
      </p>
      <p className="mt-1 text-sm text-slate-600">{place || 'Tempat belum diisi'}</p>
    </div>
  )
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function maskNIK(value?: null | string) {
  if (!value) return 'Disembunyikan'
  return `${value.slice(0, 6)} •••••• ${value.slice(-4)}`
}

function familyRole(value: string) {
  return {
    child: 'Anak',
    head: 'Kepala keluarga',
    other: 'Anggota lain',
    parent: 'Ayah/Ibu',
    spouse: 'Suami/Istri',
  }[value]
}
