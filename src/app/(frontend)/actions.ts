'use server'

import { revalidatePath } from 'next/cache'
import { appAuth, type CurrentAppUser } from '@/lib/app-auth'
import { createClient } from '@/lib/supabase/server'

export type ActionState = {
  error?: string
  errorField?: string
  href?: string
  message?: string
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const value = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim()

const isUUID = (input: string) => UUID.test(input)

const safeError = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message && !/database|supabase|jwt|sql/i.test(error.message)) {
    return error.message
  }
  return fallback
}

const duplicate = (error: { code?: string; message?: string } | null, constraint: string) =>
  Boolean(error && (error.code === '23505' || error.message?.includes(constraint)))

function assignedSector(user: CurrentAppUser, submitted: string) {
  if (user.role === 'sector-officer') return user.sector
  return isUUID(submitted) ? submitted : null
}

export async function createSectorAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || user.role !== 'admin') return { error: 'Hanya admin yang dapat menambah sektor.' }

  const name = value(formData, 'name')
  const code = value(formData, 'code')
  if (name.length < 2) return { error: 'Nama sektor minimal 2 karakter.' }

  const supabase = await createClient()
  const { error } = await supabase.from('sectors').insert({
    code: code || null,
    name,
  })
  if (error) return { error: 'Sektor tidak dapat ditambahkan.' }

  revalidatePath('/pengaturan')
  return { message: 'Sektor berhasil ditambahkan.' }
}

export async function createActivityTypeAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || user.role !== 'admin') {
    return { error: 'Hanya admin yang dapat menambah master kegiatan.' }
  }

  const name = value(formData, 'name')
  const description = value(formData, 'description')
  if (name.length < 3) return { error: 'Nama kegiatan minimal 3 karakter.' }

  const supabase = await createClient()
  const { error } = await supabase.from('activity_types').insert({
    active: true,
    description: description || null,
    name,
  })
  if (duplicate(error, 'activity_types_name_key')) {
    return { error: 'Nama kegiatan sudah ada.' }
  }
  if (error) return { error: 'Master kegiatan tidak dapat ditambahkan.' }

  revalidatePath('/kegiatan/baru')
  revalidatePath('/pengaturan')
  return { message: 'Master kegiatan berhasil ditambahkan.' }
}

export async function createIncomeSourceAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || user.role !== 'admin') {
    return { error: 'Hanya admin yang dapat menambah sumber pemasukan.' }
  }

  const name = value(formData, 'name')
  const description = value(formData, 'description')
  if (name.length < 3) return { error: 'Nama sumber pemasukan minimal 3 karakter.' }

  const supabase = await createClient()
  const { error } = await supabase.from('income_sources').insert({
    active: true,
    description: description || null,
    name,
    sort_order: 0,
  })
  if (duplicate(error, 'income_sources_name_key')) {
    return { error: 'Nama sumber pemasukan sudah ada.' }
  }
  if (error) return { error: 'Sumber pemasukan tidak dapat ditambahkan.' }

  revalidatePath('/kegiatan/baru')
  revalidatePath('/pengaturan')
  return { message: 'Sumber pemasukan berhasil ditambahkan.' }
}

const ACTIVITY_DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100]

type ActivityIncomeInput = {
  quantities?: Record<string, unknown>
  source?: unknown
}

