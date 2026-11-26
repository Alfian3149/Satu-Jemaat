import type { Access, FieldAccess, Where } from 'payload'

type AppUser = {
  collection?: string
  household?: unknown
  id: number | string
  role?: 'admin' | 'member' | 'sector-officer'
  sector?: unknown
}

export const relationshipID = (value: unknown): number | string | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return undefined
}

export const isCMSAdmin = (user: unknown): boolean =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'admins')

export const isAppUser = (user: unknown): user is AppUser =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

export const isAppAdmin = (user: unknown): boolean => isAppUser(user) && user.role === 'admin'

export const isStaff = (user: unknown): boolean =>
  isAppUser(user) && (user.role === 'admin' || user.role === 'sector-officer')

export const staffField: FieldAccess = ({ req }) => isCMSAdmin(req.user) || isStaff(req.user)

export const staffCreate: Access = ({ req }) => isCMSAdmin(req.user) || isStaff(req.user)

export const admins: Access = ({ req }) => isCMSAdmin(req.user) || isAppAdmin(req.user)

export const adminsField: FieldAccess = ({ req }) => isCMSAdmin(req.user) || isAppAdmin(req.user)

export const authenticatedAppUsers: Access = ({ req }) =>
  isAppUser(req.user) || isCMSAdmin(req.user)

export const sectorScoped: Access = ({ req }) => {
  const user = req.user
  if (isCMSAdmin(user) || isAppAdmin(user)) return true
  if (!isAppUser(user)) return false

  if (user.role === 'sector-officer') {
    const sector = relationshipID(user.sector)
    return sector ? ({ sector: { equals: sector } } as Where) : false
  }

  return false
}

export const staffSectorScoped: Access = ({ req }) => {
  const user = req.user
  if (isCMSAdmin(user) || isAppAdmin(user)) return true
  if (!isAppUser(user) || user.role !== 'sector-officer') return false
  const sector = relationshipID(user.sector)
  return sector ? ({ sector: { equals: sector } } as Where) : false
}

export const memberPhotoReadAccess: Access = ({ req }) => {
  const user = req.user
  if (isCMSAdmin(user) || isAppAdmin(user)) return true
  if (!isAppUser(user)) return false

  if (user.role === 'sector-officer') {
    const sector = relationshipID(user.sector)
    return sector ? ({ sector: { equals: sector } } as Where) : false
  }

  return { 'member.account': { equals: user.id } } as Where
}

export const membersReadAccess: Access = ({ req }) => {
  const user = req.user
  if (isCMSAdmin(user) || isAppAdmin(user)) return true
  if (!isAppUser(user)) return false

  if (user.role === 'sector-officer') {
    const sector = relationshipID(user.sector)
    return sector ? ({ sector: { equals: sector } } as Where) : false
  }

  const household = relationshipID(user.household)
  return {
    or: [
      { account: { equals: user.id } },
      ...(household ? [{ household: { equals: household } }] : []),
    ],
  } as Where
}

export const membersUpdateAccess: Access = ({ req }) => {
  const user = req.user
  if (isCMSAdmin(user) || isAppAdmin(user)) return true
  if (!isAppUser(user)) return false

  if (user.role === 'sector-officer') {
    const sector = relationshipID(user.sector)
    return sector ? ({ sector: { equals: sector } } as Where) : false
  }

  return { account: { equals: user.id } } as Where
}

export const nikReadAccess: FieldAccess = ({ doc, req }) => {
  if (isCMSAdmin(req.user) || isStaff(req.user)) return true
  if (!isAppUser(req.user)) return false
  return relationshipID(doc?.account) === req.user.id
}

export const householdsReadAccess: Access = ({ req }) => {
  const user = req.user
  if (isCMSAdmin(user) || isAppAdmin(user)) return true
  if (!isAppUser(user)) return false

  if (user.role === 'sector-officer') {
    const sector = relationshipID(user.sector)
    return sector ? ({ sector: { equals: sector } } as Where) : false
  }

  const household = relationshipID(user.household)
  return household ? ({ id: { equals: household } } as Where) : false
}
