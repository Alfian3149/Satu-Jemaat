'use client'

import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useFormStatus } from 'react-dom'

export function AuthSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button className="primary-button w-full" disabled={pending} type="submit">
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      ) : (
        <ArrowRight aria-hidden="true" className="size-5" />
      )}
      {pending ? 'Mohon tunggu…' : label}
    </button>
  )
}
