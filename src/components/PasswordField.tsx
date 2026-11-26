'use client'

import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useId, useState } from 'react'

export function PasswordField({
  autoComplete,
  label,
  name,
  placeholder,
  withIcon = false,
}: {
  autoComplete: 'current-password' | 'new-password'
  label: string
  name: string
  placeholder: string
  withIcon?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const inputId = useId()

  return (
    <div className="block">
      <label className="mb-2 block text-base font-semibold text-slate-800" htmlFor={inputId}>
        {label}
      </label>
      <span className="relative block">
        {withIcon && (
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          autoComplete={autoComplete}
          className={withIcon ? 'form-control pl-12 pr-12' : 'form-control pr-12'}
          id={inputId}
          minLength={8}
          name={name}
          placeholder={placeholder}
          required
          type={visible ? 'text' : 'password'}
        />
        <button
          aria-controls={inputId}
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </button>
      </span>
    </div>
  )
}
