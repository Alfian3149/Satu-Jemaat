'use client'

import { useActionState, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Church,
  GraduationCap,
  HeartHandshake,
  LoaderCircle,
  MapPinned,
  Plus,
  Save,
  Store,
  Trash2,
} from 'lucide-react'
import { saveAdvancedMemberDataAction, type ActionState } from '@/app/(frontend)/actions'

type InitialData = Record<string, unknown>
type Option = readonly [value: string, label: string]

export function AdvancedMemberForm({
  initial,
  memberID,
}: {
  initial: InitialData
  memberID: string
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveAdvancedMemberDataAction,
    {},
  )
  const [step, setStep] = useState(0)
  const [highestStep, setHighestStep] = useState(0)
  const readInitialValue = (path: string) =>
    path.split('.').reduce<unknown>((current, key) => {
      if (!current || typeof current !== 'object') return undefined
      return (current as Record<string, unknown>)[key]
    }, initial)

  const initialValue = (path: string) => {
    const result = readInitialValue(path)
    return typeof result === 'string' || typeof result === 'number' ? String(result) : ''
  }
  const initialBoolean = (path: string) => readInitialValue(path) === true
  const initialList = (path: string) => {
    const result = readInitialValue(path)
    return Array.isArray(result) ? result.map(String) : []
  }

  return (
    <form action={formAction} className="space-y-6">
      <input name="member" type="hidden" value={memberID} />

      <AdvancedStepper
        current={step}
        highest={highestStep}
        labels={['Teologi', 'PelKes', 'Germasa', 'PPSDI–PPK', 'PEG']}
        onSelect={setStep}
      />

      <AdvancedSection
        active={step === 0}
        description="Data sakramen, kebiasaan beribadah, dan kebutuhan tindak lanjut pastoral."
        icon={Church}
        number="1"
        title="Teologi"
        tone="emerald"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={initialValue('theology.worshipFrequency')}
            label="Kehadiran ibadah"
            name="theology.worshipFrequency"
            options={[
              ['weekly', 'Rutin setiap minggu'],
              ['monthly-often', '2–3 kali sebulan'],
              ['sometimes', 'Sesekali'],
              ['inactive', 'Belum aktif beribadah'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('theology.communionParticipation')}
            label="Partisipasi Perjamuan Kudus"
            name="theology.communionParticipation"
            options={[
              ['active', 'Aktif'],
              ['irregular', 'Tidak rutin'],
              ['not-yet', 'Belum dapat mengikuti'],
              ['unknown', 'Belum diketahui'],
            ]}
          />
          <InputField
            defaultValue={initialValue('theology.lastCommunionDate').slice(0, 10)}
            label="Terakhir mengikuti Perjamuan Kudus"
            name="theology.lastCommunionDate"
            type="date"
          />
          <SelectField
            defaultValue={initialValue('theology.marriageBlessingStatus')}
            label="Pemberkatan perkawinan"
            name="theology.marriageBlessingStatus"
            options={[
              ['church-blessed', 'Sudah diberkati di gereja'],
              ['not-blessed', 'Menikah, belum diberkati'],
              ['not-married', 'Belum menikah'],
              ['not-applicable', 'Tidak relevan'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('theology.pastoralCareStatus')}
            label="Status pendampingan"
            name="theology.pastoralCareStatus"
            options={[
              ['none', 'Tidak membutuhkan saat ini'],
              ['needed', 'Perlu dijadwalkan'],
              ['ongoing', 'Sedang didampingi'],
              ['completed', 'Tindak lanjut selesai'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('theology.pastoralPriority')}
            label="Prioritas tindak lanjut"
            name="theology.pastoralPriority"
            options={[
              ['low', 'Rendah'],
              ['medium', 'Sedang'],
              ['high', 'Tinggi'],
              ['urgent', 'Mendesak'],
            ]}
          />
        </div>
        <CheckGroup
          initial={initialList('theology.pastoralNeeds')}
          label="Arahan/kebutuhan pastoral"
          name="theology.pastoralNeeds"
          options={[
            ['faith', 'Penguatan iman'],
            ['family', 'Pernikahan & keluarga'],
            ['grief', 'Kedukaan'],
            ['health', 'Kesehatan'],
            ['youth', 'Anak & remaja'],
            ['elderly', 'Lanjut usia'],
            ['recovery', 'Pemulihan kecanduan'],
            ['personal', 'Konseling pribadi'],
          ]}
        />
        <TextAreaField
          defaultValue={initialValue('theology.pastoralNotes')}
          label="Catatan pastoral rahasia"
          name="theology.pastoralNotes"
        />
      </AdvancedSection>

      <AdvancedSection
        active={step === 1}
        description="Pemetaan kebutuhan diakonia, kerentanan keluarga, dan keterlibatan kesaksian."
        icon={HeartHandshake}
        number="2"
        title="PelKes"
        tone="amber"
      >
        <CheckboxField
          defaultChecked={initialBoolean('serviceWitness.receivesDiakonia')}
          label="Sedang menerima bantuan diakonia"
          name="serviceWitness.receivesDiakonia"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={initialValue('serviceWitness.assistanceUrgency')}
            label="Tingkat kebutuhan bantuan"
            name="serviceWitness.assistanceUrgency"
            options={[
              ['monitor', 'Pemantauan'],
              ['needed', 'Perlu bantuan'],
              ['priority', 'Prioritas'],
              ['emergency', 'Darurat'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('serviceWitness.serviceParticipation')}
            label="Keterlibatan pelayanan"
            name="serviceWitness.serviceParticipation"
            options={[
              ['active', 'Aktif'],
              ['occasional', 'Sesekali'],
              ['inactive', 'Belum aktif'],
              ['interested', 'Ingin mulai melayani'],
            ]}
          />
        </div>
        <CheckGroup
          initial={initialList('serviceWitness.assistanceTypes')}
          label="Jenis bantuan yang dibutuhkan"
          name="serviceWitness.assistanceTypes"
          options={[
            ['food', 'Pangan'],
            ['health', 'Kesehatan'],
            ['education', 'Pendidikan'],
            ['housing', 'Perumahan'],
            ['employment', 'Pekerjaan'],
            ['disability', 'Disabilitas'],
            ['elderly', 'Lanjut usia'],
            ['disaster', 'Tanggap bencana'],
            ['counseling', 'Konseling'],
          ]}
        />
        <CheckGroup
          initial={initialList('serviceWitness.vulnerableGroups')}
          label="Kelompok rentan dalam keluarga"
          name="serviceWitness.vulnerableGroups"
          options={[
            ['toddler', 'Balita'],
            ['pregnant', 'Ibu hamil'],
            ['elderly', 'Lanjut usia'],
            ['disability', 'Disabilitas'],
            ['chronic-illness', 'Penyakit kronis'],
            ['single-parent', 'Orang tua tunggal'],
            ['unemployed', 'Pengangguran'],
          ]}
        />
        <CheckGroup
          initial={initialList('serviceWitness.serviceAreas')}
          label="Bidang pelayanan/kesaksian"
          name="serviceWitness.serviceAreas"
          options={[
            ['diakonia', 'Diakonia'],
            ['evangelism', 'Penginjilan'],
            ['visitation', 'Kunjungan'],
            ['prayer', 'Doa'],
            ['social', 'Pelayanan sosial'],
            ['environment', 'Lingkungan hidup'],
          ]}
        />
        <TextAreaField
          defaultValue={initialValue('serviceWitness.witnessNotes')}
          label="Catatan potensi kesaksian"
          name="serviceWitness.witnessNotes"
        />
      </AdvancedSection>

      <AdvancedSection
        active={step === 2}
        description="Domisili, kesesuaian data kependudukan, peran, dan keahlian kemasyarakatan."
        icon={MapPinned}
        number="3"
        title="Germasa"
        tone="blue"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={initialValue('gemasa.domicileStatus')}
            label="Status domisili"
            name="gemasa.domicileStatus"
            options={[
              ['resident', 'Menetap di alamat terdata'],
              ['migrant', 'Pendatang'],
              ['temporary', 'Tinggal sementara'],
              ['away', 'Di luar daerah/negeri'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('gemasa.residenceOwnership')}
            label="Status tempat tinggal"
            name="gemasa.residenceOwnership"
            options={[
              ['owned', 'Milik sendiri'],
              ['rented', 'Sewa/kontrak'],
              ['family', 'Menumpang keluarga'],
              ['official', 'Rumah dinas/asrama'],
              ['other', 'Lainnya'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('gemasa.populationDocumentStatus')}
            label="Dokumen kependudukan"
            name="gemasa.populationDocumentStatus"
            options={[
              ['matched', 'Sesuai domisili'],
              ['different', 'Alamat dokumen berbeda'],
              ['processing', 'Sedang diproses'],
              ['incomplete', 'Belum lengkap'],
            ]}
          />
          <InputField
            defaultValue={initialValue('gemasa.yearsAtAddress')}
            label="Lama tinggal (tahun)"
            min="0"
            name="gemasa.yearsAtAddress"
            type="number"
          />
        </div>
        <CheckGroup
          initial={initialList('gemasa.communityRoles')}
          label="Peran kemasyarakatan"
          name="gemasa.communityRoles"
          options={[
            ['neighborhood', 'RT/RW'],
            ['family-health', 'PKK/Posyandu'],
            ['youth', 'Karang Taruna'],
            ['community-leader', 'Tokoh adat/masyarakat'],
            ['volunteer', 'Relawan'],
            ['professional', 'Organisasi profesi'],
          ]}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextAreaField
            defaultValue={initialValue('gemasa.communitySkills')}
            label="Keahlian kemasyarakatan"
            name="gemasa.communitySkills"
          />
          <TextAreaField
            defaultValue={initialValue('gemasa.mobilityNotes')}
            label="Catatan mobilitas/domisili"
            name="gemasa.mobilityNotes"
          />
        </div>
      </AdvancedSection>

      <AdvancedSection
        active={step === 3}
        description="Pemetaan pendidikan, profesi, talenta, kebutuhan pelatihan, dan kesiapan kader."
        icon={GraduationCap}
        number="4"
        title="PPSDI - PPK"
        tone="violet"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={initialValue('ppsdiPpk.educationLevel')}
            label="Pendidikan terakhir"
            name="ppsdiPpk.educationLevel"
            options={[
              ['Tidak sekolah', 'Tidak sekolah'],
              ['SD', 'SD'],
              ['SMP', 'SMP'],
              ['SMA/SMK', 'SMA/SMK'],
              ['Diploma', 'Diploma'],
              ['Sarjana', 'Sarjana'],
              ['Pascasarjana', 'Pascasarjana'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('ppsdiPpk.employmentStatus')}
            label="Status pekerjaan"
            name="ppsdiPpk.employmentStatus"
            options={[
              ['employed', 'Bekerja tetap'],
              ['freelance', 'Pekerja lepas'],
              ['entrepreneur', 'Wirausaha'],
              ['student', 'Pelajar/mahasiswa'],
              ['retired', 'Pensiun'],
              ['unemployed', 'Belum bekerja'],
            ]}
          />
          <InputField
            defaultValue={initialValue('ppsdiPpk.occupation')}
            label="Pekerjaan/profesi"
            name="ppsdiPpk.occupation"
          />
          <SelectField
            defaultValue={initialValue('ppsdiPpk.cadreLevel')}
            label="Pemetaan kader"
            name="ppsdiPpk.cadreLevel"
            options={[
              ['unmapped', 'Belum dipetakan'],
              ['potential', 'Calon potensial'],
              ['ready', 'Siap dikerahkan'],
              ['active', 'Kader aktif'],
            ]}
          />
        </div>
        <TextAreaField
          defaultValue={initialValue('ppsdiPpk.professionalSkills')}
          label="Keahlian profesional"
          name="ppsdiPpk.professionalSkills"
        />
        <CheckGroup
          initial={initialList('ppsdiPpk.talents')}
          label="Talenta dan kompetensi"
          name="ppsdiPpk.talents"
          options={[
            ['music', 'Musik & vokal'],
            ['liturgy', 'Liturgi'],
            ['teaching', 'Mengajar'],
            ['administration', 'Administrasi'],
            ['technology', 'Teknologi/data'],
            ['health', 'Kesehatan'],
            ['legal', 'Hukum'],
            ['engineering', 'Konstruksi/teknik'],
            ['business', 'Kewirausahaan'],
            ['agriculture', 'Pertanian/perikanan'],
            ['communication', 'Komunikasi/media'],
          ]}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextAreaField
            defaultValue={initialValue('ppsdiPpk.trainingNeeds')}
            label="Pelatihan yang dibutuhkan"
            name="ppsdiPpk.trainingNeeds"
          />
          <SelectField
            defaultValue={initialValue('ppsdiPpk.availability')}
            label="Ketersediaan waktu"
            name="ppsdiPpk.availability"
            options={[
              ['weekday', 'Hari kerja'],
              ['weekend', 'Akhir pekan'],
              ['evening', 'Malam hari'],
              ['flexible', 'Fleksibel'],
            ]}
          />
        </div>
        <CheckboxField
          defaultChecked={initialBoolean('ppsdiPpk.willingDataCollector')}
          label="Bersedia menjadi kader pendata"
          name="ppsdiPpk.willingDataCollector"
        />
        <TrainingPrograms initial={readPrograms(initial)} />
      </AdvancedSection>

      <AdvancedSection
        active={step === 4}
        description="Kondisi ekonomi, potensi UMKM, kebutuhan pengembangan, dan dukungan anggaran sensus."
        icon={Store}
        number="5"
        title="PEG"
        tone="rose"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={initialValue('pegp.economicCondition')}
            label="Kondisi ekonomi keluarga"
            name="pegp.economicCondition"
            options={[
              ['very-vulnerable', 'Sangat rentan'],
              ['vulnerable', 'Rentan'],
              ['stable', 'Stabil'],
              ['growing', 'Berkembang'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('pegp.monthlyIncomeRange')}
            label="Rentang pendapatan bulanan"
            name="pegp.monthlyIncomeRange"
            options={[
              ['under-1m', 'Di bawah Rp1 juta'],
              ['1m-3m', 'Rp1–3 juta'],
              ['3m-5m', 'Rp3–5 juta'],
              ['5m-10m', 'Rp5–10 juta'],
              ['over-10m', 'Di atas Rp10 juta'],
              ['prefer-not', 'Tidak bersedia menjawab'],
            ]}
          />
        </div>
        <CheckboxField
          defaultChecked={initialBoolean('pegp.hasBusiness')}
          label="Memiliki usaha/UMKM"
          name="pegp.hasBusiness"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            defaultValue={initialValue('pegp.businessName')}
            label="Nama usaha"
            name="pegp.businessName"
          />
          <SelectField
            defaultValue={initialValue('pegp.businessType')}
            label="Bidang usaha"
            name="pegp.businessType"
            options={[
              ['Kuliner', 'Kuliner'],
              ['Perdagangan', 'Perdagangan'],
              ['Jasa', 'Jasa'],
              ['Pertanian/Perikanan', 'Pertanian/Perikanan'],
              ['Kerajinan', 'Kerajinan'],
              ['Teknologi/Digital', 'Teknologi/Digital'],
              ['Transportasi', 'Transportasi'],
              ['Lainnya', 'Lainnya'],
            ]}
          />
          <SelectField
            defaultValue={initialValue('pegp.businessScale')}
            label="Skala usaha"
            name="pegp.businessScale"
            options={[
              ['starter', 'Rintisan'],
              ['micro', 'Mikro'],
              ['small', 'Kecil'],
              ['medium', 'Menengah'],
            ]}
          />
          <InputField
            defaultValue={initialValue('pegp.employeeCount')}
            label="Jumlah tenaga kerja"
            min="0"
            name="pegp.employeeCount"
            type="number"
          />
        </div>
        <CheckGroup
          initial={initialList('pegp.marketChannels')}
          label="Saluran pemasaran"
          name="pegp.marketChannels"
          options={[
            ['offline', 'Toko/lokasi fisik'],
            ['social-media', 'Media sosial'],
            ['marketplace', 'Marketplace'],
            ['community', 'Pesanan komunitas'],
            ['none', 'Belum dipasarkan'],
          ]}
        />
        <CheckGroup
          initial={initialList('pegp.businessNeeds')}
          label="Kebutuhan pengembangan usaha"
          name="pegp.businessNeeds"
          options={[
            ['capital', 'Modal'],
            ['training', 'Pelatihan'],
            ['licensing', 'Perizinan'],
            ['marketing', 'Pemasaran'],
            ['digitalization', 'Digitalisasi'],
            ['mentoring', 'Pendampingan'],
          ]}
        />
        <CheckboxField
          defaultChecked={initialBoolean('pegp.canSupportCensus')}
          label="Bersedia mendukung anggaran sensus"
          name="pegp.canSupportCensus"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            defaultValue={initialValue('pegp.censusContributionBudget')}
            label="Potensi dukungan anggaran sensus (Rp)"
            min="0"
            name="pegp.censusContributionBudget"
            type="number"
          />
          <TextAreaField
            defaultValue={initialValue('pegp.economicNotes')}
            label="Catatan potensi ekonomi"
            name="pegp.economicNotes"
          />
        </div>
      </AdvancedSection>

      {state.error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-800"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="size-5" />
          {state.message}
        </p>
      )}
      <div className="sticky bottom-24 z-20 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-4">
        <button
          className="secondary-button disabled:invisible"
          disabled={step === 0}
          onClick={() => {
            setStep((current) => Math.max(current - 1, 0))
            window.scrollTo({ behavior: 'smooth', top: 0 })
          }}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </button>
        <span className="hidden text-sm font-bold text-slate-500 sm:block">
          Bidang {step + 1} dari 5
        </span>
        {step < 4 ? (
          <button
            className="primary-button"
            onClick={() => {
              const nextStep = Math.min(step + 1, 4)
              setStep(nextStep)
              setHighestStep((current) => Math.max(current, nextStep))
              window.scrollTo({ behavior: 'smooth', top: 0 })
            }}
            type="button"
          >
            Lanjut
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        ) : (
          <button className="primary-button" disabled={pending} type="submit">
            {pending ? (
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-5" />
            )}
            {pending ? 'Menyimpan…' : 'Simpan seluruh data'}
          </button>
        )}
      </div>
    </form>
  )
}

type TrainingProgram = {
  category: 'gerejawi' | 'profesional'
  name: string
  notes: string
  year: string
}

function readPrograms(initial: InitialData): TrainingProgram[] {
  const source = initial.ppsdiPpk
  if (!source || typeof source !== 'object') return []
  const programs = (source as Record<string, unknown>).programs
  if (!Array.isArray(programs)) return []
  return programs.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const name = typeof row.name === 'string' ? row.name : ''
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? String(row.year) : ''
    const notes = typeof row.notes === 'string' ? row.notes : ''
    if (!name) return []
    if (row.category !== 'gerejawi' && row.category !== 'profesional') return []
    return [{ category: row.category, name, notes, year }]
  })
}

function TrainingPrograms({ initial }: { initial: TrainingProgram[] }) {
  const [rows, setRows] = useState<TrainingProgram[]>(initial)
  const update = (index: number, patch: Partial<TrainingProgram>) =>
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))

  return (
    <div className="space-y-3">
      <input name="ppsdiPpk.programs" type="hidden" value={JSON.stringify(rows)} />
      <div>
        <h3 className="font-extrabold text-slate-950">Program pembinaan yang pernah diikuti</h3>
        <p className="mt-1 text-sm text-slate-500">
          Tambahkan setiap pelatihan atau pembinaan. Baris tanpa nama tidak disimpan.
        </p>
      </div>
      {rows.map((row, index) => (
        <div
          className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"
          key={index}
        >
          <label className="sm:col-span-2">
            <span className="field-label">Nama pelatihan/pembinaan</span>
            <input
              className="form-control"
              onChange={(event) => update(index, { name: event.target.value })}
              placeholder="Contoh: Pembinaan penatua"
              value={row.name}
            />
          </label>
          <label>
            <span className="field-label">Tahun pembinaan</span>
            <input
              className="form-control"
              inputMode="numeric"
              maxLength={4}
              onChange={(event) => update(index, { year: event.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="2024"
              value={row.year}
            />
          </label>
          <label>
            <span className="field-label">Kategori</span>
            <select
              className="form-control"
              onChange={(event) =>
                update(index, { category: event.target.value as TrainingProgram['category'] })
              }
              value={row.category}
            >
              <option value="gerejawi">Gerejawi</option>
              <option value="profesional">Profesional</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Keterangan</span>
            <textarea
              className="form-control min-h-24 resize-y"
              onChange={(event) => update(index, { notes: event.target.value })}
              placeholder="Penyelenggara, tempat, atau catatan singkat"
              value={row.notes}
            />
          </label>
          <button
            className="secondary-button justify-self-start text-red-700"
            onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-5" />
            Hapus program
          </button>
        </div>
      ))}
      <button
        className="secondary-button"
        onClick={() =>
          setRows((current) => [...current, { category: 'gerejawi', name: '', notes: '', year: '' }])
        }
        type="button"
      >
        <Plus aria-hidden="true" className="size-5" />
        Tambah program
      </button>
    </div>
  )
}

function AdvancedStepper({
  current,
  highest,
  labels,
  onSelect,
}: {
  current: number
  highest: number
  labels: string[]
  onSelect: (step: number) => void
}) {
  return (
    <nav
      aria-label="Bidang data lanjutan"
      className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <ol className="grid grid-cols-5 gap-2">
        {labels.map((label, index) => {
          const available = index <= highest
          const completed = index < current || index < highest

          return (
            <li key={label}>
              <button
                aria-current={index === current ? 'step' : undefined}
                aria-label={`Bidang ${index + 1}: ${label}`}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-extrabold transition sm:px-2 ${
                  index === current
                    ? 'bg-church-deep text-white'
                    : available
                      ? 'bg-church-sky-soft text-church-deep'
                      : 'bg-slate-50 text-slate-400'
                }`}
                disabled={!available}
                onClick={() => onSelect(index)}
                type="button"
              >
                <span className="grid size-6 place-items-center rounded-full bg-white/20">
                  {completed ? <Check aria-hidden="true" className="size-4" /> : index + 1}
                </span>
                <span className="hidden sm:block">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-center text-sm font-bold text-church-deep sm:hidden">
        {labels[current]}
      </p>
    </nav>
  )
}

const toneClasses = {
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  rose: 'bg-rose-100 text-rose-800',
  violet: 'bg-violet-100 text-violet-800',
}

function AdvancedSection({
  active,
  children,
  description,
  icon: Icon,
  number,
  title,
  tone,
}: {
  active: boolean
  children: React.ReactNode
  description: string
  icon: typeof Church
  number: string
  title: string
  tone: keyof typeof toneClasses
}) {
  return (
    <section
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      hidden={!active}
    >
      <div className="flex items-start gap-4">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
            Bidang {number}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="form-control" {...props} />
    </label>
  )
}

function SelectField({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Option[] }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="form-control" {...props}>
        <option value="">Belum diisi</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextAreaField({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea className="form-control min-h-28 resize-y" {...props} />
    </label>
  )
}

function CheckboxField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold text-slate-800">
      <input className="size-5 accent-church-roof" type="checkbox" {...props} />
      {label}
    </label>
  )
}

function CheckGroup({
  initial,
  label,
  name,
  options,
}: {
  initial: string[]
  label: string
  name: string
  options: Option[]
}) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(([optionValue, optionLabel]) => (
          <label
            className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-3 font-semibold text-slate-700 hover:bg-slate-50"
            key={optionValue}
          >
            <input
              className="size-5 accent-church-roof"
              defaultChecked={initial.includes(optionValue)}
              name={name}
              type="checkbox"
              value={optionValue}
            />
            {optionLabel}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
