import type { CollectionConfig } from 'payload'
import { admins, authenticatedAppUsers } from '@/access/app-access'

export const ActivityTypes: CollectionConfig = {
  slug: 'activity-types',
  labels: {
    singular: 'Master Kegiatan',
    plural: 'Master Kegiatan',
  },
  access: {
    create: admins,
    delete: admins,
    read: authenticatedAppUsers,
    update: admins,
  },
  admin: {
    defaultColumns: ['name', 'active'],
    group: 'Rekam Kegiatan',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      label: 'Nama kegiatan',
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
      name: 'active',
      label: 'Aktif',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
  ],
  timestamps: true,
}
