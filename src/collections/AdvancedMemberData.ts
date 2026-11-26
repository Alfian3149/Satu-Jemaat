import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  admins,
  isAppUser,
  isCMSAdmin,
  relationshipID,
  staffCreate,
  staffSectorScoped,
} from '@/access/app-access'

const enforceMemberSector: NonNullable<CollectionConfig['hooks']>['beforeValidate'] = [
  async ({ data, originalDoc, req }) => {
    if (!data) return data
    const memberID = relationshipID(data?.member ?? originalDoc?.member)
    if (!memberID) throw new APIError('Pilih jemaat untuk data lanjutan.', 400)

    const member = await req.payload.findByID({
      collection: 'members',
      id: memberID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const memberSector = relationshipID(member.sector)
    if (!memberSector) throw new APIError('Jemaat belum memiliki sektor.', 400)

    if (isAppUser(req.user) && req.user.role === 'sector-officer') {
      if (relationshipID(req.user.sector) !== memberSector) {
        throw new APIError('Jemaat tidak berada dalam sektor tugas Anda.', 403)
      }
    } else if (!isCMSAdmin(req.user) && (!isAppUser(req.user) || req.user.role !== 'admin')) {
      throw new APIError('Anda tidak memiliki izin mengelola data lanjutan.', 403)
    }

    data.sector = memberSector
    return data
  },
]

export const AdvancedMemberData: CollectionConfig = {
  slug: 'advanced-member-data',
  labels: {
    singular: 'Data Lanjutan Jemaat',
    plural: 'Data Lanjutan Jemaat',
  },
  access: {
    create: staffCreate,
    delete: admins,
    read: staffSectorScoped,
    update: staffSectorScoped,
  },
  admin: {
    group: 'Pendataan Gereja',
    useAsTitle: 'member',
    defaultColumns: ['member', 'sector', 'updatedAt'],
  },
  hooks: {
    beforeValidate: enforceMemberSector,
  },
  fields: [
    {
      name: 'member',
      label: 'Jemaat',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'sector',
      label: 'Sektor',
      type: 'relationship',
      relationTo: 'sectors',
      required: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'theology',
      label: 'Teologi',
      type: 'group',
      fields: [
        {
          name: 'worshipFrequency',
          label: 'Kehadiran ibadah',
          type: 'select',
          options: [
            { label: 'Rutin setiap minggu', value: 'weekly' },
            { label: 'Dua sampai tiga kali sebulan', value: 'monthly-often' },
            { label: 'Sesekali', value: 'sometimes' },
            { label: 'Belum aktif beribadah', value: 'inactive' },
          ],
        },
        {
          name: 'communionParticipation',
          label: 'Partisipasi Perjamuan Kudus',
          type: 'select',
          options: [
            { label: 'Aktif', value: 'active' },
            { label: 'Tidak rutin', value: 'irregular' },
            { label: 'Belum dapat mengikuti', value: 'not-yet' },
            { label: 'Belum diketahui', value: 'unknown' },
          ],
        },
        { name: 'lastCommunionDate', label: 'Terakhir mengikuti Perjamuan Kudus', type: 'date' },
        {
          name: 'marriageBlessingStatus',
          label: 'Status pemberkatan perkawinan',
          type: 'select',
          options: [
            { label: 'Sudah diberkati di gereja', value: 'church-blessed' },
            { label: 'Menikah, belum diberkati', value: 'not-blessed' },
            { label: 'Belum menikah', value: 'not-married' },
            { label: 'Tidak relevan', value: 'not-applicable' },
          ],
        },
        {
          name: 'pastoralCareStatus',
          label: 'Status pendampingan pastoral',
          type: 'select',
          options: [
            { label: 'Tidak membutuhkan saat ini', value: 'none' },
            { label: 'Perlu dijadwalkan', value: 'needed' },
            { label: 'Sedang didampingi', value: 'ongoing' },
            { label: 'Tindak lanjut selesai', value: 'completed' },
          ],
        },
        {
          name: 'pastoralNeeds',
          label: 'Arahan/kebutuhan pastoral',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Penguatan iman', value: 'faith' },
            { label: 'Pernikahan dan keluarga', value: 'family' },
            { label: 'Kedukaan', value: 'grief' },
            { label: 'Kesehatan', value: 'health' },
            { label: 'Anak dan remaja', value: 'youth' },
            { label: 'Lanjut usia', value: 'elderly' },
            { label: 'Pemulihan kecanduan', value: 'recovery' },
            { label: 'Konseling pribadi', value: 'personal' },
          ],
        },
        {
          name: 'pastoralPriority',
          label: 'Prioritas tindak lanjut',
          type: 'select',
          options: [
            { label: 'Rendah', value: 'low' },
            { label: 'Sedang', value: 'medium' },
            { label: 'Tinggi', value: 'high' },
            { label: 'Mendesak', value: 'urgent' },
          ],
        },
        { name: 'pastoralNotes', label: 'Catatan pastoral rahasia', type: 'textarea' },
      ],
    },
    {
      name: 'serviceWitness',
      label: 'PelKes',
      type: 'group',
      fields: [
        { name: 'receivesDiakonia', label: 'Sedang menerima bantuan diakonia', type: 'checkbox' },
        {
          name: 'assistanceTypes',
          label: 'Jenis bantuan yang dibutuhkan',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Pangan', value: 'food' },
            { label: 'Kesehatan', value: 'health' },
            { label: 'Pendidikan', value: 'education' },
            { label: 'Perumahan', value: 'housing' },
            { label: 'Pekerjaan', value: 'employment' },
            { label: 'Disabilitas', value: 'disability' },
            { label: 'Lanjut usia', value: 'elderly' },
            { label: 'Tanggap bencana', value: 'disaster' },
            { label: 'Konseling', value: 'counseling' },
          ],
        },
        {
          name: 'assistanceUrgency',
          label: 'Tingkat kebutuhan bantuan',
          type: 'select',
          options: [
            { label: 'Pemantauan', value: 'monitor' },
            { label: 'Perlu bantuan', value: 'needed' },
            { label: 'Prioritas', value: 'priority' },
            { label: 'Darurat', value: 'emergency' },
          ],
        },
        {
          name: 'vulnerableGroups',
          label: 'Kelompok rentan dalam keluarga',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Balita', value: 'toddler' },
            { label: 'Ibu hamil', value: 'pregnant' },
            { label: 'Lanjut usia', value: 'elderly' },
            { label: 'Disabilitas', value: 'disability' },
            { label: 'Penyakit kronis', value: 'chronic-illness' },
            { label: 'Orang tua tunggal', value: 'single-parent' },
            { label: 'Pengangguran', value: 'unemployed' },
          ],
        },
        {
          name: 'serviceParticipation',
          label: 'Keterlibatan pelayanan',
          type: 'select',
          options: [
            { label: 'Aktif', value: 'active' },
            { label: 'Sesekali', value: 'occasional' },
            { label: 'Belum aktif', value: 'inactive' },
            { label: 'Ingin mulai melayani', value: 'interested' },
          ],
        },
        {
          name: 'serviceAreas',
          label: 'Bidang pelayanan/kesaksian',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Diakonia', value: 'diakonia' },
            { label: 'Penginjilan', value: 'evangelism' },
            { label: 'Kunjungan', value: 'visitation' },
            { label: 'Doa', value: 'prayer' },
            { label: 'Pelayanan sosial', value: 'social' },
            { label: 'Lingkungan hidup', value: 'environment' },
          ],
        },
        { name: 'witnessNotes', label: 'Catatan potensi kesaksian', type: 'textarea' },
      ],
    },
    {
      name: 'gemasa',
      label: 'Germasa',
      type: 'group',
      fields: [
        {
          name: 'domicileStatus',
          label: 'Status domisili',
          type: 'select',
          options: [
            { label: 'Menetap di alamat terdata', value: 'resident' },
            { label: 'Pendatang', value: 'migrant' },
            { label: 'Tinggal sementara', value: 'temporary' },
            { label: 'Di luar daerah/negeri', value: 'away' },
          ],
        },
        {
          name: 'residenceOwnership',
          label: 'Status tempat tinggal',
          type: 'select',
          options: [
            { label: 'Milik sendiri', value: 'owned' },
            { label: 'Sewa/kontrak', value: 'rented' },
            { label: 'Menumpang keluarga', value: 'family' },
            { label: 'Rumah dinas/asrama', value: 'official' },
            { label: 'Lainnya', value: 'other' },
          ],
        },
        {
          name: 'populationDocumentStatus',
          label: 'Kesesuaian dokumen kependudukan',
          type: 'select',
          options: [
            { label: 'Sesuai domisili', value: 'matched' },
            { label: 'Alamat dokumen berbeda', value: 'different' },
            { label: 'Sedang diproses', value: 'processing' },
            { label: 'Belum lengkap', value: 'incomplete' },
          ],
        },
        { name: 'yearsAtAddress', label: 'Lama tinggal (tahun)', type: 'number', min: 0 },
        {
          name: 'communityRoles',
          label: 'Peran kemasyarakatan',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'RT/RW', value: 'neighborhood' },
            { label: 'PKK/Posyandu', value: 'family-health' },
            { label: 'Karang Taruna', value: 'youth' },
            { label: 'Tokoh adat/masyarakat', value: 'community-leader' },
            { label: 'Relawan', value: 'volunteer' },
            { label: 'Organisasi profesi', value: 'professional' },
          ],
        },
        { name: 'communitySkills', label: 'Keahlian kemasyarakatan', type: 'textarea' },
        { name: 'mobilityNotes', label: 'Catatan mobilitas/domisili', type: 'textarea' },
      ],
    },
    {
      name: 'ppsdiPpk',
      label: 'PPSDI - PPK',
      type: 'group',
      fields: [
        {
          name: 'educationLevel',
          label: 'Pendidikan terakhir',
          type: 'select',
          options: ['Tidak sekolah', 'SD', 'SMP', 'SMA/SMK', 'Diploma', 'Sarjana', 'Pascasarjana'],
        },
        {
          name: 'employmentStatus',
          label: 'Status pekerjaan',
          type: 'select',
          options: [
            { label: 'Bekerja tetap', value: 'employed' },
            { label: 'Pekerja lepas', value: 'freelance' },
            { label: 'Wirausaha', value: 'entrepreneur' },
            { label: 'Pelajar/mahasiswa', value: 'student' },
            { label: 'Pensiun', value: 'retired' },
            { label: 'Belum bekerja', value: 'unemployed' },
          ],
        },
        { name: 'occupation', label: 'Pekerjaan/profesi', type: 'text' },
        { name: 'professionalSkills', label: 'Keahlian profesional', type: 'textarea' },
        {
          name: 'talents',
          label: 'Talenta dan kompetensi',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Musik dan vokal', value: 'music' },
            { label: 'Liturgi', value: 'liturgy' },
            { label: 'Mengajar', value: 'teaching' },
            { label: 'Administrasi', value: 'administration' },
            { label: 'Teknologi/data', value: 'technology' },
            { label: 'Kesehatan', value: 'health' },
            { label: 'Hukum', value: 'legal' },
            { label: 'Konstruksi/teknik', value: 'engineering' },
            { label: 'Kewirausahaan', value: 'business' },
            { label: 'Pertanian/perikanan', value: 'agriculture' },
            { label: 'Komunikasi/media', value: 'communication' },
          ],
        },
        { name: 'trainingNeeds', label: 'Pelatihan yang dibutuhkan', type: 'textarea' },
        {
          name: 'cadreLevel',
          label: 'Pemetaan kader',
          type: 'select',
          options: [
            { label: 'Belum dipetakan', value: 'unmapped' },
            { label: 'Calon potensial', value: 'potential' },
            { label: 'Siap dikerahkan', value: 'ready' },
            { label: 'Kader aktif', value: 'active' },
          ],
        },
        { name: 'willingDataCollector', label: 'Bersedia menjadi kader pendata', type: 'checkbox' },
        {
          name: 'availability',
          label: 'Ketersediaan waktu',
          type: 'select',
          options: [
            { label: 'Hari kerja', value: 'weekday' },
            { label: 'Akhir pekan', value: 'weekend' },
            { label: 'Malam hari', value: 'evening' },
            { label: 'Fleksibel', value: 'flexible' },
          ],
        },
      ],
    },
    {
      name: 'pegp',
      label: 'PEG',
      type: 'group',
      fields: [
        {
          name: 'economicCondition',
          label: 'Kondisi ekonomi keluarga',
          type: 'select',
          options: [
            { label: 'Sangat rentan', value: 'very-vulnerable' },
            { label: 'Rentan', value: 'vulnerable' },
            { label: 'Stabil', value: 'stable' },
            { label: 'Berkembang', value: 'growing' },
          ],
        },
        {
          name: 'monthlyIncomeRange',
          label: 'Rentang pendapatan bulanan',
          type: 'select',
          options: [
            { label: 'Di bawah Rp1 juta', value: 'under-1m' },
            { label: 'Rp1–3 juta', value: '1m-3m' },
            { label: 'Rp3–5 juta', value: '3m-5m' },
            { label: 'Rp5–10 juta', value: '5m-10m' },
            { label: 'Di atas Rp10 juta', value: 'over-10m' },
            { label: 'Tidak bersedia menjawab', value: 'prefer-not' },
          ],
        },
        { name: 'hasBusiness', label: 'Memiliki usaha/UMKM', type: 'checkbox' },
        { name: 'businessName', label: 'Nama usaha', type: 'text' },
        {
          name: 'businessType',
          label: 'Bidang usaha',
          type: 'select',
          options: [
            'Kuliner',
            'Perdagangan',
            'Jasa',
            'Pertanian/Perikanan',
            'Kerajinan',
            'Teknologi/Digital',
            'Transportasi',
            'Lainnya',
          ],
        },
        {
          name: 'businessScale',
          label: 'Skala usaha',
          type: 'select',
          options: [
            { label: 'Rintisan', value: 'starter' },
            { label: 'Mikro', value: 'micro' },
            { label: 'Kecil', value: 'small' },
            { label: 'Menengah', value: 'medium' },
          ],
        },
        { name: 'employeeCount', label: 'Jumlah tenaga kerja', type: 'number', min: 0 },
        {
          name: 'marketChannels',
          label: 'Saluran pemasaran',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Toko/lokasi fisik', value: 'offline' },
            { label: 'Media sosial', value: 'social-media' },
            { label: 'Marketplace', value: 'marketplace' },
            { label: 'Pesanan komunitas', value: 'community' },
            { label: 'Belum dipasarkan', value: 'none' },
          ],
        },
        {
          name: 'businessNeeds',
          label: 'Kebutuhan pengembangan usaha',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Modal', value: 'capital' },
            { label: 'Pelatihan', value: 'training' },
            { label: 'Perizinan', value: 'licensing' },
            { label: 'Pemasaran', value: 'marketing' },
            { label: 'Digitalisasi', value: 'digitalization' },
            { label: 'Pendampingan', value: 'mentoring' },
          ],
        },
        {
          name: 'canSupportCensus',
          label: 'Bersedia mendukung anggaran sensus',
          type: 'checkbox',
        },
        {
          name: 'censusContributionBudget',
          label: 'Potensi dukungan anggaran sensus (Rp)',
          type: 'number',
          min: 0,
        },
        { name: 'economicNotes', label: 'Catatan potensi ekonomi', type: 'textarea' },
      ],
    },
  ],
  timestamps: true,
}
