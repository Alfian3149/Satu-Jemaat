import Link from 'next/link'
import { ChurchMark } from './ChurchMark'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="inline-flex items-center gap-3" href={compact ? '/dashboard' : '/'}>
      <span className="grid size-12 place-items-center rounded-2xl bg-church-sky-soft text-church-deep shadow-sm ring-1 ring-church-sky/25">
        <ChurchMark className="size-10" />
      </span>
      <span>
        <span className="block text-lg font-extrabold leading-tight text-church-deep">
          SatuJemaat
        </span>
        {!compact && (
          <span className="block text-sm font-medium text-slate-500">Pendataan gereja</span>
        )}
      </span>
    </Link>
  )
}