export async function createActivityRecordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) {
    return { error: 'Anda tidak memiliki izin merekam kegiatan.' }
  }

  const activityType = value(formData, 'activityType')
  const date = value(formData, 'date')
  const place = value(formData, 'place')
  const time = value(formData, 'time')
  const sector = assignedSector(user, value(formData, 'sector'))
  const notes = value(formData, 'notes').slice(0, 2000)
  const attendeeCount = Number(value(formData, 'attendeeCount'))
  const hasIncome = formData.get('hasIncome') === 'on'

  if (
    !isUUID(activityType) ||
    !date ||
    place.length < 2 ||
    !time ||
    !sector ||
    !Number.isInteger(attendeeCount) ||
    attendeeCount < 0
  ) {
    return { error: 'Lengkapi nama kegiatan, tanggal, tempat, waktu, sektor, dan jumlah hadir.' }
  }

  let incomeEntries: Array<{
    breakdown: Array<{ denomination: number; quantity: number; subtotal: number }>
    source: string
    total: number
  }> = []

  if (hasIncome) {
    try {
      const parsed = JSON.parse(value(formData, 'incomeEntries')) as unknown
      if (!Array.isArray(parsed)) throw new Error('invalid')
      incomeEntries = parsed.flatMap((entry: ActivityIncomeInput) => {
        if (!entry || typeof entry.source !== 'string' || !isUUID(entry.source)) return []
        const quantities =
          entry.quantities && typeof entry.quantities === 'object' ? entry.quantities : {}
        const breakdown = ACTIVITY_DENOMINATIONS.map((denomination) => {
          const quantity = Math.max(
            0,
            Math.floor(Number((quantities as Record<string, unknown>)[String(denomination)])) || 0,
          )
          return { denomination, quantity, subtotal: denomination * quantity }
        })
        return [
          {
            breakdown,
            source: entry.source,
            total: breakdown.reduce((sum, row) => sum + row.subtotal, 0),
          },
        ]
      })
    } catch {
      return { error: 'Rincian pemasukan tidak valid.' }
    }
    if (!incomeEntries.length) return { error: 'Tambahkan minimal satu sumber pemasukan.' }
    if (new Set(incomeEntries.map((entry) => entry.source)).size !== incomeEntries.length) {
      return { error: 'Sumber pemasukan tidak boleh dipilih lebih dari satu kali.' }
    }
  }

  const supabase = await createClient()
  const activity = await supabase
    .from('activity_types')
    .select('id')
    .eq('id', activityType)
    .eq('active', true)
    .maybeSingle()
  if (activity.error || !activity.data) {
    return { error: 'Nama kegiatan tidak aktif atau tidak ditemukan.' }
  }

  if (hasIncome) {
    const sources = await supabase
      .from('income_sources')
      .select('id')
      .in(
        'id',
        incomeEntries.map((entry) => entry.source),
      )
      .eq('active', true)
    if (sources.error || (sources.data ?? []).length !== incomeEntries.length) {
      return { error: 'Salah satu sumber pemasukan tidak aktif atau tidak ditemukan.' }
    }
  }

  const created = await supabase
    .from('activity_records')
    .insert({
      activity_date: date,
      activity_time: time,
      activity_type_id: activityType,
      attendee_count: attendeeCount,
      has_income: hasIncome,
      notes: notes || null,
      place,
      recorded_by: user.id,
      sector_id: sector,
    })
    .select('id')
    .single()

  if (created.error || !created.data) {
    return { error: safeError(created.error, 'Kegiatan tidak dapat disimpan. Periksa seluruh isian.') }
  }

  if (hasIncome) {
    for (const entry of incomeEntries) {
      const saved = await supabase
        .from('activity_income_entries')
        .insert({ record_id: created.data.id, source_id: entry.source, total: entry.total })
        .select('id')
        .single()
      if (saved.error || !saved.data) {
        await supabase.from('activity_records').delete().eq('id', created.data.id)
        return { error: 'Rincian pemasukan tidak dapat disimpan.' }
      }
      const lines = await supabase.from('activity_income_lines').insert(
        entry.breakdown.map((row) => ({
          denomination: row.denomination,
          entry_id: saved.data.id,
          quantity: row.quantity,
          subtotal: row.subtotal,
        })),
      )
      if (lines.error) {
        await supabase.from('activity_records').delete().eq('id', created.data.id)
        return { error: 'Pecahan pemasukan tidak dapat disimpan.' }
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/kegiatan')
  return {
    href: `/kegiatan?tersimpan=${created.data.id}`,
    message: 'Kegiatan berhasil direkam.',
  }
}

export async function createHouseholdAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) {
    return { error: 'Anda tidak memiliki izin menambah keluarga.' }
  }

  const familyName = value(formData, 'familyName')
  const familyNumber = value(formData, 'familyNumber')
  const address = value(formData, 'address')
  const sector = assignedSector(user, value(formData, 'sector'))
  const notes = value(formData, 'notes')
  if (familyName.length < 2 || address.length < 5 || !sector) {
    return { error: 'Lengkapi nama keluarga, alamat, dan sektor.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('households').insert({
    address,
    family_name: familyName,
    family_number: familyNumber || null,
    notes: notes || null,
    sector_id: sector,
  })
  if (error) return { error: safeError(error, 'Data keluarga tidak dapat disimpan.') }

  revalidatePath('/keluarga')
  revalidatePath('/dashboard')
  return { message: 'Keluarga berhasil disimpan.' }
}

