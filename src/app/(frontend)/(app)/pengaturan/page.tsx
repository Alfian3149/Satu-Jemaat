import { Banknote, Building2, CalendarDays, Plus, ShieldCheck } from 'lucide-react'
import { redirect } from 'next/navigation'
import {
  createActivityTypeAction,
  createIncomeSourceAction,
  createSectorAction,
  updateProfileAccessAction,
} from '@/app/(frontend)/actions'
import { ActionForm } from '@/components/ActionForm'
import { appAuth } from '@/lib/app-auth'
import { listActivityTypes, listHouseholds, listIncomeSources, listProfiles, listSectors } from '@/lib/church'

export default async function SettingsPage() {
  const user = await appAuth.currentUser()
  if (!user || user.role !== 'admin') redirect('/dashboard')
  const [sectors, activityTypes, incomeSources, profiles, households] = await Promise.all([
    listSectors(),
    listActivityTypes(),
    listIncomeSources(),
    listProfiles(),
    listHouseholds(),
  ])

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Pengaturan</h1>
        <p className="mt-1 text-slate-500">Kelola data pendukung aplikasi.</p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <Plus aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Tambah sektor</h2>
            <p className="text-sm text-slate-500">Sektor dipakai untuk membatasi akses petugas.</p>
          </div>
        </div>
        <div className="mt-6">
          <ActionForm action={createSectorAction} submitLabel="Tambah sektor">
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="field-label">Nama sektor</span>
                <input
                  className="form-control"
                  name="name"
                  placeholder="Contoh: Sektor Betlehem"
                  required
                />
              </label>
              <label>
                <span className="field-label">Kode singkat</span>
                <input className="form-control" name="code" placeholder="Contoh: BET" />
              </label>
            </div>
          </ActionForm>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-950">Daftar sektor</h2>
        {sectors.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sectors.map((sector) => (
              <div
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                key={sector.id}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <Building2 aria-hidden="true" className="size-5" />
                </span>
                <span>
                  <strong className="block text-slate-950">{sector.name}</strong>
                  <span className="text-sm font-semibold text-slate-500">
                    {sector.code || 'Tanpa kode'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Belum ada sektor.
          </p>
        )}
      </section>

      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-church-sky-soft text-church-deep">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Master nama kegiatan</h2>
            <p className="text-sm text-slate-500">
              Pengguna hanya dapat memilih kegiatan dari daftar ini.
            </p>
          </div>
        </div>
        <ActionForm action={createActivityTypeAction} submitLabel="Tambah kegiatan">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Nama kegiatan</span>
              <input
                className="form-control"
                name="name"
                placeholder="Contoh: Ibadah Minggu"
                required
              />
            </label>
            <label>
              <span className="field-label">Keterangan</span>
              <input className="form-control" name="description" placeholder="Opsional" />
            </label>
          </div>
        </ActionForm>
        <div className="flex flex-wrap gap-2">
          {activityTypes.map((item) => (
            <span
              className="rounded-full bg-church-sky-soft px-3 py-2 text-sm font-bold text-church-deep"
              key={item.id}
            >
              {item.name}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-church-gold/20 text-church-deep">
            <Banknote aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Master sumber pemasukan</h2>
            <p className="text-sm text-slate-500">
              Contoh: pundi-pundi, kantong putih, kotak, dan sumbangan.
            </p>
          </div>
        </div>
        <ActionForm action={createIncomeSourceAction} submitLabel="Tambah sumber">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Nama sumber</span>
              <input
                className="form-control"
                name="name"
                placeholder="Contoh: Pundi-pundi"
                required
              />
            </label>
            <label>
              <span className="field-label">Keterangan</span>
              <input className="form-control" name="description" placeholder="Opsional" />
            </label>
          </div>
        </ActionForm>
        <div className="flex flex-wrap gap-2">
          {incomeSources.map((item) => (
            <span
              className="rounded-full bg-church-gold/20 px-3 py-2 text-sm font-bold text-church-deep"
              key={item.id}
            >
              {item.name}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Hak akses akun</h2>
            <p className="text-sm text-slate-500">
              Peran admin dan petugas sektor disimpan di Supabase.
            </p>
          </div>
        </div>
        <ActionForm action={updateProfileAccessAction} submitLabel="Simpan hak akses">
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="field-label">Akun</span>
              <select className="form-control" name="profile" required>
                <option value="">Pilih akun</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} · {profile.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Hak akses</span>
              <select className="form-control" name="role" required>
                <option value="member">Jemaat</option>
                <option value="sector-officer">Petugas sektor</option>
                <option value="admin">Admin aplikasi</option>
              </select>
            </label>
            <label>
              <span className="field-label">Sektor tugas</span>
              <select className="form-control" name="sector">
                <option value="">Tidak ada</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Kartu keluarga</span>
              <select className="form-control" name="household">
                <option value="">Tidak ada</option>
                {households.map((household) => (
                  <option key={household.id} value={household.id}>
                    {household.familyName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </ActionForm>
        <ul className="divide-y divide-slate-100">
          {profiles.map((profile) => (
            <li className="flex items-center justify-between gap-3 py-3" key={profile.id}>
              <span>
                <strong className="block text-slate-950">{profile.name}</strong>
                <span className="text-sm text-slate-500">{profile.email}</span>
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                {profile.role === 'admin'
                  ? 'Admin'
                  : profile.role === 'sector-officer'
                    ? 'Petugas sektor'
                    : 'Jemaat'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
