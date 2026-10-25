import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ternak } from '../data/ternak'

export default function Login() {
  const pindah = useNavigate()
  const [lihat, setLihat] = useState(false)
  const [memuat, setMemuat] = useState(false)

  // Angka di panel kiri diambil dari data contoh, supaya sama dengan Dashboard
  const hitung = k => ternak.filter(t => t.komoditas === k).reduce((a, t) => a + t.jumlah, 0)
  const total = ternak.reduce((a, t) => a + t.jumlah, 0)
  const sehat = ternak.filter(t => t.status === 'Sehat').reduce((a, t) => a + t.jumlah, 0)
  const persenSehat = Math.round((sehat / total) * 100)

  function masuk(e) {
    e.preventDefault()
    setMemuat(true)
    setTimeout(() => pindah('/dashboard'), 800)
  }

  return (
    <main className="w-full h-dvh overflow-y-auto bg-background font-body-md text-on-surface antialiased flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl">
        {/* Hiasan latar */}
        <div className="absolute -top-16 -left-16 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Panel kiri: hanya tampil di layar lebar */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary-container via-primary to-on-secondary-fixed text-on-primary p-10 flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary-fixed-dim/10 pointer-events-none"></div>

            <div className="space-y-5 relative z-10">
              <div className="inline-flex items-center gap-3 bg-surface-container-lowest/15 backdrop-blur-md px-4 py-2 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center overflow-hidden p-1 shadow-sm">
                  <img alt="Logo TernakKu" className="w-full h-full object-contain" src="/logo.png" />
                </div>
                <div>
                  <span className="font-headline-md text-headline-md tracking-tight block">TernakKu</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">Sistem Manajemen Ternak</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <span className="font-label-md text-label-md tracking-wide uppercase px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed inline-block">Multi Komoditas</span>
                <h2 className="font-headline-lg text-headline-lg leading-snug font-bold">
                  Kelola Ternak Lebih Mudah, Pantau Hasil Setiap Hari.
                </h2>
                <p className="font-body-md text-body-md text-on-primary-container max-w-sm">
                  Catat sapi, kambing, dan ayam dalam satu aplikasi, lengkap dengan pencarian, filter, dan dashboard statistik.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-6 space-y-3">
              <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-pulse"></span>
                    Ringkasan Data Ternak
                  </span>
                  <span className="font-label-sm text-label-sm text-primary-fixed font-bold">{persenSehat}% Sehat</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['Sapi', 'Kambing', 'Ayam'].map(k => (
                    <div key={k} className="bg-surface-container-lowest/15 rounded-lg py-2 px-1">
                      <p className="font-label-sm text-label-sm text-on-primary-container">{k}</p>
                      <p className="font-title-lg text-title-lg font-bold">{hitung(k)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-on-primary-container">© 2026 TernakKu</div>
            </div>
          </div>

          {/* Panel kanan: formulir */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex items-center bg-surface-container-lowest">
            <div className="w-full max-w-md mx-auto space-y-6">
              {/* Logo kecil untuk tampilan HP (panel kiri disembunyikan) */}
              <div className="lg:hidden flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center p-1">
                  <img alt="Logo TernakKu" className="w-full h-full object-contain" src="/logo.png" />
                </div>
                <span className="font-headline-md text-headline-md text-primary-container font-bold">TernakKu</span>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-sm">agriculture</span>
                  Portal Peternak
                </div>
                <h1 className="font-display-lg-mobile text-display-lg-mobile sm:font-display-lg sm:text-display-lg text-on-surface">Selamat Datang Kembali!</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Masuk ke akun TernakKu untuk memantau data ternak Anda.
                </p>
              </div>

              <form className="space-y-5" onSubmit={masuk}>
                {/* Email */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="nama@peternakan.id"
                      className="w-full h-12 pl-11 pr-4 bg-surface rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Kata Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <input
                      id="password"
                      type={lihat ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      className="w-full h-12 pl-11 pr-12 bg-surface rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                    />
                    <button
                      type="button"
                      aria-label="Tampilkan atau sembunyikan kata sandi"
                      onClick={() => setLihat(!lihat)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">{lihat ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Ingat saya */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg accent-primary cursor-pointer" />
                  <span className="font-body-md text-body-md text-on-surface-variant">Ingat saya di perangkat ini</span>
                </label>

                {/* Tombol masuk */}
                <button
                  type="submit"
                  disabled={memuat}
                  className="w-full py-3.5 px-6 rounded-xl bg-primary-container hover:bg-primary active:scale-[0.99] text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-80"
                >
                  {memuat ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      <span>Membuka Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-center font-body-md text-body-md text-on-surface-variant">
                Belum punya akun?
                <button
                  type="button"
                  onClick={() => pindah('/register')}
                  className="font-label-md text-label-md text-primary font-semibold hover:underline ml-1 cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}