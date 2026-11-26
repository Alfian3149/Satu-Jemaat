'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ImagePlus,
  Lightbulb,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { createMemberAction, type ActionState } from '@/app/(frontend)/actions'

type Option = { id: number | string; label: string }
type Relation = { member: string; relationType: 'child' | 'father' | 'husband' | 'mother' | 'wife' }
type InitialMember = {
  address?: string
  baptismDate?: string
  baptismPlace?: string
  birthDate?: string
  birthPlace?: string
  blessingDate?: string
  blessingPlace?: string
  confirmationDate?: string
  confirmationPlace?: string
  email?: string
  familyRole?: string
  fullName?: string
  household?: string
  nik?: string
  phone?: string
  previousChurch?: string
  registeredSince?: string
  relations?: Relation[]
  sector?: string
}

const relationOptions = [
  ['husband', 'Suami'],
  ['wife', 'Istri'],
  ['father', 'Ayah'],
  ['mother', 'Ibu'],
  ['child', 'Anak'],
] as const

export function MemberForm({
  households,
  initial = {},
  memberID,
  members,
  sectors,
}: {
  households: Option[]
  initial?: InitialMember
  memberID?: string
  members: Option[]
  sectors: Option[]
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createMemberAction, {})
  const [relations, setRelations] = useState<Relation[]>(initial.relations ?? [])
  const [step, setStep] = useState(0)
  const [recordID, setRecordID] = useState(memberID)
  const formRef = useRef<HTMLFormElement>(null)
  const lastStep = 3

  useEffect(() => {
    if (state.errorField === 'nik' || state.errorField === 'email' || state.errorField === 'birthPlace') {
      setStep(0)
    }
  }, [state.errorField])

  useEffect(() => {
    if (!state.href || !state.message) return
    const id = state.href.split('/').filter(Boolean).pop()
    if (id) setRecordID(id)
    setStep(lastStep)
  }, [state.href, state.message])

  const addRelation = () =>
    setRelations((current) => [...current, { member: '', relationType: 'child' }])

  const goNext = () => {
    const panel = formRef.current?.querySelector<HTMLElement>(`[data-member-step="${step}"]`)
    const controls = Array.from(
      panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input, select, textarea',
      ) ?? [],
    )
    const invalid = controls.find((control) => !control.checkValidity())

    if (invalid) {
      invalid.reportValidity()
      return
    }

    setStep(Math.min(step + 1, lastStep))
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0))
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const controls = Array.from(
      event.currentTarget.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input, select, textarea'),
    )
    const invalid = controls.find((control) => !control.checkValidity())

    if (invalid) {
      event.preventDefault()
      const invalidStep = Number(
        invalid.closest<HTMLElement>('[data-member-step]')?.dataset.memberStep,
      )
      if (Number.isInteger(invalidStep)) {
        setStep(invalidStep)
        requestAnimationFrame(() => invalid.reportValidity())
      }
      return
    }

    if (step < lastStep) {
      event.preventDefault()
      goNext()
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-7"
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
    >
      {recordID && <input name="memberID" type="hidden" value={recordID} />}
      <input
        name="relations"
        type="hidden"
        value={JSON.stringify(relations.filter((relation) => relation.member))}
      />

      <FormStepper
        current={step}
        labels={['Identitas wajib', 'Foto opsional', 'Hari Besar', 'Keluarga opsional']}
        onSelect={setStep}
      />

      <FormSection
        active={step === 0}
        description="Identitas utama yang digunakan untuk pencarian data."
        stepID={0}
        title="Data pribadi"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            defaultValue={initial.fullName}
            label="Nama lengkap"
            name="fullName"
            placeholder="Nama sesuai identitas"
            required
          />
          <Field
            defaultValue={initial.nik}
            error={state.errorField === 'nik' ? state.error : undefined}
            inputMode="numeric"
            label="NIK"
            maxLength={16}
            minLength={16}
            name="nik"
            placeholder="16 angka"
            required
          />
          <Field
            autoComplete="email"
            defaultValue={initial.email}
            error={state.errorField === 'email' ? state.error : undefined}
            inputMode="email"
            label="Email"
            name="email"
            placeholder="nama@email.com"
            required
            type="email"
          />
          <Field
            autoComplete="tel"
            defaultValue={initial.phone}
            label="Nomor HP/WA"
            name="phone"
            placeholder="08xxxxxxxxxx"
            required
            type="tel"
          />
          <Field
            defaultValue={initial.birthPlace}
            error={state.errorField === 'birthPlace' ? state.error : undefined}
            label="Tempat lahir"
            name="birthPlace"
            placeholder="Kota kelahiran"
            required
          />
          <Field
            defaultValue={initial.birthDate?.slice(0, 10)}
            label="Tanggal lahir"
            name="birthDate"
            required
            type="date"
          />
        </div>
        <TextArea
          defaultValue={initial.address}
          label="Alamat tempat tinggal"
          name="address"
          required
        />
        <Select
          defaultValue={initial.sector}
          label="Sektor"
          name="sector"
          options={sectors}
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            defaultValue={initial.registeredSince?.slice(0, 10)}
            label="Terdaftar di jemaat sejak"
            name="registeredSince"
            type="date"
          />
          <Field
            defaultValue={initial.previousChurch}
            label="Pindah dari gereja / jemaat"
            name="previousChurch"
            placeholder="Nama gereja atau jemaat asal"
          />
        </div>
      </FormSection>

      <FormSection
        active={step === 1}
        description="Opsional. Foto dapat ditambahkan atau diganti setelah data awal tersimpan."
        stepID={1}
        title="Foto jemaat"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <PhotoInput
            accept="image/jpeg,image/png,image/webp"
            description="Pilih foto formal atau foto profil yang sudah ada."
            icon={ImagePlus}
            label="Unggah foto profil"
            name="profilePhoto"
          />
          <div className="rounded-3xl border-2 border-dashed border-church-sky bg-church-sky-soft/60 p-5">
            <div className="flex gap-4">
              <div className="relative grid h-32 w-24 shrink-0 place-items-center overflow-hidden rounded-[2rem] border-4 border-church-sky bg-white">
                <div className="absolute top-5 size-10 rounded-full border-2 border-church-sky bg-church-sky-soft" />
                <div className="absolute bottom-3 h-14 w-16 rounded-t-full border-2 border-church-sky bg-church-sky-soft" />
                <div className="absolute inset-x-2 top-1/2 border-t border-dashed border-church-sky" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-church-deep">
                  <Camera aria-hidden="true" className="size-5" />
                  <h3 className="font-extrabold">Foto selfie verifikasi</h3>
                </div>
                <ul className="mt-2 space-y-1 text-sm leading-relaxed text-church-deep/80">
                  <li>Wajah tepat di tengah dan setinggi kamera.</li>
                  <li>Tampilkan kepala sampai bahu.</li>
                  <li>Gunakan cahaya dari depan dan latar polos.</li>
                  <li>Lepaskan topi, masker, dan kacamata gelap.</li>
                </ul>
              </div>
            </div>
            <label className="mt-4 block">
              <span className="field-label">Ambil atau pilih selfie</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                capture="user"
                className="form-control file:mr-3 file:rounded-lg file:border-0 file:bg-church-deep file:px-3 file:py-2 file:font-bold file:text-white"
                name="selfiePhoto"
                type="file"
              />
            </label>
          </div>
        </div>
        <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-relaxed text-amber-900">
          <Lightbulb aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          Format JPG, PNG, atau WebP. Ukuran maksimal 5 MB per foto.
        </p>
      </FormSection>

      <FormSection
        active={step === 2}
        description="Opsional. Isi baptis, sidi, atau pemberkatan bila sudah diketahui."
        stepID={2}
        title="Hari Besar"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            defaultValue={initial.baptismDate?.slice(0, 10)}
            label="Tanggal baptis"
            name="baptismDate"
            type="date"
          />
          <Field
            defaultValue={initial.baptismPlace}
            label="Tempat baptis"
            name="baptismPlace"
            placeholder="Nama gereja / kota"
          />
          <Field
            defaultValue={initial.confirmationDate?.slice(0, 10)}
            label="Tanggal sidi"
            name="confirmationDate"
            type="date"
          />
          <Field
            defaultValue={initial.confirmationPlace}
            label="Tempat sidi"
            name="confirmationPlace"
            placeholder="Nama gereja / kota"
          />
          <Field
            defaultValue={initial.blessingDate?.slice(0, 10)}
            label="Tanggal pemberkatan"
            name="blessingDate"
            type="date"
          />
          <Field
            defaultValue={initial.blessingPlace}
            label="Tempat pemberkatan"
            name="blessingPlace"
            placeholder="Nama gereja / kota"
          />
        </div>
      </FormSection>

      <FormSection
        active={step === 3}
        description="Opsional. Hubungkan keluarga sekarang atau lengkapi kembali melalui halaman edit."
        stepID={3}
        title="Data keluarga"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            defaultValue={initial.household}
            label="Kartu Keluarga"
            name="household"
            options={households}
          />
          <label className="block">
            <span className="field-label">Peran dalam keluarga</span>
            <select className="form-control" defaultValue={initial.familyRole} name="familyRole">
              <option value="">Pilih peran</option>
              <option value="head">Kepala keluarga</option>
              <option value="spouse">Suami/Istri</option>
              <option value="child">Anak</option>
              <option value="parent">Ayah/Ibu</option>
              <option value="other">Anggota lain</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {relations.map((relation, index) => (
            <div
              className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]"
              key={index}
            >
              <label>
                <span className="field-label">Hubungan</span>
                <select
                  className="form-control"
                  onChange={(event) =>
                    setRelations((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              relationType: event.target.value as Relation['relationType'],
                            }
                          : item,
                      ),
                    )
                  }
                  value={relation.relationType}
                >
                  {relationOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Nama jemaat terkait</span>
                <select
                  className="form-control"
                  onChange={(event) =>
                    setRelations((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, member: event.target.value } : item,
                      ),
                    )
                  }
                  value={relation.member}
                >
                  <option value="">Pilih jemaat</option>
                  {members.map((option) => (
                    <option key={option.id} value={String(option.id)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                aria-label="Hapus relasi"
                className="mt-auto grid size-12 place-items-center rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
                onClick={() =>
                  setRelations((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
                type="button"
              >
                <Trash2 aria-hidden="true" className="size-5" />
              </button>
            </div>
          ))}
          <button className="secondary-button" onClick={addRelation} type="button">
            <Plus aria-hidden="true" className="size-5" />
            Tambah relasi langsung
          </button>
        </div>
      </FormSection>

      {state.error && !state.errorField && (
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
          <span>
            {state.message}
            {state.href && (
              <Link className="ml-2 underline underline-offset-4" href={state.href}>
                Buka profil
              </Link>
            )}
          </span>
        </p>
      )}
      <div className="sticky bottom-24 z-20 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-4">
        <button
          className="secondary-button disabled:invisible"
          disabled={step === 0}
          onClick={goBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </button>
        <span className="hidden text-sm font-bold text-slate-500 sm:block">
          Langkah {step + 1} dari 4
        </span>
        {step < 3 ? (
          <button className="primary-button" onClick={goNext} type="button">
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
            {pending ? 'Menyimpan…' : recordID ? 'Perbarui jemaat' : 'Simpan jemaat'}
          </button>
        )}
      </div>
    </form>
  )
}

function FormStepper({
  current,
  labels,
  onSelect,
}: {
  current: number
  labels: string[]
  onSelect: (step: number) => void
}) {
  return (
    <nav
      aria-label="Tahapan formulir"
      className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <ol className="grid grid-cols-4 gap-2">
        {labels.map((label, index) => {
          const completed = index < current

          return (
            <li key={label}>
              <button
                aria-current={index === current ? 'step' : undefined}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 text-center text-xs font-extrabold transition sm:text-sm ${
                  index === current
                    ? 'bg-church-deep text-white'
                    : 'bg-church-sky-soft text-church-deep'
                }`}
                onClick={() => onSelect(index)}
                type="button"
              >
                <span className="grid size-6 place-items-center rounded-full bg-white/20">
                  {completed ? <Check aria-hidden="true" className="size-4" /> : index + 1}
                </span>
                <span>{label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function PhotoInput({
  description,
  icon: Icon,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  description: string
  icon: typeof ImagePlus
  label: string
}) {
  return (
    <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <span className="flex items-center gap-2 font-extrabold text-slate-900">
        <Icon aria-hidden="true" className="size-5 text-church-roof" />
        {label}
      </span>
      <span className="mt-2 block text-sm leading-relaxed text-slate-500">{description}</span>
      <input
        className="form-control mt-4 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:font-bold file:text-white"
        type="file"
        {...props}
      />
    </label>
  )
}

function FormSection({
  active,
  children,
  description,
  stepID,
  title,
}: {
  active: boolean
  children: React.ReactNode
  description: string
  stepID: number
  title: string
}) {
  return (
    <section
      className={`space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${active ? '' : 'hidden'}`}
      data-member-step={stepID}
    >
      <div>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({
  error,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; label: string }) {
  const errorID = props.name ? `${props.name}-error` : undefined

  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        aria-describedby={error ? errorID : undefined}
        aria-invalid={error ? true : undefined}
        className="form-control"
        {...props}
      />
      {error && (
        <span className="mt-2 block text-sm font-bold text-red-700" id={errorID} role="alert">
          {error}
        </span>
      )}
    </label>
  )
}

function TextArea({
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

function Select({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Option[] }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="form-control" {...props}>
        <option value="">Pilih {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.id} value={String(option.id)}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
