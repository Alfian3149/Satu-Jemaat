import path from 'path'
import { buildFigmaConfig } from '@payloadcms/figma'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { buildConfig, type DatabaseAdapterResult } from 'payload'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Sectors } from './collections/Sectors'
import { Households } from './collections/Households'
import { Members } from './collections/Members'
import { MemberPhotos } from './collections/MemberPhotos'
import { AdvancedMemberData } from './collections/AdvancedMemberData'
import { ActivityTypes } from './collections/ActivityTypes'
import { IncomeSources } from './collections/IncomeSources'
import { ActivityRecords } from './collections/ActivityRecords'
import { resendAdapter } from '@payloadcms/email-resend'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Figma Make injects these. Vercel does not. The public app reads Supabase,
// so a Vercel build must not call buildFigmaConfig or it exits before compile.
function figmaBackendConfigured() {
  return Boolean(
    process.env.FIGMA_EID ||
      process.env.FIGMA_CONTENT_API_CONTENT_SYSTEM_ID ||
      process.env.FIGMA_CONTENT_API_ACCESS_KEY,
  )
}

const placeholderDb: DatabaseAdapterResult = {
  name: 'vercel-placeholder',
  defaultIDType: 'text',
  init: () => {
    throw new Error(
      'Payload admin is not available on this deployment. The public app uses Supabase.',
    )
  },
}

const config = {
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en: adminLanguage },
  },
  collections: [
    Admins,
    Users,
    Sectors,
    Households,
    Members,
    MemberPhotos,
    AdvancedMemberData,
    ActivityTypes,
    IncomeSources,
    ActivityRecords,
    Media,
    Folders,
    Tags,
  ],
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY ?? '',
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@example.com',
    defaultFromName: 'SatuJemaat',
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
}

export default figmaBackendConfigured()
  ? buildFigmaConfig({
      ...config,
      figma: {},
    })
  : buildConfig({
      ...config,
      editor: lexicalEditor(),
      secret: process.env.PAYLOAD_SECRET || 'satu-jemaat-public-app',
      db: placeholderDb,
    })
