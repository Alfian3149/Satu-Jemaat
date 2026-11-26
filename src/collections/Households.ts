import type { CollectionConfig } from 'payload'
import {
  admins,
  householdsReadAccess,
  isAppUser,
  isCMSAdmin,
  staffCreate,
  staffSectorScoped,
} from '@/access/app-access'

export const Households: CollectionConfig = {
  slug: 'households',
  labels: {
    singular: 'Kartu Keluarga',
    plural: 'Kartu Keluarga',
  },
  access: {
    create: staffCreate,
    delete: admins,
    read: householdsReadAccess,
    update: staffSectorScoped,
  },
  admin: {
    group: 'Pendataan Gereja',
    useAsTitle: 'familyName',
    defaultColumns: ['familyName', 'familyNumber', 'sector'],
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (isAppUser(req.user) && req.user.role === 'sector-officer') {
          data.sector =
            typeof req.user.sector === 'object' && req.user.sector && 'id' in req.user.sector
              ? req.user.sector.id
              : req.user.sector
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'familyName',
      label: 'Nama keluarga',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'familyNumber',
      label: 'Nomor Kartu Keluarga',
      type: 'text',
      admin: {
        description: 'Opsional. Isi bila gereja memang menyimpan nomor KK.',
      },
      access: {
        read: ({ req }) => isCMSAdmin(req.user) || Boolean(req.user),
      },
    },
    {
      name: 'address',
      label: 'Alamat keluarga',
      type: 'textarea',
      required: true,
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
      name: 'notes',
      label: 'Catatan keluarga',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
