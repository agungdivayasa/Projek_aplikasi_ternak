import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { komoditas } from '../data/komoditas'
const daftarKomoditas = komoditas.map(k => k.nama)

const keunggulan = [
  { ikon: 'inventory_2', judul: 'Satu Aplikasi, Banyak Komoditas', isi: 'Catat sapi, kambing, dan ayam dengan detail yang menyesuaikan tiap komoditas.' },
  { ikon: 'devices', judul: 'Akses dari HP & Komputer', isi: 'Tampilan responsif, catat di kandang lewat ponsel dan pantau lewat komputer.' },
  { ikon: 'verified_user', judul: 'Login Aman', isi: 'Kata sandi disimpan terenkripsi dan akses dilindungi token JWT.' },
]

const kolom =
  'w-full pl-11 pr-4 py-3 bg-surface rounded-xl placeholder:text-outline/70 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md transition shadow-sm'

function Ikon({ nama }) {
  return (
    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
      {nama}
    </span>
  )
}

export default function Register() {
  const pindah = useNavigate()
  const [pilih, setPilih] = useState(['Sapi', 'Kambing'])
  const [sandi, setSandi] = useState('')
  const [ulang, setUlang] = useState('')
  const [lihat1, setLihat1] = useState(false)
  const [lihat2, setLihat2] = useState(false)
  const [memuat, setMemuat] = useState(false)

  const tidakCocok = ulang !== '' && sandi !== ulang

  function ubahKomoditas(k) {
    setPilih(pilih.includes(k) ? pilih.filter(x => x !== k) : [...pilih, k])
  }

  function daftar(e) {
    e.preventDefault()
    if (tidakCocok) return
    setMemuat(true)
    setTimeout(() => pindah('/login'), 900)
  }

  return (
    <main className="w-full h-dvh overflow-y-auto bg-background font-body-md text-on-surface antialiased">
      <div className="w-full max-w-7xl mx-auto py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Panel kiri: hanya di layar lebar */}
          <div className="hidden lg:flex lg:col-span-5 flex-col space-y-6 sticky top-6">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col items-start space-y-5 relative z-10">
                <div className="rounded-xl bg-surface-container-low p-2 inline-block">
                  <img alt="Logo TernakKu" className="h-16 w-auto object-contain" src="/logo.png" />
                </div>
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm tracking-wide uppercase">
                    <span className="material-symbols-outlined text-[16px]">eco</span>
                    Manajemen Peternakan Multi Komoditas
                  </span>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Kelola Peternakan Lebih Terukur dan Modern
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Catat data ternak, cari dan filter dengan cepat, lalu pantau ringkasannya lewat dashboard statistik.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm space-y-4">
              <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Mengapa TernakKu?
              </div>
              {keunggulan.map(k => (
                <div key={k.judul} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{k.ikon}</span>
                  </div>
                  <div>
                    <div className="font-label-lg text-label-lg text-on-surface">{k.judul}</div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{k.isi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel kanan: formulir */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 sm:p-10 shadow-sm">
            {/* Logo kecil untuk HP */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center p-1">
                <img alt="Logo TernakKu" className="w-full h-full object-contain" src="/logo.png" />
              </div>
              <span className="font-headline-md text-headline-md text-primary-container font-bold">TernakKu</span>
            </div>

            <div className="space-y-2 mb-7">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight">
                Daftar Akun Peternak Baru
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Mulai pencatatan digital peternakan sapi, kambing, dan ayam Anda dengan mudah.
              </p>
            </div>

            <form className="space-y-5" onSubmit={daftar}>
              {/* Nama dan nama peternakan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block font-label-md text-label-md" htmlFor="nama">
                    Nama Lengkap <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Ikon nama="person" />
                    <input id="nama" type="text" placeholder="Contoh: Budi Santoso" className={kolom} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-md text-label-md" htmlFor="peternakan">
                    Nama Peternakan
                  </label>
                  <div className="relative">
                    <Ikon nama="cottage" />
                    <input id="peternakan" type="text" placeholder="Contoh: Peternakan Berkah Jaya" className={kolom} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md" htmlFor="email">
                  Email <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Ikon nama="mail" />
                  <input id="email" type="email" placeholder="nama@peternakan.id" className={kolom} />
                </div>
              </div>

              {/* Komoditas */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="block font-label-md text-label-md">Komoditas Utama</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Bisa pilih lebih dari satu</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {daftarKomoditas.map(k => {
                    const aktif = pilih.includes(k)
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => ubahKomoditas(k)}
                        className={
                          'px-4 py-2.5 rounded-full font-label-md text-label-md flex items-center gap-2 transition active:scale-95 cursor-pointer ' +
                          (aktif
                            ? 'bg-primary-container text-on-primary-container shadow-sm'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container')
                        }
                      >
                        <span className={'material-symbols-outlined text-[18px] ' + (aktif ? '' : 'text-outline')}>
                          {aktif ? 'check_circle' : 'add'}
                        </span>
                        <span>{k}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Kata sandi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block font-label-md text-label-md" htmlFor="sandi">
                    Kata Sandi <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Ikon nama="lock" />
                    <input
                      id="sandi"
                      type={lihat1 ? 'text' : 'password'}
                      value={sandi}
                      onChange={e => setSandi(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className={kolom + ' pr-11'}
                    />
                    <button
                      type="button"
                      aria-label="Tampilkan atau sembunyikan kata sandi"
                      onClick={() => setLihat1(!lihat1)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface flex items-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">{lihat1 ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-md text-label-md" htmlFor="ulang">
                    Konfirmasi Kata Sandi <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Ikon nama="lock_reset" />
                    <input
                      id="ulang"
                      type={lihat2 ? 'text' : 'password'}
                      value={ulang}
                      onChange={e => setUlang(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className={kolom + ' pr-11 ' + (tidakCocok ? 'ring-2 ring-error' : '')}
                    />
                    <button
                      type="button"
                      aria-label="Tampilkan atau sembunyikan konfirmasi kata sandi"
                      onClick={() => setLihat2(!lihat2)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface flex items-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">{lihat2 ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {tidakCocok && <p className="font-body-sm text-body-sm text-error">Konfirmasi kata sandi tidak cocok.</p>}
                </div>
              </div>

              {/* Persetujuan */}
              <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                <input type="checkbox" className="w-5 h-5 mt-0.5 rounded accent-primary shrink-0 cursor-pointer" />
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi TernakKu.
                </span>
              </label>

              {/* Tombol daftar */}
              <button
                type="submit"
                disabled={memuat}
                className="w-full min-h-[52px] px-7 py-3.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-3 transition hover:bg-primary active:scale-[0.99] shadow-md cursor-pointer disabled:opacity-80"
              >
                {memuat ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[22px]">progress_activity</span>
                    <span>Membuat Akun...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                    <span>Daftar Akun</span>
                  </>
                )}
              </button>

              <p className="pt-2 text-center font-body-md text-body-md text-on-surface-variant">
                Sudah punya akun?
                <button
                  type="button"
                  onClick={() => pindah('/login')}
                  className="font-label-lg text-label-lg text-primary hover:underline ml-1 cursor-pointer"
                >
                  Masuk di sini
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}