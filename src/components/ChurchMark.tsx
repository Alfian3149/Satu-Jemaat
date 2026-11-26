export function ChurchMark({ className = 'size-10' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M31.8 4v12M26.5 9.5h10.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M8 56 31.9 14 56 56H8Z"
        fill="#FFFDF8"
        stroke="#A66351"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path d="m31.9 14 24 42h-8.7L31.9 29.1V14Z" fill="#A66351" />
      <path d="M21.8 56 31.9 29l10.3 27H21.8Z" fill="#263A43" />
      <path d="M26.1 48.5h5.2v7.6h-5.2z" fill="#D9AA46" />
      <path d="M32.7 48.5h5.2v7.6h-5.2z" fill="#7E668E" />
      <path d="M27.7 39.6h4.7v7h-4.7z" fill="#70834A" />
      <path d="M33.7 39.6h4.7v7h-4.7z" fill="#A66351" />
    </svg>
  )
}
