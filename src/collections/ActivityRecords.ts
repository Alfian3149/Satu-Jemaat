import { APIError, type CollectionConfig } from 'payload'
import { admins, isAppUser, staffCreate, staffSectorScoped } from '@/access/app-access'

const serverOwned = {
  create: () => false,
  update: () => false,
}

const relationshipID = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return undefined
}

export const ActivityRecords: CollectionConfig = {
  slug: 'activity-records',
  labels: {
    singular: 'Rekaman Kegiatan',
    plural: 'Rekaman Kegiatan',
  },
  access: {
    create: staffCreate,
    delete: admins,
    read: staffSectorScoped,
    update: staffSectorScoped,
  },
  admin: {
    defaultColumns: ['activityType', 'date', 'sector', 'attendeeCount', 'grandTotal'],
    group: 'Rekam Kegiatan',
    useAsTitle: 'date',
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data

        if (isAppUser(req.user) && req.user.role === 'sector-officer') {
          data.sector = relationshipID(req.user.sector)
        }
        if (isAppUser(req.user)) data.recordedBy = req.user.id

        const activityType = relationshipID(data.activityType)
        if (!activityType) throw new APIError('Pilih nama kegiatan.', 400)

        const activityMatch = await req.payload.find({
          collection: 'activity-types',
          depth: 0,
          limit: 1,
          overrideAccess: false,
          req,
          where: {
            and: [{ id: { equals: activityType } }, { active: { equals: true } }],
          },
        })
        if (!activityMatch.docs.length) {
          throw new APIError('Nama kegiatan tidak aktif atau tidak ditemukan.', 400)
        }

        if (data.hasIncome) {
          const sourceIDs = Array.from(
            new Set(
              (Array.isArray(data.incomeEntries) ? data.incomeEntries : [])
                .map((entry) => relationshipID(entry?.source))
                .filter((id): id is number | string => id !== undefined),
            ),
          )
          if (!sourceIDs.length) throw new APIError('Tambahkan minimal satu sumber pemasukan.', 400)

          const sources = await req.payload.find({
            collection: 'income-sources',
            depth: 0,
            limit: sourceIDs.length,
            overrideAccess: false,
            req,
            where: {
              and: [{ id: { in: sourceIDs } }, { active: { equals: true } }],
            },
          })
          if (sources.docs.length !== sourceIDs.length) {
            throw new APIError('Salah satu sumber pemasukan tidak aktif atau tidak ditemukan.', 400)
          }
        }

        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (!data.hasIncome) {
          data.incomeEntries = []
          data.grandTotal = 0
          return data
        }

        data.incomeEntries = (Array.isArray(data.incomeEntries) ? data.incomeEntries : []).map(
          (entry) => {
            const breakdown = (Array.isArray(entry.breakdown) ? entry.breakdown : []).map(
              (row: Record<string, unknown>) => {
                const denomination = Math.max(0, Number(row.denomination) || 0)
                const quantity = Math.max(0, Math.floor(Number(row.quantity) || 0))
                return { ...row, denomination, quantity, subtotal: denomination * quantity }
              },
            )
            return {
              ...entry,
              breakdown,
              total: breakdown.reduce(
                (sum: number, row: { subtotal: number }) => sum + row.subtotal,
                0,
              ),
            }
          },
        )
        data.grandTotal = data.incomeEntries.reduce(
          (sum: number, entry: { total?: number }) => sum + (entry.total ?? 0),
          0,
        )
        return data
      },
    ],
  },
  fields: [
    {
      name: 'activityType',
      label: 'Nama kegiatan',
      type: 'relationship',
      relationTo: 'activity-types',
      required: true,
      index: true,
    },
    {
      name: 'date',
      label: 'Tanggal',
      type: 'date',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'place',
      label: 'Tempat',
      type: 'text',
      required: true,
    },
    {
      name: 'time',
      label: 'Waktu',
      type: 'text',
      required: true,
    },
    {
      name: 'attendeeCount',
      label: 'Jumlah orang hadir',
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'notes',
      label: 'Catatan',
      type: 'textarea',
    },
    {
      name: 'sector',
      label: 'Sektor',
      type: 'relationship',
      relationTo: 'sectors',
      required: true,
      index: true,
    },
    {
      name: 'recordedBy',
      label: 'Dicatat oleh',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: serverOwned,
    },
    {
      name: 'hasIncome',
      label: 'Ada pemasukan',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'incomeEntries',
      label: 'Rincian pemasukan',
      type: 'array',
      fields: [
        {
          name: 'source',
          label: 'Sumber pemasukan',
          type: 'relationship',
          relationTo: 'income-sources',
          required: true,
        },
        {
          name: 'breakdown',
          label: 'Pecahan uang',
          type: 'array',
          fields: [
            {
              name: 'denomination',
              label: 'Pecahan',
              type: 'number',
              min: 0,
              required: true,
            },
            {
              name: 'quantity',
              label: 'Jumlah lembar/koin',
              type: 'number',
              min: 0,
              required: true,
            },
            {
              name: 'subtotal',
              label: 'Subtotal',
              type: 'number',
              min: 0,
              access: serverOwned,
            },
          ],
        },
        {
          name: 'total',
          label: 'Total sumber',
          type: 'number',
          min: 0,
          access: serverOwned,
        },
      ],
    },
    {
      name: 'grandTotal',
      label: 'Total keseluruhan',
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: serverOwned,
    },
  ],
  timestamps: true,
}
