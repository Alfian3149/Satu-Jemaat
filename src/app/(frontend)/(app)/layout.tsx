import { redirect } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { appAuth } from '@/lib/app-auth'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await appAuth.currentUser()
  if (!user) redirect('/login')
  return <AppShell user={user}>{children}</AppShell>
}
