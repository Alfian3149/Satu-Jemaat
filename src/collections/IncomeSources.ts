import type { CollectionConfig } from 'payload'
import { admins, authenticatedAppUsers } from '@/access/app-access'

export const IncomeSources: CollectionConfig = {
  slug: 'income-sources',
  labels: {
    singular: 'Sumber Pemasukan',
    plural: 'Sumber Pemasukan',
  },
  access: {
    create: admins,
    delete: admins,
    read: authenticatedAppUsers,
    update: admins,
  },
  admin: {
    defaultColumns: ['name', 'active', 'order'],
    group: 'Rekam Kegiatan',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      label: 'Nama sumber',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'description',
      label: 'Keterangan',
      type: 'textarea',
    },
    {
      name: 'order',
      label: 'Urutan',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'active',
      label: 'Aktif',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
  ],
  timestamps: true,
}
