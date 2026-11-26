import { ArrowLeft, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AdvancedMemberForm } from '@/components/AdvancedMemberForm'
import { appAuth } from '@/lib/app-auth'
import { getAdvancedMemberData, getMember } from '@/lib/church'

export default async function AdvancedMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await appAuth.currentUser()
  if (!user) redirect('/login')
  if (!['admin', 'sector-officer'].includes(user.role)) redirect('/jemaat')

  const { id } = await params
  const member = await getMember(id)
  if (!member) notFound()
  const initial = await getAdvancedMemberData(member.id)

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 font-bold text-emerald-700"
        href={`/jemaat/${member.id}`}
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        Profil {member.fullName}
      </Link>
      <div>
        <div className="flex items-center gap-2 text-amber-700">
          <LockKeyhole aria-hidden="true" className="size-5" />
          <span className="text-sm font-extrabold uppercase tracking-wider">Data terbatas</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
          Data lanjutan jemaat
        </h1>
        <p className="mt-2 max-w-3xl leading-relaxed text-slate-600">
          Lengkapi pemetaan lima bidang untuk <strong>{member.fullName}</strong>. Informasi
          pastoral, bantuan, dan ekonomi hanya dapat diakses petugas berwenang.
        </p>
      </div>
      <AdvancedMemberForm initial={initial} memberID={String(member.id)} />
    </div>
  )
}
