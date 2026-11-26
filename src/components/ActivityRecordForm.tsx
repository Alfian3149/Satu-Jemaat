'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createActivityRecordAction, type ActionState } from '@/app/(frontend)/actions'

type Option = { id: number | string; label: string }
type IncomeEntry = {
  id: number
  quantities: Record<string, number>
  source: string
}

const denominations = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100]
const rupiah = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function ActivityRecordForm({
  activityTypes,
  defaultSector,
  incomeSources,
  sectors,
}: {
  activityTypes: Option[]
  defaultSector?: string
  incomeSources: Option[]
  sectors: Option[]
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createActivityRecordAction,
    {},
  )
  const [step, setStep] = useState(0)
  const [hasIncome, setHasIncome] = useState(false)
  const [nextIncomeID, setNextIncomeID] = useState(2)
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([
    { id: 1, quantities: {}, source: '' },
  ])
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!state.href || !state.message) return
    router.push(state.href)
    router.refresh()
  }, [router, state.href, state.message])

  const validateStep = (targetStep: number) => {
    const panel = formRef.current?.querySelector<HTMLElement>(
      `[data-activity-step="${targetStep}"]`,
    )
    const controls = Array.from(
      panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input, select, textarea',
      ) ?? [],
    )
    const invalid = controls.find((control) => !control.checkValidity())
    if (!invalid) return true
    invalid.reportValidity()
    return false
  }

  const goToIncome = () => {
    if (!validateStep(0)) return
    setStep(1)
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  const addIncome = () => {
    setIncomeEntries((current) => [...current, { id: nextIncomeID, quantities: {}, source: '' }])
    setNextIncomeID((current) => current + 1)
  }

  const updateQuantity = (entryID: number, denomination: number, quantity: number) => {
    setIncomeEntries((current) =>
      current.map((entry) =>
        entry.id === entryID
          ? {
              ...entry,
              quantities: {
                ...entry.quantities,
                [String(denomination)]: Math.max(0, quantity || 0),
              },
            }
          : entry,
      ),
    )
  }

  const entryTotal = (entry: IncomeEntry) =>
    denominations.reduce(
      (total, denomination) => total + denomination * (entry.quantities[String(denomination)] ?? 0),
      0,
    )
  const grandTotal = incomeEntries.reduce((total, entry) => total + entryTotal(entry), 0)

  return (
    <form action={formAction} className="space-y-6" noValidate ref={formRef}>
      <input
        name="incomeEntries"
        type="hidden"
        value={JSON.stringify(
          incomeEntries.map(({ quantities, source }) => ({ quantities, source })),
        )}
      />

      <div className="grid grid-cols-2 gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        {[
          ['Informasi kegiatan', CalendarDays],
          ['Pemasukan', Banknote],
        ].map(([label, Icon], index) => (
          <button
            aria-current={step === index ? 'step' : undefined}
            className={`flex min-h-16 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-extrabold ${
              step === index
                ? 'bg-church-deep text-white'
                : index === 1 && !hasIncome
                  ? 'bg-slate-50 text-slate-400'
                  : 'bg-church-sky-soft text-church-deep'
            }`}
            disabled={index === 1 && !hasIncome}
            key={label as string}
            onClick={() => {
              if (index === 0) setStep(0)
              if (index === 1) goToIncome()
            }}
            type="button"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white/20">
              {step > index ? <Check aria-hidden="true" className="size-4" /> : index + 1}
            </span>
            <Icon aria-hidden="true" className="size-5" />
            {label as string}
          </button>
        ))}
      </div>

      <section
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        data-activity-step="0"
        hidden={step !== 0}
      >
        <div>
          <p className="font-extrabold uppercase tracking-widest text-church-roof">Tahap 1</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-950">Informasi kegiatan</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Catat kegiatan aktual dan jumlah orang yang hadir.
          </p>
        </div>

        <label className="block">
          <span className="field-label">Nama kegiatan</span>
          <select className="form-control" name="activityType" required>
            <option value="">Pilih dari master kegiatan</option>
            {activityTypes.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label>
            <span className="field-label">Tanggal</span>
            <input className="form-control" name="date" required type="date" />
          </label>
          <label>
            <span className="field-label">Tempat</span>
            <input
              className="form-control"
              name="place"
              placeholder="Nama gereja / lokasi"
              required
            />
          </label>
          <label>
            <span className="field-label">Waktu</span>
            <input className="form-control" name="time" required type="time" />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="field-label">Jumlah orang hadir</span>
            <span className="relative block">
              <UsersRound
                aria-hidden="true"
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              />
              <input
                className="form-control pl-12"
                min="0"
                name="attendeeCount"
                placeholder="0"
                required
                type="number"
              />
            </span>
          </label>
          <label>
            <span className="field-label">Sektor</span>
            <select className="form-control" defaultValue={defaultSector} name="sector" required>
              <option value="">Pilih sektor</option>
              {sectors.map((option) => (
                <option key={option.id} value={String(option.id)}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="field-label">Catatan kegiatan</span>
          <textarea
            className="form-control min-h-24 resize-y"
            name="notes"
            placeholder="Opsional"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-church-sky bg-church-sky-soft/60 p-4">
          <input
            checked={hasIncome}
            className="mt-1 size-5 accent-church-roof"
            name="hasIncome"
            onChange={(event) => setHasIncome(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong className="block text-church-deep">Ada pemasukan?</strong>
            <span className="mt-1 block text-sm text-slate-600">
              Centang untuk mencatat pundi-pundi, kantong, kotak, sumbangan, dan sumber lainnya.
            </span>
          </span>
        </label>
      </section>

      <section
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        data-activity-step="1"
        hidden={step !== 1}
      >
        <div>
          <p className="font-extrabold uppercase tracking-widest text-church-roof">Tahap 2</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Pemasukan kegiatan</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Tambahkan beberapa sumber pemasukan dan masukkan jumlah lembar atau koin.
          </p>
        </div>

        {incomeEntries.map((entry, entryIndex) => {
          const selectedSources = incomeEntries
            .filter((item) => item.id !== entry.id)
            .map((item) => item.source)
          return (
            <div
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
              key={entry.id}
            >
              <div className="flex items-end gap-3">
                <label className="min-w-0 flex-1">
                  <span className="field-label">Sumber pemasukan {entryIndex + 1}</span>
                  <select
                    className="form-control bg-white"
                    onChange={(event) =>
                      setIncomeEntries((current) =>
                        current.map((item) =>
                          item.id === entry.id ? { ...item, source: event.target.value } : item,
                        ),
                      )
                    }
                    required
                    value={entry.source}
                  >
                    <option value="">Pilih sumber</option>
                    {incomeSources.map((option) => (
                      <option
                        disabled={selectedSources.includes(String(option.id))}
                        key={option.id}
                        value={String(option.id)}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {incomeEntries.length > 1 && (
                  <button
                    aria-label={`Hapus sumber pemasukan ${entryIndex + 1}`}
                    className="grid size-12 shrink-0 place-items-center rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50"
                    onClick={() =>
                      setIncomeEntries((current) => current.filter((item) => item.id !== entry.id))
                    }
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-5" />
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="hidden grid-cols-[1fr_0.65fr_1fr] gap-3 px-1 text-xs font-extrabold uppercase tracking-wider text-slate-400 sm:grid">
                  <span>Pecahan</span>
                  <span>Jumlah</span>
                  <span>Subtotal</span>
                </div>
                {denominations.map((denomination) => {
                  const quantity = entry.quantities[String(denomination)] ?? 0
                  return (
                    <div
                      className="grid grid-cols-[1fr_0.75fr] gap-2 sm:grid-cols-[1fr_0.65fr_1fr] sm:gap-3"
                      key={denomination}
                    >
                      <div className="form-control flex items-center bg-white font-bold">
                        {rupiah.format(denomination)}
                      </div>
                      <input
                        aria-label={`Jumlah pecahan ${rupiah.format(denomination)}`}
                        className="form-control bg-white"
                        min="0"
                        onChange={(event) =>
                          updateQuantity(entry.id, denomination, Number(event.target.value))
                        }
                        type="number"
                        value={quantity}
                      />
                      <output className="form-control col-span-2 flex items-center bg-white font-bold text-church-deep sm:col-span-1">
                        {rupiah.format(denomination * quantity)}
                      </output>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-church-deep px-4 py-3 text-white">
                <span className="font-bold">Total sumber</span>
                <strong className="text-lg">{rupiah.format(entryTotal(entry))}</strong>
              </div>
            </div>
          )
        })}

        <button className="secondary-button w-full" onClick={addIncome} type="button">
          <Plus aria-hidden="true" className="size-5" />
          Tambah sumber pemasukan
        </button>

        <div className="flex flex-col gap-2 rounded-3xl bg-church-roof p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold">Total keseluruhan</span>
          <strong className="text-2xl">{rupiah.format(grandTotal)}</strong>
        </div>
      </section>

      {state.error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <div className="sticky bottom-24 z-20 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-4">
        <button
          className="secondary-button disabled:invisible"
          disabled={step === 0}
          onClick={() => setStep(0)}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </button>
        {step === 0 && hasIncome ? (
          <button className="primary-button" onClick={goToIncome} type="button">
            Lanjut ke pemasukan
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        ) : (
          <button
            className="primary-button"
            disabled={pending}
            onClick={(event) => {
              if (!validateStep(step)) event.preventDefault()
            }}
            type="submit"
          >
            {pending ? (
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-5" />
            )}
            {pending ? 'Menyimpan…' : 'Simpan kegiatan'}
          </button>
        )}
      </div>
    </form>
  )
}
