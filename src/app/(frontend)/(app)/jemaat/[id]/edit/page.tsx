import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { MemberForm } from '@/components/MemberForm'
import { appAuth } from '@/lib/app-auth'
import { getMember, listHouseholds, listMemberOptions, listSectors, readMemberNik } from '@/lib/church'

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) redirect('/jemaat')

  const { id } = await params
  const [sectors, households, members, member, nik] = await Promise.all([
    listSectors(),
    listHouseholds(),
    listMemberOptions(),
    getMember(id),
    readMemberNik(id),
  ])

  if (!member) notFound()

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 font-bold text-church-deep"
        href={`/jemaat/${member.id}`}
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        Kembali ke profil
      </Link>
      <div>
        <p className="font-extrabold text-church-roof">Perbarui data jemaat</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
          {member.fullName}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Identitas pada Tab 1 wajib diisi. Tab lainnya opsional dan dapat diperbarui kapan saja.
        </p>
      </div>
      <MemberForm
        households={households.map((item) => ({ id: item.id, label: item.familyName }))}
        initial={{
          address: member.address,
          baptismDate: member.baptismDate ?? undefined,
          baptismPlace: member.baptismPlace ?? undefined,
          birthDate: member.birthDate,
          birthPlace: member.birthPlace ?? undefined,
          blessingDate: member.blessingDate ?? undefined,
          blessingPlace: member.blessingPlace ?? undefined,
          confirmationDate: member.confirmationDate ?? undefined,
          confirmationPlace: member.confirmationPlace ?? undefined,
          email: member.email ?? undefined,
          familyRole: member.familyRole ?? undefined,
          fullName: member.fullName,
          household: member.householdID ?? undefined,
          nik: nik ?? undefined,
          phone: member.phone,
          previousChurch: member.previousChurch ?? undefined,
          registeredSince: member.registeredSince ?? undefined,
          relations: member.relations.map((relation) => ({
            member: relation.memberID,
            relationType: relation.relationType,
          })),
          sector: member.sectorID,
        }}
        memberID={member.id}
        members={members.filter((item) => item.id !== member.id)}
        sectors={sectors.map((item) => ({ id: item.id, label: item.name }))}
      />
    </div>
  )
}
