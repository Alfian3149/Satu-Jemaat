import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createHouseholdAction } from '@/app/(frontend)/actions'
import { ActionForm } from '@/components/ActionForm'
import { appAuth } from '@/lib/app-auth'
import { listSectors } from '@/lib/church'

export default async function AddFamilyPage() {
  const user = await appAuth.currentUser()
  if (!user || !['admin', 'sector-officer'].includes(user.role)) redirect('/keluarga')
  const sectors = await listSectors()

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 font-bold text-emerald-700" href="/keluarga">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Data keluarga
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Tambah keluarga</h1>
        <p className="mt-1 text-slate-500">
          Buat kelompok keluarga, lalu hubungkan setiap anggota jemaat.
        </p>
      </div>

      {sectors.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <ActionForm action={createHouseholdAction} submitLabel="Simpan keluarga">
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="field-label">Nama keluarga</span>
                <input
                  className="form-control"
                  name="familyName"
                  placeholder="Contoh: Keluarga Siregar"
                  required
                />
              </label>
              <label>
                <span className="field-label">Nomor Kartu Keluarga</span>
                <input
                  className="form-control"
                  inputMode="numeric"
                  name="familyNumber"
                  placeholder="Opsional"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="field-label">Alamat keluarga</span>
                <textarea className="form-control min-h-28 resize-y" name="address" required />
              </label>
              <label>
                <span className="field-label">Sektor</span>
                <select className="form-control" name="sector" required>
                  <option value="">Pilih sektor</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={String(sector.id)}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Catatan keluarga</span>
                <input className="form-control" name="notes" placeholder="Opsional" />
              </label>
            </div>
          </ActionForm>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Admin perlu menambahkan sektor terlebih dahulu melalui menu Pengaturan.
        </div>
      )}
    </div>
  )
}
