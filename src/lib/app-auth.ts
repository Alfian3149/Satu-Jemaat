import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export type AppRole = 'admin' | 'member' | 'sector-officer'

export type CurrentAppUser = {
  email: string
  household: string | null
  id: string
  name: string
  role: AppRole
  sector: string | null
}

const roles = new Set<AppRole>(['admin', 'member', 'sector-officer'])

export const appAuth = {
  async currentUser(): Promise<CurrentAppUser | null> {
    if (!isSupabaseConfigured()) return null

    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()
    const userID = data?.claims.sub
    if (error || !userID) return null

    const profile = await supabase
      .from('profiles')
      .select('id, name, email, role, sector_id, household_id')
      .eq('id', userID)
      .maybeSingle()

    if (profile.error || !profile.data || !roles.has(profile.data.role)) return null

    return {
      email: profile.data.email,
      household: profile.data.household_id,
      id: profile.data.id,
      name: profile.data.name,
      role: profile.data.role,
      sector: profile.data.sector_id,
    }
  },
}
