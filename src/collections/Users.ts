import type { CollectionConfig, Where } from 'payload'
import { admins, adminsField, isAppAdmin, isAppUser, isCMSAdmin } from '@/access/app-access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Akun Jemaat',
    plural: 'Akun Jemaat',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 24 * 7,
    forgotPassword: {
      generateEmailHTML: (args = {}) => {
        const { token, user } = args
        const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const name = user && typeof user.name === 'string' ? user.name : 'Bapak/Ibu'
        const resetURL = `${baseURL}/reset-password?token=${encodeURIComponent(token ?? '')}`
        return `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18342c">
            <h2>Atur ulang kata sandi SatuJemaat</h2>
            <p>Salam, ${name}.</p>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.</p>
            <p><a href="${resetURL}">Klik di sini untuk membuat kata sandi baru</a></p>
            <p>Jika Anda tidak meminta perubahan ini, abaikan email ini.</p>
          </div>
        `
      },
      generateEmailSubject: () => 'Atur ulang kata sandi SatuJemaat',
    },
  },
  access: {
    create: () => true,
    delete: admins,
    read: ({ req }) => {
      const user = req.user
      if (isCMSAdmin(user) || isAppAdmin(user)) return true
      if (!isAppUser(user)) return false
      if (user.role === 'sector-officer' && user.sector) {
        const sector =
          typeof user.sector === 'object' && user.sector && 'id' in user.sector
            ? user.sector.id
            : user.sector
        return {
          or: [{ id: { equals: user.id } }, { sector: { equals: sector } }],
        } as Where
      }
      return { id: { equals: user.id } } as Where
    },
    update: ({ req }) => {
      if (isCMSAdmin(req.user) || isAppAdmin(req.user)) return true
      return isAppUser(req.user) ? ({ id: { equals: req.user.id } } as Where) : false
    },
  },
  admin: {
    group: 'Pendataan Gereja',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'sector'],
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && !isCMSAdmin(req.user) && !isAppAdmin(req.user)) {
          data.role = 'member'
          delete data.sector
          delete data.household
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      label: 'Nama lengkap',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Hak akses',
      type: 'select',
      required: true,
      defaultValue: 'member',
      saveToJWT: true,
      options: [
        { label: 'Admin Aplikasi', value: 'admin' },
        { label: 'Petugas Sektor', value: 'sector-officer' },
        { label: 'Jemaat', value: 'member' },
      ],
      access: {
        create: adminsField,
        update: adminsField,
      },
    },
    {
      name: 'sector',
      label: 'Sektor tugas',
      type: 'relationship',
      relationTo: 'sectors',
      saveToJWT: true,
      access: {
        create: adminsField,
        update: adminsField,
      },
    },
    {
      name: 'household',
      label: 'Kartu keluarga',
      type: 'relationship',
      relationTo: 'households',
      saveToJWT: true,
      access: {
        create: adminsField,
        update: adminsField,
      },
    },
  ],
  timestamps: true,
}