type RelationInput = {
  member?: string
  relationType?: 'child' | 'father' | 'husband' | 'mother' | 'wife'
}

const relationTypes = new Set(['child', 'father', 'husband', 'mother', 'wife'])
const familyRoles = new Set(['child', 'head', 'other', 'parent', 'spouse'])
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function getImage(formData: FormData, key: string): { error?: string; image?: File } {
  const entry = formData.get(key)
  if (!entry || typeof entry === 'string' || entry.size === 0) return {}
  if (!IMAGE_EXTENSIONS[entry.type]) {
    return { error: 'Foto harus berformat JPG, PNG, atau WebP.' }
  }
  if (entry.size > MAX_IMAGE_SIZE) {
    return { error: 'Ukuran setiap foto maksimal 5 MB.' }
  }
  return { image: entry }
}

export async function createMemberAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) {
    return { error: 'Anda tidak memiliki izin menambah jemaat.' }
  }

  const fullName = value(formData, 'fullName')
  const memberID = value(formData, 'memberID')
  const address = value(formData, 'address')
  const phone = value(formData, 'phone')
  const email = value(formData, 'email').toLowerCase()
  const nik = value(formData, 'nik').replace(/\D/g, '')
  const birthPlace = value(formData, 'birthPlace')
  const birthDate = value(formData, 'birthDate')
  const sector = assignedSector(user, value(formData, 'sector'))
  const household = value(formData, 'household')
  const familyRole = value(formData, 'familyRole')
  const profilePhoto = getImage(formData, 'profilePhoto')
  const selfiePhoto = getImage(formData, 'selfiePhoto')
  const photoError = profilePhoto.error || selfiePhoto.error
  if (photoError) return { error: photoError }
  if (memberID && !isUUID(memberID)) return { error: 'Data jemaat tidak valid.' }
  if (
    fullName.length < 3 ||
    address.length < 5 ||
    !phone ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    birthPlace.length < 2 ||
    nik.length !== 16 ||
    !birthDate ||
    !sector
  ) {
    return {
      error: 'Lengkapi data wajib. Email, tempat lahir, dan NIK 16 angka harus diisi dengan benar.',
      errorField: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? 'email'
        : birthPlace.length < 2
          ? 'birthPlace'
          : nik.length !== 16
            ? 'nik'
            : undefined,
    }
  }
  if (household && !isUUID(household)) return { error: 'Kartu keluarga tidak valid.' }
  if (familyRole && !familyRoles.has(familyRole)) return { error: 'Peran keluarga tidak valid.' }

  let relations: RelationInput[] = []
  try {
    const parsed = JSON.parse(value(formData, 'relations') || '[]')
    if (Array.isArray(parsed)) {
      relations = parsed.filter(
        (item): item is RelationInput =>
          Boolean(
            item &&
              typeof item.member === 'string' &&
              isUUID(item.member) &&
              typeof item.relationType === 'string' &&
              relationTypes.has(item.relationType),
          ),
      )
    }
  } catch {
    return { error: 'Data relasi keluarga tidak valid.' }
  }

  const supabase = await createClient()
  const duplicateNik = await supabase.rpc('search_member_ids_by_nik', { query: nik })
  if (!duplicateNik.error) {
    const clash = (duplicateNik.data ?? []).some((row: { id: string }) => row.id !== memberID)
    if (clash) return { error: 'NIK sudah terdaftar pada data jemaat lain.', errorField: 'nik' }
  }

  const memberData = {
    address,
    baptism_date: value(formData, 'baptismDate') || null,
    baptism_place: value(formData, 'baptismPlace') || null,
    birth_date: birthDate,
    birth_place: birthPlace,
    blessing_date: value(formData, 'blessingDate') || null,
    blessing_place: value(formData, 'blessingPlace') || null,
    confirmation_date: value(formData, 'confirmationDate') || null,
    confirmation_place: value(formData, 'confirmationPlace') || null,
    email,
    family_role: familyRole || null,
    full_name: fullName,
    household_id: household || null,
    nik,
    phone,
    previous_church: value(formData, 'previousChurch').slice(0, 200) || null,
    registered_since: value(formData, 'registeredSince') || null,
    sector_id: sector,
    status: 'active',
  }

  const saved = memberID
    ? await supabase.from('members').update(memberData).eq('id', memberID).select('id, sector_id').single()
    : await supabase.from('members').insert(memberData).select('id, sector_id').single()
  if (saved.error || !saved.data) {
    if (duplicate(saved.error, 'nik')) {
      return { error: 'NIK tidak valid atau sudah digunakan oleh jemaat lain.', errorField: 'nik' }
    }
    if (saved.error?.code === 'PGRST204' || saved.error?.message?.includes('schema cache')) {
      return {
        error:
          'Kolom baru belum ada di Supabase. Jalankan supabase/member-fields.sql dan supabase/member-membership.sql di SQL Editor, lalu simpan lagi.',
      }
    }
    return { error: safeError(saved.error, 'Data jemaat tidak dapat disimpan. Periksa NIK dan isian lain.') }
  }

  await supabase.from('member_relations').delete().eq('member_id', saved.data.id)
  if (relations.length) {
    const relationResult = await supabase.from('member_relations').insert(
      relations.map((relation) => ({
        member_id: saved.data.id,
        related_member_id: relation.member,
        relation_type: relation.relationType,
      })),
    )
    if (relationResult.error) {
      return {
        href: `/jemaat/${saved.data.id}`,
        message: 'Data jemaat tersimpan, tetapi relasi keluarga gagal diperbarui.',
      }
    }
  }

  const failedPhotos: string[] = []
  const photoUpdates: { profile_photo_path?: string; selfie_photo_path?: string } = {}

  for (const photo of [
    { image: profilePhoto.image, kind: 'profile' as const, label: 'foto profil' },
    { image: selfiePhoto.image, kind: 'selfie' as const, label: 'foto selfie' },
  ]) {
    if (!photo.image) continue
    const extension = IMAGE_EXTENSIONS[photo.image.type]
    const storagePath = `${saved.data.sector_id}/${saved.data.id}/${photo.kind}-${crypto.randomUUID()}.${extension}`
    const uploaded = await supabase.storage.from('member-photos').upload(storagePath, photo.image, {
      contentType: photo.image.type,
    })
    if (uploaded.error) {
      failedPhotos.push(photo.label)
      continue
    }
    const recorded = await supabase.from('member_photos').insert({
      alt: `${photo.label} ${fullName}`,
      kind: photo.kind,
      member_id: saved.data.id,
      sector_id: saved.data.sector_id,
      storage_path: storagePath,
    })
    if (recorded.error) {
      failedPhotos.push(photo.label)
      continue
    }
    photoUpdates[photo.kind === 'profile' ? 'profile_photo_path' : 'selfie_photo_path'] = storagePath
  }

  if (Object.keys(photoUpdates).length) {
    await supabase.from('members').update(photoUpdates).eq('id', saved.data.id)
  }

  revalidatePath('/dashboard')
  revalidatePath('/jemaat')
  revalidatePath(`/jemaat/${saved.data.id}`)

  return {
    href: `/jemaat/${saved.data.id}`,
    message: failedPhotos.length
      ? `Data jemaat tersimpan, tetapi ${failedPhotos.join(' dan ')} gagal diunggah.`
      : memberID
        ? 'Data jemaat berhasil diperbarui.'
        : 'Data jemaat berhasil disimpan.',
  }
}

