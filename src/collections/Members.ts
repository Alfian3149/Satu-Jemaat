import type { CollectionConfig } from 'payload'
import {
  admins,
  isAppUser,
  membersReadAccess,
  membersUpdateAccess,
  nikReadAccess,
  staffCreate,
  staffField,
} from '@/access/app-access'

export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: 'Jemaat',
    plural: 'Jemaat',
  },
  access: {
    create: staffCreate,
    delete: admins,
    read: membersReadAccess,
    update: membersUpdateAccess,
  },
  admin: {
    group: 'Pendataan Gereja',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'phone', 'sector', 'status'],
    listSearchableFields: ['fullName', 'nik', 'phone'],
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
      name: 'fullName',
      label: 'Nama lengkap',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'address',
      label: 'Alamat tempat tinggal',
      type: 'textarea',
      required: true,
    },
    {
      name: 'phone',
      label: 'Nomor HP',
      type: 'text',
      required: true,
    },
    {
      name: 'nik',
      label: 'NIK',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      minLength: 16,
      maxLength: 16,
      access: {
        read: nikReadAccess,
      },
    },
    {
      name: 'birthDate',
      label: 'Tanggal lahir',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'sector',
      label: 'Sektor',
      type: 'relationship',
      relationTo: 'sectors',
      required: true,
      index: true,
      access: {
        update: staffField,
      },
    },
    {
      name: 'baptism',
      label: 'Baptis',
      type: 'group',
      fields: [
        {
          name: 'date',
          label: 'Tanggal baptis',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        { name: 'place', label: 'Tempat baptis', type: 'text' },
      ],
    },
    {
      name: 'confirmation',
      label: 'Sidi',
      type: 'group',
      fields: [
        {
          name: 'date',
          label: 'Tanggal sidi',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        { name: 'place', label: 'Tempat sidi', type: 'text' },
      ],
    },
    {
      name: 'household',
      label: 'Kartu keluarga',
      type: 'relationship',
      relationTo: 'households',
      index: true,
      access: {
        update: staffField,
      },
    },
    {
      name: 'familyRole',
      label: 'Peran dalam keluarga',
      type: 'select',
      options: [
        { label: 'Kepala keluarga', value: 'head' },
        { label: 'Suami/Istri', value: 'spouse' },
        { label: 'Anak', value: 'child' },
        { label: 'Ayah/Ibu', value: 'parent' },
        { label: 'Anggota lain', value: 'other' },
      ],
      access: {
        update: staffField,
      },
    },
    {
      name: 'directRelations',
      label: 'Relasi keluarga langsung',
      type: 'array',
      labels: {
        singular: 'Relasi',
        plural: 'Relasi',
      },
      access: {
        update: staffField,
      },
      fields: [
        {
          name: 'relationType',
          label: 'Hubungan',
          type: 'select',
          required: true,
          options: [
            { label: 'Suami', value: 'husband' },
            { label: 'Istri', value: 'wife' },
            { label: 'Ayah', value: 'father' },
            { label: 'Ibu', value: 'mother' },
            { label: 'Anak', value: 'child' },
          ],
        },
        {
          name: 'member',
          label: 'Jemaat terkait',
          type: 'relationship',
          relationTo: 'members',
          required: true,
        },
      ],
    },
    {
      name: 'account',
      label: 'Akun login jemaat',
      type: 'relationship',
      relationTo: 'users',
      unique: true,
      access: {
        create: staffField,
        update: staffField,
      },
    },
    {
      name: 'profilePhoto',
      label: 'Foto profil',
      type: 'upload',
      relationTo: 'member-photos',
      access: {
        update: staffField,
      },
    },
    {
      name: 'selfiePhoto',
      label: 'Foto selfie verifikasi',
      type: 'upload',
      relationTo: 'member-photos',
      access: {
        update: staffField,
      },
    },
    {
      name: 'status',
      label: 'Status keanggotaan',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Aktif', value: 'active' },
        { label: 'Tidak aktif', value: 'inactive' },
      ],
      admin: { position: 'sidebar' },
      access: {
        update: staffField,
      },
    },
  ],
  timestamps: true,
}
