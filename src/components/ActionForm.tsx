'use client'

import { useActionState } from 'react'
import { CheckCircle2, LoaderCircle, Save } from 'lucide-react'
import type { ActionState } from '@/app/(frontend)/actions'

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>

export function ActionForm({
  action,
  children,
  submitLabel = 'Simpan data',
}: {
  action: FormAction
  children: React.ReactNode
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-6">
      {children}
      {state.error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-800"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="size-5" />
          {state.message}
        </p>
      )}
      <button className="primary-button w-full sm:w-auto" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="size-5" />
        )}
        {pending ? 'Menyimpan…' : submitLabel}
      </button>
    </form>
  )
}