const textValue = (formData: FormData, key: string, maxLength = 2000) => {
  const result = value(formData, key)
  return result ? result.slice(0, maxLength) : undefined
}

const selectedValue = <const T extends readonly string[]>(
  formData: FormData,
  key: string,
  allowed: T,
): T[number] | undefined => {
  const result = value(formData, key)
  return allowed.includes(result) ? (result as T[number]) : undefined
}

const selectedValues = <const T extends readonly string[]>(
  formData: FormData,
  key: string,
  allowed: T,
): T[number][] =>
  formData
    .getAll(key)
    .map(String)
    .filter((item): item is T[number] => allowed.includes(item))

const checkboxValue = (formData: FormData, key: string) => formData.get(key) === 'on'

const numberValue = (formData: FormData, key: string, maximum = 1_000_000_000) => {
  const parsed = Number(value(formData, key))
  return Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, maximum) : undefined
}

const trainingPrograms = (formData: FormData) => {
  const raw = value(formData, 'ppsdiPpk.programs')
  if (!raw) return { programs: [] as Array<{ category: string; name: string; notes?: string; year: string }> }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: 'Daftar program pembinaan tidak valid.', programs: [] }
  }
  if (!Array.isArray(parsed)) {
    return { error: 'Daftar program pembinaan tidak valid.', programs: [] }
  }

  const programs: Array<{ category: string; name: string; notes?: string; year: string }> = []
  for (const item of parsed.slice(0, 30)) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const name = String(row.name ?? '').trim().slice(0, 160)
    if (!name) continue
    const year = String(row.year ?? '').trim()
    const category = String(row.category ?? '')
    const notes = String(row.notes ?? '').trim().slice(0, 500)
    if (!/^\d{4}$/.test(year) || Number(year) < 1900 || Number(year) > 2100) {
      return { error: 'Tahun pembinaan harus diisi dengan tahun yang valid.', programs: [] }
    }
    if (category !== 'gerejawi' && category !== 'profesional') {
      return { error: 'Kategori program harus Gerejawi atau Profesional.', programs: [] }
    }
    programs.push({ category, name, ...(notes ? { notes } : {}), year })
  }
  return { programs }
}

export async function saveAdvancedMemberDataAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) {
    return { error: 'Anda tidak memiliki izin mengelola data lanjutan.' }
  }

  const memberID = value(formData, 'member')
  if (!isUUID(memberID)) return { error: 'Data jemaat tidak ditemukan.' }

  const supabase = await createClient()
  const member = await supabase
    .from('members')
    .select('id, sector_id')
    .eq('id', memberID)
    .maybeSingle()
  if (member.error || !member.data) {
    return { error: 'Jemaat tidak ditemukan atau berada di luar sektor tugas Anda.' }
  }

  const parsedPrograms = trainingPrograms(formData)
  if (parsedPrograms.error) return { error: parsedPrograms.error }

  const data = {
    gemasa: {
      communityRoles: selectedValues(formData, 'gemasa.communityRoles', [
        'neighborhood',
        'family-health',
        'youth',
        'community-leader',
        'volunteer',
        'professional',
      ]),
      communitySkills: textValue(formData, 'gemasa.communitySkills'),
      domicileStatus: selectedValue(formData, 'gemasa.domicileStatus', [
        'resident',
        'migrant',
        'temporary',
        'away',
      ]),
      mobilityNotes: textValue(formData, 'gemasa.mobilityNotes'),
      populationDocumentStatus: selectedValue(formData, 'gemasa.populationDocumentStatus', [
        'matched',
        'different',
        'processing',
        'incomplete',
      ]),
      residenceOwnership: selectedValue(formData, 'gemasa.residenceOwnership', [
        'owned',
        'rented',
        'family',
        'official',
        'other',
      ]),
      yearsAtAddress: numberValue(formData, 'gemasa.yearsAtAddress', 150),
    },
    member_id: member.data.id,
    pegp: {
      businessName: textValue(formData, 'pegp.businessName', 200),
      businessNeeds: selectedValues(formData, 'pegp.businessNeeds', [
        'capital',
        'training',
        'licensing',
        'marketing',
        'digitalization',
        'mentoring',
      ]),
      businessScale: selectedValue(formData, 'pegp.businessScale', [
        'starter',
        'micro',
        'small',
        'medium',
      ]),
      businessType: selectedValue(formData, 'pegp.businessType', [
        'Kuliner',
        'Perdagangan',
        'Jasa',
        'Pertanian/Perikanan',
        'Kerajinan',
        'Teknologi/Digital',
        'Transportasi',
        'Lainnya',
      ]),
      canSupportCensus: checkboxValue(formData, 'pegp.canSupportCensus'),
      censusContributionBudget: numberValue(formData, 'pegp.censusContributionBudget'),
      economicCondition: selectedValue(formData, 'pegp.economicCondition', [
        'very-vulnerable',
        'vulnerable',
        'stable',
        'growing',
      ]),
      economicNotes: textValue(formData, 'pegp.economicNotes'),
      employeeCount: numberValue(formData, 'pegp.employeeCount', 100_000),
      hasBusiness: checkboxValue(formData, 'pegp.hasBusiness'),
      marketChannels: selectedValues(formData, 'pegp.marketChannels', [
        'offline',
        'social-media',
        'marketplace',
        'community',
        'none',
      ]),
      monthlyIncomeRange: selectedValue(formData, 'pegp.monthlyIncomeRange', [
        'under-1m',
        '1m-3m',
        '3m-5m',
        '5m-10m',
        'over-10m',
        'prefer-not',
      ]),
    },
    ppsdi_ppk: {
      availability: selectedValue(formData, 'ppsdiPpk.availability', [
        'weekday',
        'weekend',
        'evening',
        'flexible',
      ]),
      cadreLevel: selectedValue(formData, 'ppsdiPpk.cadreLevel', [
        'unmapped',
        'potential',
        'ready',
        'active',
      ]),
      educationLevel: selectedValue(formData, 'ppsdiPpk.educationLevel', [
        'Tidak sekolah',
        'SD',
        'SMP',
        'SMA/SMK',
        'Diploma',
        'Sarjana',
        'Pascasarjana',
      ]),
      employmentStatus: selectedValue(formData, 'ppsdiPpk.employmentStatus', [
        'employed',
        'freelance',
        'entrepreneur',
        'student',
        'retired',
        'unemployed',
      ]),
      occupation: textValue(formData, 'ppsdiPpk.occupation', 200),
      professionalSkills: textValue(formData, 'ppsdiPpk.professionalSkills'),
      programs: parsedPrograms.programs,
      talents: selectedValues(formData, 'ppsdiPpk.talents', [
        'music',
        'liturgy',
        'teaching',
        'administration',
        'technology',
        'health',
        'legal',
        'engineering',
        'business',
        'agriculture',
        'communication',
      ]),
      trainingNeeds: textValue(formData, 'ppsdiPpk.trainingNeeds'),
      willingDataCollector: checkboxValue(formData, 'ppsdiPpk.willingDataCollector'),
    },
    sector_id: member.data.sector_id,
    service_witness: {
      assistanceTypes: selectedValues(formData, 'serviceWitness.assistanceTypes', [
        'food',
        'health',
        'education',
        'housing',
        'employment',
        'disability',
        'elderly',
        'disaster',
        'counseling',
      ]),
      assistanceUrgency: selectedValue(formData, 'serviceWitness.assistanceUrgency', [
        'monitor',
        'needed',
        'priority',
        'emergency',
      ]),
      receivesDiakonia: checkboxValue(formData, 'serviceWitness.receivesDiakonia'),
      serviceAreas: selectedValues(formData, 'serviceWitness.serviceAreas', [
        'diakonia',
        'evangelism',
        'visitation',
        'prayer',
        'social',
        'environment',
      ]),
      serviceParticipation: selectedValue(formData, 'serviceWitness.serviceParticipation', [
        'active',
        'occasional',
        'inactive',
        'interested',
      ]),
      vulnerableGroups: selectedValues(formData, 'serviceWitness.vulnerableGroups', [
        'toddler',
        'pregnant',
        'elderly',
        'disability',
        'chronic-illness',
        'single-parent',
        'unemployed',
      ]),
      witnessNotes: textValue(formData, 'serviceWitness.witnessNotes'),
    },
    theology: {
      communionParticipation: selectedValue(formData, 'theology.communionParticipation', [
        'active',
        'irregular',
        'not-yet',
        'unknown',
      ]),
      lastCommunionDate: textValue(formData, 'theology.lastCommunionDate', 30),
      marriageBlessingStatus: selectedValue(formData, 'theology.marriageBlessingStatus', [
        'church-blessed',
        'not-blessed',
        'not-married',
        'not-applicable',
      ]),
      pastoralCareStatus: selectedValue(formData, 'theology.pastoralCareStatus', [
        'none',
        'needed',
        'ongoing',
        'completed',
      ]),
      pastoralNeeds: selectedValues(formData, 'theology.pastoralNeeds', [
        'faith',
        'family',
        'grief',
        'health',
        'youth',
        'elderly',
        'recovery',
        'personal',
      ]),
      pastoralNotes: textValue(formData, 'theology.pastoralNotes'),
      pastoralPriority: selectedValue(formData, 'theology.pastoralPriority', [
        'low',
        'medium',
        'high',
        'urgent',
      ]),
      worshipFrequency: selectedValue(formData, 'theology.worshipFrequency', [
        'weekly',
        'monthly-often',
        'sometimes',
        'inactive',
      ]),
    },
  }

  const existing = await supabase
    .from('advanced_member_data')
    .select('id')
    .eq('member_id', member.data.id)
    .maybeSingle()
  if (existing.error) return { error: 'Data lanjutan tidak dapat disimpan.' }

  const result = existing.data
    ? await supabase.from('advanced_member_data').update(data).eq('id', existing.data.id)
    : await supabase.from('advanced_member_data').insert(data)
  if (result.error) return { error: safeError(result.error, 'Data lanjutan tidak dapat disimpan.') }

  revalidatePath(`/jemaat/${member.data.id}/lanjutan`)
  return { message: 'Data lanjutan lima bidang berhasil disimpan.' }
}

