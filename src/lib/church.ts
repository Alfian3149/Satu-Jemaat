import 'server-only'

import { createClient } from '@/lib/supabase/server'

const memberListColumns =
  'id, full_name, phone, sector:sectors(name)'

export type SectorRecord = {
  code: string | null
  id: string
  name: string
}

export type HouseholdRecord = {
  address: string
  familyName: string
  familyNumber: string | null
  id: string
  notes: string | null
  sectorName: string
}

export type MemberRecord = {
  address: string
  baptismDate: string | null
  baptismPlace: string | null
  birthDate: string
  birthPlace: string | null
  blessingDate: string | null
  blessingPlace: string | null
  confirmationDate: string | null
  confirmationPlace: string | null
  email: string | null
  familyRole: string | null
  fullName: string
  householdID: string | null
  householdName: string | null
  id: string
  phone: string
  previousChurch: string | null
  profilePhoto: boolean
  registeredSince: string | null
  relations: Array<{
    id: string
    memberID: string
    memberName: string
    relationType: 'child' | 'father' | 'husband' | 'mother' | 'wife'
  }>
  sectorID: string
  sectorName: string
  selfiePhoto: boolean
}

export type ActivityRecord = {
  attendeeCount: number
  date: string
  grandTotal: number
  hasIncome: boolean
  id: string
  place: string
  sectorName: string
  time: string
  typeName: string
}

export type ProfileRecord = {
  email: string
  householdID: string | null
  id: string
  name: string
  role: string
  sectorID: string | null
}

type JoinedName = { name: string } | { name: string }[] | null

function joinedName(value: JoinedName, fallback = 'Tanpa sektor') {
  if (Array.isArray(value)) return value[0]?.name ?? fallback
  return value?.name ?? fallback
}

function dateOnly(value: string | null) {
  return value ? value.slice(0, 10) : null
}

export async function listSectors() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sectors')
    .select('id, name, code')
    .order('name')
    .limit(100)
  if (error) throw new Error('Data sektor tidak dapat dimuat.')
  return (data ?? []) as SectorRecord[]
}

export async function listHouseholds() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('households')
    .select('id, family_name, family_number, address, notes, sector:sectors(name)')
    .order('family_name')
    .limit(100)
  if (error) throw new Error('Data keluarga tidak dapat dimuat.')

  return (data ?? []).map((row) => ({
    address: row.address as string,
    familyName: row.family_name as string,
    familyNumber: (row.family_number as string | null) ?? null,
    id: row.id as string,
    notes: (row.notes as string | null) ?? null,
    sectorName: joinedName(row.sector as JoinedName),
  })) satisfies HouseholdRecord[]
}

export async function getHousehold(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('households')
    .select('id, family_name, family_number, address, notes, sector:sectors(name)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error('Data keluarga tidak dapat dimuat.')
  if (!data) return null
  return {
    address: data.address as string,
    familyName: data.family_name as string,
    familyNumber: (data.family_number as string | null) ?? null,
    id: data.id as string,
    notes: (data.notes as string | null) ?? null,
    sectorName: joinedName(data.sector as JoinedName),
  } satisfies HouseholdRecord
}

export async function listMembers(search = '') {
  const supabase = await createClient()
  const query = search.trim().slice(0, 80)
  let request = supabase.from('members').select(memberListColumns).order('full_name').limit(50)

  if (query) {
    const safe = query.replace(/[%_,.()]/g, '')
    request = request.or(`full_name.ilike.%${safe}%,phone.ilike.%${safe}%`)
  }

  const { data, error } = await request
  if (error) throw new Error('Data jemaat tidak dapat dimuat.')

  const rows = new Map(
    (data ?? []).map((row) => [
      row.id as string,
      {
        fullName: row.full_name as string,
        id: row.id as string,
        phone: row.phone as string,
        sectorName: joinedName(row.sector as JoinedName),
      },
    ]),
  )

  if (/^\d{4,16}$/.test(query)) {
    const matches = await supabase.rpc('search_member_ids_by_nik', { query })
    const ids = (matches.data ?? [])
      .map((row: { id: string }) => row.id)
      .filter((id: string) => !rows.has(id))
    if (!matches.error && ids.length) {
      const extra = await supabase
        .from('members')
        .select(memberListColumns)
        .in('id', ids)
        .order('full_name')
      for (const row of extra.data ?? []) {
        rows.set(row.id as string, {
          fullName: row.full_name as string,
          id: row.id as string,
          phone: row.phone as string,
          sectorName: joinedName(row.sector as JoinedName),
        })
      }
    }
  }

  return [...rows.values()].sort((left, right) => left.fullName.localeCompare(right.fullName, 'id'))
}

export async function listMemberOptions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('id, full_name')
    .order('full_name')
    .limit(200)
  if (error) throw new Error('Data jemaat tidak dapat dimuat.')
  return (data ?? []).map((row) => ({
    id: row.id as string,
    label: row.full_name as string,
  }))
}

