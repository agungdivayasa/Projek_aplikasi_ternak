import { NavLink, useNavigate } from 'react-router-dom'

// aktif: true = punya halaman di prototype, false = hanya tampilan menu
const menu = [
  { to: '/dashboard', ikon: 'dashboard', nama: 'Ternak Saya / Dashboard', pendek: 'Dashboard', aktif: true },
  { to: '/ternak', ikon: 'pets', nama: 'Daftar Ternak', pendek: 'Ternak', aktif: true },
  { ikon: 'health_and_safety', nama: 'Kesehatan', aktif: false },
  { ikon: 'grass', nama: 'Pakan', aktif: false },
  { ikon: 'payments', nama: 'Keuangan', aktif: false },
  { ikon: 'analytics', nama: 'Laporan', aktif: false },
]

export default function Sidebar() {
  const pindah = useNavigate()

  const kelasMenu = ({ isActive }) =>
    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-label-md text-label-md ' +
    (isActive
      ? 'bg-primary-container text-on-primary-container font-semibold'
      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface')

  return (
    <>
      {/* Sidebar layar lebar */}
      <aside className="hidden lg:flex w-72 shrink-0 h-full bg-white z-50 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col">
          <div className="h-20 px-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
              <img alt="Logo TernakKu" className="h-8 w-auto object-contain" src="/logo.png" />
            </div>
            <div className="flex flex-col">
              <span className="font-title-lg text-title-lg font-bold tracking-tight text-primary leading-tight">TernakKu</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Sistem Manajemen Ternak</span>
            </div>
          </div>

          <nav className="px-4 py-2 space-y-1.5">
            {menu.map(m =>
              m.aktif ? (
                <NavLink key={m.nama} to={m.to} className={kelasMenu}>
                  <span className="material-symbols-outlined text-[22px]">{m.ikon}</span>
                  <span>{m.nama}</span>
                </NavLink>
              ) : (
                <div
                  key={m.nama}
                  aria-disabled="true"
                  title="Fitur ini belum tersedia di prototype"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-md text-label-md text-on-surface-variant opacity-60 cursor-not-allowed select-none"
                >
                  <span className="material-symbols-outlined text-[22px]">{m.ikon}</span>
                  <span className="flex-1">{m.nama}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm">Segera</span>
                </div>
              )
            )}
          </nav>
        </div>

        <div className="p-4">
          <div className="p-3 rounded-xl bg-surface-container-low flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[20px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate">Pak Budi</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Pemilik Peternakan</p>
            </div>
            <button
              type="button"
              aria-label="Keluar"
              onClick={() => pindah('/login')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Menu bawah untuk HP */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.08)] flex justify-around items-center px-2 py-1.5">
        {menu.filter(m => m.aktif).map(m => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              'flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl font-label-sm text-label-sm transition-colors ' +
              (isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant')
            }
          >
            <span className="material-symbols-outlined text-[24px]">{m.ikon}</span>
            <span>{m.pendek}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => pindah('/login')}
          className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl font-label-sm text-label-sm text-on-surface-variant cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">logout</span>
          <span>Keluar</span>
        </button>
      </nav>
    </>
  )
}