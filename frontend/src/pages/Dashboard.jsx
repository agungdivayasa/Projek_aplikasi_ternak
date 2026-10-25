import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import { ternak } from '../data/ternak'
import { komoditas } from '../data/komoditas'

const jumlah = daftar => daftar.reduce((a, t) => a + t.jumlah, 0)

export default function Dashboard() {
  const pindah = useNavigate()
  const [saring, setSaring] = useState('Semua')

  const total = jumlah(ternak)
  const sehat = jumlah(ternak.filter(t => t.status === 'Sehat'))
  const sakit = jumlah(ternak.filter(t => t.status === 'Sakit'))
  const perhatian = ternak.filter(t => t.status === 'Sakit')

  const tampil = komoditas.filter(k => saring === 'Semua' || k.nama === saring)

  const dataGrafik = komoditas.map(k => ({
    nama: k.nama,
    jumlah: jumlah(ternak.filter(t => t.komoditas === k.nama)),
    warna: k.warna,
  }))

  const ringkasan = [
    { judul: 'Total Ternak', nilai: total, ikon: 'inventory_2', kelas: 'text-on-surface' },
    { judul: 'Sehat', nilai: sehat, ikon: 'favorite', kelas: 'text-primary' },
    { judul: 'Sakit', nilai: sakit, ikon: 'medical_services', kelas: 'text-tertiary' },
    { judul: 'Jenis Komoditas', nilai: komoditas.length, ikon: 'category', kelas: 'text-on-surface' },
  ]

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Banner sambutan */}
        <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-sm">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
          <div className="absolute right-64 -bottom-20 w-64 h-64 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Data Peternakan Terkini ☀️
              </span>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-display-lg sm:text-display-lg text-on-surface tracking-tight">
                Selamat Datang, Pak Budi! 👋
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Semua data di <span className="text-primary font-semibold">Peternakan Berkah Jaya</span> ada di sini. Periksa ternak yang berstatus sakit dan perbarui catatan secara rutin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => pindah('/ternak/form')}
              className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-label-lg text-label-lg shadow-sm flex items-center justify-center gap-2.5 transition-transform active:scale-95 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
              <span>Catat Ternak Baru</span>
            </button>
          </div>
        </div>

        {/* Kartu ringkasan */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ringkasan.map(r => (
            <div key={r.judul} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">{r.judul}</span>
                <span className={'material-symbols-outlined text-[22px] ' + r.kelas}>{r.ikon}</span>
              </div>
              <div className={'font-metric-val text-metric-val mt-2 ' + r.kelas}>{r.nilai}</div>
            </div>
          ))}
        </div>

        {/* Judul bagian dan filter */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-6 rounded-full bg-primary"></span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight">Ternak Saya</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                {komoditas.length} Komoditas Aktif
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant pl-5">
              Kelola komoditas ternak yang Anda miliki beserta status ternaknya.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">filter_list</span>
            <select
              value={saring}
              onChange={e => setSaring(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
            >
              <option value="Semua">Semua Komoditas</option>
              {komoditas.map(k => <option key={k.nama} value={k.nama}>{k.nama}</option>)}
            </select>
          </div>
        </div>

        {/* Kartu per komoditas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tampil.map((k, i) => {
            const data = ternak.filter(t => t.komoditas === k.nama)
            const s = status => jumlah(data.filter(t => t.status === status))
            const populasi = jumlah(data)
            const persenSehat = populasi ? Math.round((s('Sehat') / populasi) * 100) : 0
            const jumlahRas = new Set(data.map(t => t.ras)).size
            const rataRata = data.length ? Math.round(populasi / data.length) : 0

            return (
              <div key={k.nama} className="group relative rounded-3xl bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div className={'absolute top-0 right-0 w-32 h-32 rounded-bl-full group-hover:scale-110 transition-transform duration-500 ' + k.hiasan}></div>

                <div className="relative z-10 space-y-5">
                  {/* Bagian atas kartu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3.5">
                      <div className={'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 ' + k.latar}>
                        {k.emoji}
                      </div>
                      <div className="space-y-0.5">
                        <span className={'font-label-sm text-label-sm uppercase tracking-wider ' + k.teks}>
                          Komoditas {String.fromCharCode(65 + komoditas.findIndex(x => x.nama === k.nama))}
                        </span>
                        <h3 className="font-headline-md text-headline-md text-on-surface leading-tight">{k.nama}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{k.ket}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm shrink-0">
                      {k.lokasi}
                    </span>
                  </div>

                  {/* Total populasi */}
                  <div className="p-4 rounded-2xl bg-surface-container-low flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Total Populasi</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-metric-val text-metric-val text-on-surface">{populasi}</span>
                        <span className="font-label-lg text-label-lg text-on-surface-variant">Ekor</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-sm text-label-sm text-primary flex items-center justify-end gap-0.5">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> {persenSehat}% Sehat
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{data.length} catatan data</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Status Ternak</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-label-md text-label-md">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span>{s('Sehat')} Sehat</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        <span>{s('Sakit')} Sakit</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">
                        <span className="w-2 h-2 rounded-full bg-outline"></span>
                        <span>{s('Terjual')} Terjual</span>
                      </div>
                    </div>
                  </div>

                  {/* Dua metrik kecil */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-surface-container flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Jumlah Ras</span>
                      <span className="font-title-lg text-title-lg text-on-surface mt-0.5">{jumlahRas}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Rata-rata per Catatan</span>
                      <span className="font-title-lg text-title-lg text-on-surface mt-0.5">
                        {rataRata} <span className="font-body-sm text-body-sm text-on-surface-variant">ekor</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 relative z-10">
                  <button
                    type="button"
                    onClick={() => pindah('/ternak')}
                    className="w-full py-3.5 px-4 rounded-2xl bg-surface-container group-hover:bg-primary group-hover:text-on-primary text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                  >
                    <span>Kelola Ternak {k.nama}</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Grafik dan perlu perhatian */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">donut_large</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Komposisi Populasi</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Jumlah ternak per komoditas</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dataGrafik} dataKey="jumlah" nameKey="nama" innerRadius={60} outerRadius={100} paddingAngle={2} label>
                  {dataGrafik.map(d => <Cell key={d.nama} fill={d.warna} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Perlu perhatian */}
            <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Perlu Perhatian</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Ternak dengan status sakit</p>
                </div>
              </div>

              {perhatian.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant">Semua ternak dalam kondisi baik.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {perhatian.map(t => (
                    <div key={t.id} className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-label-lg text-label-lg text-on-surface truncate">{t.kode} · {t.komoditas}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Ras {t.ras}, {t.jumlah} ekor</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm shrink-0">
                        Sakit
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => pindah('/ternak')}
                className="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Lihat Semua Data Ternak
              </button>
            </div>

            {/* Tips */}
            <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">lightbulb</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Tips Peternak</span>
                  <h4 className="font-title-lg text-title-lg text-on-surface leading-snug">Catat Data Secara Rutin</h4>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Perbarui status ternak setiap kali ada perubahan, terutama saat ada yang sakit atau terjual, supaya ringkasan di dashboard selalu akurat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}