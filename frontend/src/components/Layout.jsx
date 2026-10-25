import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const pindah = useNavigate()

  function cari(e) {
    e.preventDefault()
    pindah('/ternak')
  }

  return (
    <div className="h-dvh flex bg-[#f9f9ff] font-body-md text-on-surface antialiased">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-16 lg:h-20 shrink-0 bg-[#f9f9ff]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between gap-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          {/* Logo kecil untuk HP */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center p-1">
              <img alt="Logo TernakKu" className="w-full h-full object-contain" src="/logo.png" />
            </div>
            <span className="font-title-lg text-title-lg font-bold text-primary">TernakKu</span>
          </div>

          {/* Pencarian (layar sedang ke atas) */}
          <form onSubmit={cari} className="hidden md:block max-w-md w-full">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                placeholder="Cari kode ternak, ras, atau komoditas..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Unit aktif */}
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-container shrink-0"></div>
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider leading-none">Unit Aktif</span>
                <span className="font-label-md text-label-md text-on-surface leading-tight">Peternakan Berkah Jaya</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-1">expand_more</span>
            </div>

            {/* Lonceng */}
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative w-11 h-11 rounded-xl bg-white flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-tertiary"></span>
            </button>

            {/* Profil */}
            <div className="flex items-center gap-3 pl-1">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-tight">Pak Budi</span>
                <span className="font-body-sm text-body-sm text-primary leading-none">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Isi halaman: hanya bagian ini yang bergulir */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}