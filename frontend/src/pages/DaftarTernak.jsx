import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { ternak } from '../data/ternak'
import { komoditas as daftarKomoditas } from '../data/komoditas'

const perHalaman = 5
const jumlah = daftar => daftar.reduce((a, t) => a + t.jumlah, 0)

const kelasStatus = {
  Sehat: { badge: 'bg-primary-fixed/40 text-primary', titik: 'bg-primary' },
  Sakit: { badge: 'bg-tertiary-fixed/60 text-tertiary', titik: 'bg-tertiary' },
  Terjual: { badge: 'bg-surface-container text-on-surface-variant', titik: 'bg-outline' },
}

const kelasPilihan =
  'w-full h-12 px-3.5 pr-8 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none appearance-none cursor-pointer focus:bg-surface transition-all'

export default function DaftarTernak() {
  const pindah = useNavigate()
  const [daftar, setDaftar] = useState(ternak)
  const [komoditas, setKomoditas] = useState('Semua')
  const [status, setStatus] = useState('Semua')
  const [cari, setCari] = useState('')
  const [halaman, setHalaman] = useState(1)
  const [hapus, setHapus] = useState(null) // data yang akan dihapus

  const hasil = daftar.filter(t =>
    (t.kode + ' ' + t.ras + ' ' + t.komoditas).toLowerCase().includes(cari.toLowerCase()) &&
    (komoditas === 'Semua' || t.komoditas === komoditas) &&
    (status === 'Semua' || t.status === status)
  )

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / perHalaman))
  const halamanAktif = Math.min(halaman, totalHalaman)
  const awal = (halamanAktif - 1) * perHalaman
  const tampil = hasil.slice(awal, awal + perHalaman)

  function ubah(setter) {
    return nilai => {
      setter(nilai)
      setHalaman(1)
    }
  }

  function konfirmasiHapus() {
    setDaftar(daftar.filter(t => t.id !== hapus.id))
    setHapus(null)
  }

  const kartu = [
    { judul: 'Total Populasi', nilai: jumlah(daftar), ikon: 'pets', latar: 'bg-surface-container text-primary', kelas: 'text-on-surface' },
    { judul: 'Sehat', nilai: jumlah(daftar.filter(t => t.status === 'Sehat')), ikon: 'favorite', latar: 'bg-primary-fixed/50 text-primary', kelas: 'text-primary' },
    { judul: 'Perlu Pengawasan', nilai: jumlah(daftar.filter(t => t.status === 'Sakit')), ikon: 'medication_liquid', latar: 'bg-tertiary-fixed/60 text-tertiary', kelas: 'text-tertiary' },
    { judul: 'Terjual', nilai: jumlah(daftar.filter(t => t.status === 'Terjual')), ikon: 'sell', latar: 'bg-secondary-fixed/40 text-secondary', kelas: 'text-on-surface' },
  ]

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Judul dan tombol tambah */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <button
                type="button"
                onClick={() => pindah('/dashboard')}
                className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Ternak Saya
              </button>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-semibold">Semua Ternak</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg font-bold text-on-surface tracking-tight">
                Daftar Ternak
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-bold">
                Unit Berkah Jaya
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => pindah('/ternak/form')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-md hover:shadow-lg transition-all active:scale-95 self-start md:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Tambah Ternak Baru
          </button>
        </div>

        {/* Kartu ringkasan */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kartu.map(k => (
            <div key={k.judul} className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{k.judul}</p>
                <p className={'font-metric-val text-metric-val ' + k.kelas}>
                  {k.nilai} <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">Ekor</span>
                </p>
              </div>
              <div className={'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ' + k.latar}>
                <span className="material-symbols-outlined text-[28px]">{k.ikon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tab komoditas, pencarian, dan filter */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => ubah(setKomoditas)('Semua')}
              className={
                'px-5 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 shrink-0 transition-colors cursor-pointer ' +
                (komoditas === 'Semua'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant')
              }
            >
              <span>Semua Ternak</span>
              <span className={'px-2 py-0.5 rounded-full font-bold text-label-sm ' + (komoditas === 'Semua' ? 'bg-white/20' : 'bg-surface-container')}>
                {jumlah(daftar)}
              </span>
            </button>
            {daftarKomoditas.map(k => (
              <button
                key={k.nama}
                type="button"
                onClick={() => ubah(setKomoditas)(k.nama)}
                className={
                  'px-5 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 shrink-0 transition-colors cursor-pointer ' +
                  (komoditas === k.nama
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant')
                }
              >
                <span>{k.emoji}</span>
                <span>{k.nama}</span>
                <span className={'px-2 py-0.5 rounded-full font-semibold text-label-sm ' + (komoditas === k.nama ? 'bg-white/20' : 'bg-surface-container')}>
                  {jumlah(daftar.filter(t => t.komoditas === k.nama))}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-6 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                value={cari}
                onChange={e => ubah(setCari)(e.target.value)}
                placeholder="Cari kode, ras, atau komoditas..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface transition-all"
              />
            </div>
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <select value={komoditas} onChange={e => ubah(setKomoditas)(e.target.value)} className={kelasPilihan}>
                  <option value="Semua">Komoditas: Semua</option>
                  {daftarKomoditas.map(k => <option key={k.nama} value={k.nama}>{k.nama}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">unfold_more</span>
              </div>
              <div className="relative">
                <select value={status} onChange={e => ubah(setStatus)(e.target.value)} className={kelasPilihan}>
                  <option value="Semua">Status: Semua</option>
                  <option value="Sehat">Sehat</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Terjual">Terjual</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">unfold_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-4 px-6">Kode Ternak</th>
                  <th className="py-4 px-4">Komoditas</th>
                  <th className="py-4 px-4">Ras</th>
                  <th className="py-4 px-4">Jumlah</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface">
                {tampil.map((t, i) => {
                  const k = daftarKomoditas.find(x => x.nama === t.komoditas)
                  const s = kelasStatus[t.status]
                  return (
                    <tr key={t.id} className={'hover:bg-surface-container-low/70 transition-colors ' + (i % 2 === 1 ? 'bg-surface-container-low/20' : '')}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className={'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm ' + k.latar}>
                            {k.emoji}
                          </div>
                          <span className="font-title-lg text-title-lg font-bold text-on-surface leading-tight">{t.kode}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-label-md text-label-md text-on-surface">{t.komoditas}</span>
                      </td>
                      <td className="py-4 px-4">{t.ras}</td>
                      <td className="py-4 px-4">
                        <span className="font-title-lg text-title-lg font-bold text-on-surface">{t.jumlah}</span>{' '}
                        <span className="text-on-surface-variant">ekor</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-bold ' + s.badge}>
                          <span className={'w-2 h-2 rounded-full ' + s.titik}></span>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit data"
                            onClick={() => pindah('/ternak/form?mode=edit')}
                            className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            type="button"
                            title="Hapus data"
                            onClick={() => setHapus(t)}
                            className="p-2 rounded-lg text-on-surface-variant hover:text-tertiary hover:bg-tertiary-fixed/60 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {hasil.length === 0 && (
              <div className="py-12 text-center text-on-surface-variant font-body-md text-body-md">
                <span className="material-symbols-outlined text-[40px] block mb-2">search_off</span>
                Data tidak ditemukan
              </div>
            )}
          </div>

          {/* Penomoran halaman */}
          <div className="px-6 py-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
            <div>
              Menampilkan{' '}
              <span className="font-semibold text-on-surface">
                {hasil.length === 0 ? 0 : awal + 1} - {awal + tampil.length}
              </span>{' '}
              dari <span className="font-semibold text-on-surface">{hasil.length}</span> catatan data
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={halamanAktif === 1}
                onClick={() => setHalaman(halamanAktif - 1)}
                className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalHalaman }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setHalaman(n)}
                  className={
                    'w-8 h-8 rounded-lg font-label-sm text-label-sm cursor-pointer ' +
                    (n === halamanAktif
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'hover:bg-surface-container text-on-surface')
                  }
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={halamanAktif === totalHalaman}
                onClick={() => setHalaman(halamanAktif + 1)}
                className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup hapus */}
      {hapus && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setHapus(null)}
        >
          <div
            className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-7 border border-slate-100/80 text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 ring-8 ring-red-50/50 text-red-600">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface tracking-tight leading-snug">Hapus Data Ternak?</h3>
                <p className="font-body-sm text-body-sm text-slate-500 mt-0.5">Konfirmasi penghapusan data ternak.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-slate-100 mb-5 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">info</span>
              <p className="font-body-sm text-body-sm text-slate-600">
                Data ternak{' '}
                <span className="font-semibold text-on-surface">{hapus.kode} ({hapus.komoditas} {hapus.ras})</span>{' '}
                yang dihapus tidak dapat dikembalikan dari sistem.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setHapus(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-label-md text-label-md text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={konfirmasiHapus}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-label-md text-label-md font-semibold shadow-md shadow-red-200 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}