const memberDetailColumns = `id, full_name, address, phone, email, birth_place, birth_date, family_role, sector_id,
       registered_since, previous_church,
       baptism_date, baptism_place, confirmation_date, confirmation_place,
       blessing_date, blessing_place,
       household_id, profile_photo_path, selfie_photo_path,
       sector:sectors(name),
       household:households(family_name)`

const memberDetailWithoutMembership = `id, full_name, address, phone, email, birth_place, birth_date, family_role, sector_id,
       baptism_date, baptism_place, confirmation_date, confirmation_place,
       blessing_date, blessing_place,
       household_id, profile_photo_path, selfie_photo_path,
       sector:sectors(name),
       household:households(family_name)`

const legacyMemberDetailColumns = `id, full_name, address, phone, birth_date, family_role, sector_id,
       baptism_date, baptism_place, confirmation_date, confirmation_place,
       household_id, profile_photo_path, selfie_photo_path,
       sector:sectors(name),
       household:households(family_name)`

export async function getMember(id: string) {
  const supabase = await createClient()
  const missingColumn = (queryError: { code?: string; message?: string } | null) =>
    Boolean(
      queryError &&
        (queryError.code === 'PGRST204' ||
          queryError.message?.includes('schema cache') ||
          queryError.message?.includes('does not exist')),
    )
  let { data, error } = await supabase
    .from('members')
    .select(memberDetailColumns)
    .eq('id', id)
    .maybeSingle()
  if (missingColumn(error)) {
    const current = await supabase
      .from('members')
      .select(memberDetailWithoutMembership)
      .eq('id', id)
      .maybeSingle()
    data = current.data as unknown as typeof data
    error = current.error
  }
  if (missingColumn(error)) {
    const legacy = await supabase
      .from('members')
      .select(legacyMemberDetailColumns)
      .eq('id', id)
      .maybeSingle()
    data = legacy.data as unknown as typeof data
    error = legacy.error
  }
  if (error) throw new Error('Data jemaat tidak dapat dimuat.')
  if (!data) return null

  const { data: relationRows } = await supabase
    .from('member_relations')
    .select('id, relation_type, related_member_id')
    .eq('member_id', id)
  const relatedIds = (relationRows ?? []).map((row) => row.related_member_id as string)
  const relatedNames = new Map<string, string>()
  if (relatedIds.length) {
    const { data: relatedMembers } = await supabase
      .from('members')
      .select('id, full_name')
      .in('id', relatedIds)
    for (const relatedMember of relatedMembers ?? []) {
      relatedNames.set(relatedMember.id as string, relatedMember.full_name as string)
    }
  }

  const household = data.household as { family_name: string } | { family_name: string }[] | null
  const householdName = Array.isArray(household)
    ? household[0]?.family_name
    : household?.family_name

  return {
    address: data.address as string,
    baptismDate: dateOnly(data.baptism_date as string | null),
    baptismPlace: (data.baptism_place as string | null) ?? null,
    birthDate: dateOnly(data.birth_date as string) ?? '',
    birthPlace: (data.birth_place as string | null) ?? null,
    blessingDate: dateOnly(data.blessing_date as string | null),
    blessingPlace: (data.blessing_place as string | null) ?? null,
    confirmationDate: dateOnly(data.confirmation_date as string | null),
    confirmationPlace: (data.confirmation_place as string | null) ?? null,
    email: (data.email as string | null) ?? null,
    familyRole: (data.family_role as string | null) ?? null,
    fullName: data.full_name as string,
    householdID: (data.household_id as string | null) ?? null,
    householdName: householdName ?? null,
    id: data.id as string,
    phone: data.phone as string,
    previousChurch: (data.previous_church as string | null) ?? null,
    profilePhoto: Boolean(data.profile_photo_path),
    registeredSince: dateOnly((data.registered_since as string | null) ?? null),
    relations: (relationRows ?? []).flatMap((relation) => {
      const relationType = relation.relation_type as string
      if (
        relationType !== 'child' &&
        relationType !== 'father' &&
        relationType !== 'husband' &&
        relationType !== 'mother' &&
        relationType !== 'wife'
      ) {
        return []
      }
      return [
        {
          id: relation.id as string,
          memberID: relation.related_member_id as string,
          memberName: relatedNames.get(relation.related_member_id as string) ?? 'Jemaat',
          relationType,
        },
      ]
    }),
    sectorID: data.sector_id as string,
    sectorName: joinedName(data.sector as JoinedName),
    selfiePhoto: Boolean(data.selfie_photo_path),
  } satisfies MemberRecord
}

