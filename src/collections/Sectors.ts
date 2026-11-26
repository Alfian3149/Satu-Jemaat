import type { CollectionConfig } from 'payload'
import { admins, authenticatedAppUsers } from '@/access/app-access'

export const Sectors: CollectionConfig = {
  slug: 'sectors',
  labels: {
    singular: 'Sektor',
    plural: 'Sektor',
  },
  access: {
    create: admins,
    delete: admins,
    read: authenticatedAppUsers,
    update: admins,
  },
  admin: {
    group: 'Pendataan Gereja',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code'],
  },
  fields: [
    {
      name: 'name',
      label: 'Nama sektor',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'code',
      label: 'Kode singkat',
      type: 'text',
    },
  ],
  timestamps: true,
}
