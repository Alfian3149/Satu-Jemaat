import Image from 'next/image'
import { Brand } from '@/components/Brand'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-church-cloud lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative h-48 overflow-hidden lg:h-dvh">
        <Image
          alt="Gedung gereja beratap terakota dengan jendela kaca patri"
          className="object-cover object-[72%_center]"
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          src="/images/gereja-satujemaat.png"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-church-deep/75 via-church-deep/5 to-transparent lg:bg-gradient-to-r" />
        <div className="absolute inset-x-0 bottom-0 hidden p-10 text-white lg:block">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-church-sky-soft">
            Bertumbuh dalam kebersamaan
          </p>
          <h1 className="mt-3 max-w-lg text-4xl font-extrabold leading-tight">
            Data yang rapi untuk pelayanan yang lebih dekat.
          </h1>
        </div>
      </section>
      <section className="relative grid px-4 py-8 sm:place-items-center sm:px-8">
        <div className="pointer-events-none absolute -right-24 top-12 size-64 rounded-full bg-church-sky-soft/70 blur-3xl" />
        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <Brand />
          </div>
          {children}
          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            Data jemaat terlindungi dan hanya dapat diakses sesuai kewenangan.
          </p>
        </div>
      </section>
    </main>
  )
}
