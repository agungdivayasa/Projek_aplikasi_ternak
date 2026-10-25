import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const tahap = [
  { pct: 0, pesan: 'Menyiapkan pangkalan data...' },
  { pct: 18, pesan: 'Memuat modul peternakan...' },
  { pct: 45, pesan: 'Sinkronisasi data ternak...' },
  { pct: 78, pesan: 'Memverifikasi autentikasi...' },
  { pct: 94, pesan: 'Menyiapkan dashboard...' },
  { pct: 100, pesan: 'Sistem siap beroperasi.' },
]

export default function Splash() {
  const pindah = useNavigate()
  const [persen, setPersen] = useState(0)
  const [memuat, setMemuat] = useState(false)
  const [statusTerbuka, setStatusTerbuka] = useState(false)

  // Progress bar berjalan sendiri sampai 100%
  useEffect(() => {
    const timer = setInterval(() => {
      setPersen(p => (p >= 100 ? 100 : p + 2))
    }, 45)
    return () => clearInterval(timer)
  }, [])

  const pesan = tahap.filter(t => persen >= t.pct).at(-1).pesan

  function masukSistem() {
    setMemuat(true)
    setTimeout(() => pindah('/login'), 700)
  }

  return (
    <main className="w-full min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col justify-center items-center p-6">
      <div className="flex flex-col w-full items-center justify-between min-h-[85vh] relative overflow-hidden select-none">
        {/* Hiasan latar */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-surface-container-high/40 rounded-full blur-2xl pointer-events-none"></div>

        {/* Pita atas */}
        <div className="w-full flex items-center justify-between px-6 py-2 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low/80 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase">Sistem Online</span>
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span>Autentikasi JWT</span>
          </div>
        </div>

        {/* Bagian tengah */}
        <div className="flex flex-col items-center justify-center my-auto z-10 max-w-xl w-full px-4 text-center">
          {/* Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary-fixed-dim/30 rounded-3xl blur-xl"></div>
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-surface-container-lowest shadow-xl flex items-center justify-center p-3.5">
              <div className="w-full h-full rounded-2xl bg-gradient-to-b from-surface-container-low to-surface-container-lowest flex items-center justify-center overflow-hidden">
                <img alt="Logo TernakKu" className="w-full h-full object-contain p-2" src="/logo.png" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 bg-primary-container text-on-primary rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-md">
              <span className="material-symbols-outlined text-[16px]">agriculture</span>
              <span className="font-label-sm text-label-sm uppercase font-bold tracking-tight">Pro</span>
            </div>
          </div>

          {/* Judul */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 rounded-full bg-primary-container"></span>
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-widest">Platform Terintegrasi</span>
              <span className="h-1.5 w-6 rounded-full bg-primary-container"></span>
            </div>
            <h1 className="font-display-lg text-display-lg sm:text-[46px] font-extrabold tracking-tight text-primary-container leading-none">
              TernakKu
            </h1>
            <p className="mt-3.5 font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto leading-relaxed font-medium">
              Sistem Manajemen Peternakan Cerdas, Mudah &amp; Terpadu
            </p>
          </div>

          {/* Progress dan tombol */}
          <div className="w-full max-w-md bg-surface-container-lowest/90 backdrop-blur-lg p-6 rounded-2xl shadow-md flex flex-col items-center mt-2">
            <div className="w-full flex justify-between items-center mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">{memuat ? 'Membuka halaman masuk...' : pesan}</span>
              </div>
              <span className="font-label-md text-label-md text-primary font-bold tracking-wide">{persen}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden mb-5">
              <div className="h-full bg-primary-container rounded-full transition-all duration-150 ease-out" style={{ width: persen + '%' }}></div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                onClick={masukSistem}
                className="flex-1 min-h-[50px] bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
              >
                {memuat ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Memuat Halaman...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setStatusTerbuka(true)}
                className="min-h-[50px] px-4 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-xl font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">sensors</span>
                <span className="hidden sm:inline">Status Sistem</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px] text-primary">lock</span> Login Aman
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px] text-primary">search</span> Cari &amp; Filter Data
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px] text-primary">monitoring</span> Dashboard Statistik
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex items-center justify-center px-6 py-4 z-10 text-on-surface-variant font-body-sm text-body-sm gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">eco</span>
          <span>v1.0 • Dibuat untuk Peternak Indonesia</span>
        </div>
      </div>

      {/* Jendela Status Sistem */}
      {statusTerbuka && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-20" onClick={() => setStatusTerbuka(false)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-headline-md text-headline-md mb-4">Status Sistem TernakKu</h2>
            <ul className="space-y-3 font-body-md text-body-md">
              <li className="flex justify-between"><span>Frontend (React)</span><span className="text-primary font-semibold">Aktif</span></li>
              <li className="flex justify-between"><span>Backend API (Express)</span><span className="text-outline">Tahap pengembangan</span></li>
              <li className="flex justify-between"><span>Database (MongoDB)</span><span className="text-outline">Tahap pengembangan</span></li>
            </ul>
            <button onClick={() => setStatusTerbuka(false)} className="mt-5 w-full min-h-[44px] bg-primary-container text-on-primary rounded-xl font-label-md text-label-md cursor-pointer">Tutup</button>
          </div>
        </div>
      )}
    </main>
  )
}