export async function listFamilyMembers(householdID: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('id, full_name, phone, family_role')
    .eq('household_id', householdID)
    .order('full_name')
    .limit(100)
  if (error) throw new Error('Anggota keluarga tidak dapat dimuat.')
  return (data ?? []).map((row) => ({
    familyRole: (row.family_role as string | null) ?? null,
    fullName: row.full_name as string,
    id: row.id as string,
    phone: row.phone as string,
  }))
}

export async function countTable(table: 'households' | 'members') {
  const supabase = await createClient()
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true })
  if (error) throw new Error('Ringkasan data tidak dapat dimuat.')
  return count ?? 0
}

export async function readMemberNik(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('read_member_nik', { member_id: id })
  if (error) return null
  return typeof data === 'string' ? data : null
}

export async function listActivityTypes(activeOnly = false) {
  const supabase = await createClient()
  let request = supabase.from('activity_types').select('id, name, active').order('name').limit(100)
  if (activeOnly) request = request.eq('active', true)
  const { data, error } = await request
  if (error) throw new Error('Master kegiatan tidak dapat dimuat.')
  return (data ?? []).map((row) => ({
    active: row.active as boolean,
    id: row.id as string,
    name: row.name as string,
  }))
}

export async function listIncomeSources(activeOnly = false) {
  const supabase = await createClient()
  let request = supabase
    .from('income_sources')
    .select('id, name, active, sort_order')
    .order('sort_order')
    .order('name')
    .limit(100)
  if (activeOnly) request = request.eq('active', true)
  const { data, error } = await request
  if (error) throw new Error('Sumber pemasukan tidak dapat dimuat.')
  return (data ?? []).map((row) => ({
    active: row.active as boolean,
    id: row.id as string,
    name: row.name as string,
  }))
}

export async function listActivities() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activity_records')
    .select(
      `id, activity_date, activity_time, place, attendee_count, has_income, grand_total,
       activity_type:activity_types(name), sector:sectors(name)`,
    )
    .order('activity_date', { ascending: false })
    .limit(50)
  if (error) throw new Error('Rekaman kegiatan tidak dapat dimuat.')

  return (data ?? []).map((row) => ({
    attendeeCount: row.attendee_count as number,
    date: dateOnly(row.activity_date as string) ?? '',
    grandTotal: row.grand_total as number,
    hasIncome: row.has_income as boolean,
    id: row.id as string,
    place: row.place as string,
    sectorName: joinedName(row.sector as JoinedName),
    time: row.activity_time as string,
    typeName: joinedName(row.activity_type as JoinedName, 'Kegiatan'),
  })) satisfies ActivityRecord[]
}

export async function getAdvancedMemberData(memberID: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('advanced_member_data')
    .select('theology, service_witness, gemasa, ppsdi_ppk, pegp')
    .eq('member_id', memberID)
    .maybeSingle()
  if (error) throw new Error('Data lanjutan tidak dapat dimuat.')
  if (!data) return {}
  return {
    gemasa: data.gemasa,
    pegp: data.pegp,
    ppsdiPpk: data.ppsdi_ppk,
    serviceWitness: data.service_witness,
    theology: data.theology,
  }
}

export async function adminExists() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_exists')
  if (error) return false
  return data === true
}

export async function listProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, sector_id, household_id')
    .order('name')
    .limit(200)
  if (error) throw new Error('Daftar akun tidak dapat dimuat.')
  return (data ?? []).map((row) => ({
    email: row.email as string,
    householdID: (row.household_id as string | null) ?? null,
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    sectorID: (row.sector_id as string | null) ?? null,
  })) satisfies ProfileRecord[]
}
