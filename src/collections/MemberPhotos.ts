import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  admins,
  isAppUser,
  isCMSAdmin,
  memberPhotoReadAccess,
  relationshipID,
  staffCreate,
  staffSectorScoped,
} from '@/access/app-access'

export const MemberPhotos: CollectionConfig = {
  slug: 'member-photos',
  labels: {
    singular: 'Foto Jemaat',
    plural: 'Foto Jemaat',
  },
  access: {
    create: staffCreate,
    delete: admins,
    read: memberPhotoReadAccess,
    update: staffSectorScoped,
  },
  admin: {
    group: 'Pendataan Gereja',
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'kind', 'member', 'sector'],
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) return data
        const memberID = relationshipID(data?.member ?? originalDoc?.member)
        if (!memberID) {
          throw new APIError('Foto harus dihubungkan dengan data jemaat.', 400)
        }

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
          throw new APIError('Anda tidak memiliki izin mengunggah foto jemaat.', 403)
        }

        if (operation === 'create' || data) data.sector = memberSector
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Keterangan foto',
      type: 'text',
      required: true,
    },
    {
      name: 'kind',
      label: 'Jenis foto',
      type: 'select',
      required: true,
      options: [
        { label: 'Foto profil', value: 'profile' },
        { label: 'Foto selfie verifikasi', value: 'selfie' },
      ],
    },
    {
      name: 'member',
      label: 'Jemaat',
      type: 'relationship',
      relationTo: 'members',
      required: true,
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
  ],
  upload: {
    displayPreview: true,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      return headers
    },
  },
  timestamps: true,
}