export async function updateProfileAccessAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user || user.role !== 'admin') {
    return { error: 'Hanya admin yang dapat mengatur hak akses.' }
  }

  const profileID = value(formData, 'profile')
  const role = value(formData, 'role')
  const sector = value(formData, 'sector')
  const household = value(formData, 'household')
  if (!isUUID(profileID) || !['admin', 'sector-officer', 'member'].includes(role)) {
    return { error: 'Pilih akun dan hak akses yang valid.' }
  }
  if (role === 'sector-officer' && !isUUID(sector)) {
    return { error: 'Petugas sektor wajib memiliki sektor tugas.' }
  }
  if (sector && !isUUID(sector)) return { error: 'Sektor tidak valid.' }
  if (household && !isUUID(household)) return { error: 'Kartu keluarga tidak valid.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      household_id: household || null,
      role,
      sector_id: sector || null,
    })
    .eq('id', profileID)
  if (error) return { error: 'Hak akses tidak dapat diperbarui.' }

  revalidatePath('/pengaturan')
  return { message: 'Hak akses akun berhasil diperbarui.' }
}

export async function claimFirstAdminAction(
  _: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await appAuth.currentUser()
  if (!user) return { error: 'Masuk terlebih dahulu.' }
  if (user.role === 'admin') return { message: 'Akun ini sudah admin.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('claim_first_admin')
  if (error) return { error: 'Admin pertama belum bisa dibuat. Jalankan skema Supabase yang terbaru.' }

  revalidatePath('/dashboard')
  revalidatePath('/pengaturan')
  return { href: '/pengaturan', message: 'Akun ini sekarang admin aplikasi.' }
}
