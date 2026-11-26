import { CalendarPlus, Home, LogOut, Settings, UserRound, UsersRound } from 'lucide-react'
import Link from 'next/link'
import type { CurrentAppUser } from '@/lib/app-auth'
import { Brand } from './Brand'

const roleLabels = {
  admin: 'Admin',
  member: 'Jemaat',
  'sector-officer': 'Petugas sektor',
}

export function AppShell({ children, user }: { children: React.ReactNode; user: CurrentAppUser }) {
  return (
    <div className="min-h-dvh bg-church-cloud">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand compact />
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-bold text-slate-900">{user.name}</span>
              <span className="block text-xs font-medium text-slate-500">
                {roleLabels[user.role]}
              </span>
            </span>
            <span className="grid size-11 place-items-center rounded-full bg-church-sky-soft font-bold text-church-deep ring-2 ring-white">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <form action="/auth/logout" method="post">
              <button
                aria-label="Keluar dari aplikasi"
                className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                title="Keluar dari aplikasi"
                type="submit"
              >
                <LogOut aria-hidden="true" className="size-5" />
                <span className="hidden lg:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-20 hidden h-[calc(100dvh-5rem)] w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
          <nav className="space-y-2">
            <NavLink href="/dashboard" icon={Home} label="Beranda" />
            {user.role !== 'member' && (
              <NavLink href="/kegiatan" icon={CalendarPlus} label="Rekam kegiatan" />
            )}
            <NavLink href="/jemaat" icon={UserRound} label="Data jemaat" />
            <NavLink href="/keluarga" icon={UsersRound} label="Data keluarga" />
            {user.role === 'admin' && (
              <NavLink href="/pengaturan" icon={Settings} label="Pengaturan" />
            )}
          </nav>
          <form action="/auth/logout" className="mt-auto" method="post">
            <button
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 font-semibold text-slate-600 hover:bg-slate-100"
              type="submit"
            >
              <LogOut aria-hidden="true" className="size-5" />
              Keluar
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10 md:pt-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] md:hidden">
        <div
          className={`mx-auto grid max-w-lg ${
            user.role === 'admin'
              ? 'grid-cols-6'
              : user.role === 'sector-officer'
                ? 'grid-cols-5'
                : 'grid-cols-4'
          }`}
        >
          <MobileNavLink href="/dashboard" icon={Home} label="Beranda" />
          {user.role !== 'member' && (
            <MobileNavLink href="/kegiatan" icon={CalendarPlus} label="Kegiatan" />
          )}
          <MobileNavLink href="/jemaat" icon={UserRound} label="Jemaat" />
          <MobileNavLink href="/keluarga" icon={UsersRound} label="Keluarga" />
          {user.role === 'admin' && (
            <MobileNavLink href="/pengaturan" icon={Settings} label="Atur" />
          )}
          <form action="/auth/logout" method="post">
            <button
              className="flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-700"
              type="submit"
            >
              <LogOut aria-hidden="true" className="size-5" />
              Keluar
            </button>
          </form>
        </div>
      </nav>
    </div>
  )
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: typeof Home; label: string }) {
  return (
    <Link
      className="flex min-h-12 items-center gap-3 rounded-xl px-4 font-semibold text-slate-600 transition hover:bg-church-sky-soft hover:text-church-deep"
      href={href}
    >
      <Icon aria-hidden="true" className="size-5" />
      {label}
    </Link>
  )
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Home
  label: string
}) {
  return (
    <Link
      className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-slate-500 hover:bg-church-sky-soft hover:text-church-deep"
      href={href}
    >
      <Icon aria-hidden="true" className="size-5" />
      {label}
    </Link>
  )
}
