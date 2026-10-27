import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { ternak } from '../data/ternak'

const kunciPenyimpanan = 'ternakku.catatan-kesehatan'
const perHalaman = 5

const tabKesehatan = [
  { id: 'Semua', label: 'Semua Ternak' },
  { id: 'Sakit', label: 'Perlu Perhatian' },
  { id: 'Sehat', label: 'Sehat' },
]

const formatTanggal = tanggal =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(tanggal))

const jumlahTernak = daftar => daftar.reduce((total, item) => total + item.jumlah, 0)

function Ikon({ nama, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{nama}</span>
}

function KartuRingkasan({ ikon, judul, nilai, keterangan, warna, persentase }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{judul}</p>
          <p className={`mt-2 font-metric-val text-metric-val ${warna}`}>{nilai}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${warna === 'text-primary' ? 'bg-primary-fixed/50' : warna === 'text-tertiary' ? 'bg-tertiary-fixed/60' : 'bg-surface-container'}`}>
          <Ikon nama={ikon} className={`text-[23px] ${warna}`} />
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-container">
        <div className={`h-full rounded-full ${warna === 'text-primary' ? 'bg-primary' : warna === 'text-tertiary' ? 'bg-tertiary' : 'bg-primary-container'}`} style={{ width: `${persentase}%` }} />
      </div>
      <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">{keterangan}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const sehat = status === 'Sehat'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm ${sehat ? 'bg-primary-fixed/50 text-primary' : 'bg-tertiary-fixed/60 text-tertiary'}`}>
      <span className={`h-2 w-2 rounded-full ${sehat ? 'bg-primary' : 'bg-tertiary'}`} />
      {sehat ? 'Sehat' : 'Perlu perhatian'}
    </span>
  )
}

function Modal({ judul, deskripsi, children, tutup }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) tutup()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-modal-kesehatan"
        className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-surface-container-lowest p-5 shadow-xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="judul-modal-kesehatan" className="font-headline-md text-headline-md text-on-surface">{judul}</h2>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{deskripsi}</p>
          </div>
          <button type="button" aria-label="Tutup" onClick={tutup} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container">
            <Ikon nama="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export default function KesehatanTernak() {
  const [tabAktif, setTabAktif] = useState('Semua')
  const [pencarian, setPencarian] = useState('')
  const [halaman, setHalaman] = useState(1)
  const [dataAwal] = useState(() => {
    try {
      const tersimpan = window.localStorage.getItem(kunciPenyimpanan)
      const parsed = tersimpan ? JSON.parse(tersimpan) : []
      if (!Array.isArray(parsed)) {
        throw new Error('Format catatan kesehatan tidak valid.')
      }
      return { catatan: parsed, pesanError: '' }
    } catch (error) {
      console.error('Gagal memuat catatan kesehatan:', error)
      return {
        catatan: [],
        pesanError: 'Catatan kesehatan tidak dapat dimuat dari penyimpanan browser.',
      }
    }
  })
  const [catatan, setCatatan] = useState(dataAwal.catatan)
  const [pesanError] = useState(dataAwal.pesanError)
  const [modalPemeriksaan, setModalPemeriksaan] = useState(null)
  const [ternakTerpilih, setTernakTerpilih] = useState(null)
  const [simpanError, setSimpanError] = useState('')

  const ternakAktif = useMemo(() => ternak.filter(item => item.status !== 'Terjual'), [])
  const totalAktif = jumlahTernak(ternakAktif)
  const totalSehat = jumlahTernak(ternakAktif.filter(item => item.status === 'Sehat'))
  const totalPerhatian = jumlahTernak(ternakAktif.filter(item => item.status === 'Sakit'))

  const catatanTerbaru = useMemo(
    () => [...catatan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)),
    [catatan],
  )

  const ternakTampil = useMemo(() => {
    const kataKunci = pencarian.trim().toLocaleLowerCase('id-ID')
    return ternakAktif.filter(item => {
      const cocokTab = tabAktif === 'Semua' || item.status === tabAktif
      const cocokCari = !kataKunci || `${item.kode} ${item.komoditas} ${item.ras}`.toLocaleLowerCase('id-ID').includes(kataKunci)
      return cocokTab && cocokCari
    })
  }, [ternakAktif, tabAktif, pencarian])

  const totalHalaman = Math.max(1, Math.ceil(ternakTampil.length / perHalaman))
  const halamanAktif = Math.min(halaman, totalHalaman)
  const ternakHalaman = ternakTampil.slice((halamanAktif - 1) * perHalaman, halamanAktif * perHalaman)

  function ubahTab(tab) {
    setTabAktif(tab)
    setHalaman(1)
  }

  function ubahPencarian(nilai) {
    setPencarian(nilai)
    setHalaman(1)
  }

  function simpanPemeriksaan(event) {
    event.preventDefault()
    const dataForm = new FormData(event.currentTarget)
    const kode = String(dataForm.get('kode') || '')
    const hewan = ternakAktif.find(item => item.kode === kode)
    const keluhan = String(dataForm.get('keluhan') || '').trim()
    if (!hewan || !keluhan) {
      setSimpanError('Pilih ternak dan isi hasil pemeriksaan terlebih dahulu.')
      return
    }

    const pemeriksaanBaru = {
      id: `${Date.now()}-${kode}`,
      kode,
      kondisi: String(dataForm.get('kondisi') || 'Sehat'),
      keluhan,
      tindakan: String(dataForm.get('tindakan') || '').trim(),
      dokter: String(dataForm.get('dokter') || '').trim(),
      suhu: String(dataForm.get('suhu') || '').trim(),
      tanggal: new Date().toISOString(),
    }
    const catatanBaru = [pemeriksaanBaru, ...catatan]

    try {
      window.localStorage.setItem(kunciPenyimpanan, JSON.stringify(catatanBaru))
      setCatatan(catatanBaru)
      setSimpanError('')
      setModalPemeriksaan(null)
      setTernakTerpilih(null)
    } catch (error) {
      console.error('Gagal menyimpan catatan pemeriksaan:', error)
      setSimpanError('Catatan gagal disimpan. Periksa ruang penyimpanan browser lalu coba lagi.')
    }
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <Ikon nama="home" className="text-[17px]" />
              <span>Ternak Saya</span>
              <Ikon nama="chevron_right" className="text-[16px]" />
              <span className="text-on-surface">Kesehatan</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface sm:font-headline-lg sm:text-headline-lg">Kesehatan Ternak</h1>
              <span className="rounded-full bg-primary-fixed/50 px-3 py-1 font-label-sm text-label-sm text-primary">Pemantauan aktif</span>
            </div>
            <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Pantau kondisi ternak berdasarkan data inventaris dan simpan hasil pemeriksaan kesehatan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSimpanError('')
              setTernakTerpilih(null)
              setModalPemeriksaan(true)
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary/90"
          >
            <Ikon nama="add_circle" className="text-[21px]" />
            Catat Pemeriksaan
          </button>
        </div>

        {pesanError && (
          <div role="alert" className="flex items-center gap-3 rounded-2xl bg-tertiary-fixed/60 p-4 font-body-sm text-body-sm text-tertiary">
            <Ikon nama="warning" />
            {pesanError}
          </div>
        )}

        <section aria-label="Ringkasan kesehatan ternak" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KartuRingkasan ikon="inventory_2" judul="Ternak Aktif" nilai={totalAktif} keterangan="Ekor, tidak termasuk yang terjual" warna="text-on-surface" persentase={100} />
          <KartuRingkasan ikon="favorite" judul="Kondisi Sehat" nilai={totalSehat} keterangan={`${totalAktif ? Math.round(totalSehat / totalAktif * 100) : 0}% dari ternak aktif`} warna="text-primary" persentase={totalAktif ? totalSehat / totalAktif * 100 : 0} />
          <KartuRingkasan ikon="medical_services" judul="Perlu Perhatian" nilai={totalPerhatian} keterangan="Ekor dengan status sakit" warna="text-tertiary" persentase={totalAktif ? totalPerhatian / totalAktif * 100 : 0} />
          <KartuRingkasan ikon="clinical_notes" judul="Catatan Pemeriksaan" nilai={catatan.length} keterangan="Catatan tersimpan di perangkat ini" warna="text-on-surface" persentase={catatan.length ? 100 : 0} />
        </section>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <section className="space-y-5 rounded-3xl bg-surface-container-lowest p-5 shadow-sm sm:p-7 xl:col-span-8">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Pemantauan Kondisi Ternak</h2>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  Status mengikuti data pada halaman Daftar Ternak. Gunakan catatan pemeriksaan untuk menyimpan hasil kunjungan.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1 rounded-xl bg-surface-container-low p-1" role="tablist" aria-label="Filter kondisi ternak">
                  {tabKesehatan.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={tabAktif === tab.id}
                      onClick={() => ubahTab(tab.id)}
                      className={`rounded-lg px-3 py-2 font-label-sm text-label-sm transition-colors ${tabAktif === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <label className="relative block w-full sm:max-w-xs">
                  <Ikon nama="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-variant" />
                  <input
                    type="search"
                    value={pencarian}
                    onChange={event => ubahPencarian(event.target.value)}
                    placeholder="Cari kode, ras, komoditas..."
                    aria-label="Cari ternak"
                    className="h-11 w-full rounded-xl bg-surface-container-low pl-10 pr-3 font-body-sm text-body-sm text-on-surface outline-none transition focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {ternakHalaman.length ? ternakHalaman.map(item => {
                const pemeriksaanItem = catatanTerbaru.find(catatanItem => catatanItem.kode === item.kode)
                return (
                  <article key={item.id} className="rounded-2xl bg-surface p-4 transition-colors hover:bg-surface-container-low sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.status === 'Sehat' ? 'bg-primary-fixed/50 text-primary' : 'bg-tertiary-fixed/60 text-tertiary'}`}>
                          <Ikon nama={item.status === 'Sehat' ? 'pets' : 'health_and_safety'} className="text-[23px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-label-md text-label-md text-on-surface">{item.komoditas} {item.ras}</h3>
                            <span className="rounded-md bg-surface-container px-2 py-0.5 font-mono text-label-sm text-on-surface-variant">{item.kode}</span>
                          </div>
                          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Jumlah: {item.jumlah} ekor</p>
                          {pemeriksaanItem ? (
                            <p className="mt-2 line-clamp-2 font-body-sm text-body-sm text-on-surface">
                              Pemeriksaan terakhir: {pemeriksaanItem.keluhan}
                            </p>
                          ) : (
                            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Belum ada catatan pemeriksaan.</p>
                          )}
                          {pemeriksaanItem && (
                            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{formatTanggal(pemeriksaanItem.tanggal)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <StatusBadge status={item.status} />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTernakTerpilih(item)}
                            className="rounded-lg px-2 py-1.5 font-label-sm text-label-sm text-primary hover:bg-primary-fixed/50"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSimpanError('')
                              setModalPemeriksaan(item)
                            }}
                            aria-label={`Catat pemeriksaan ${item.kode}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed/50 text-primary transition-colors hover:bg-primary-fixed"
                          >
                            <Ikon nama="edit_note" className="text-[21px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              }) : (
                <div className="rounded-2xl bg-surface-container-low px-5 py-12 text-center">
                  <Ikon nama="search_off" className="text-[36px] text-on-surface-variant" />
                  <p className="mt-2 font-label-md text-label-md text-on-surface">Ternak tidak ditemukan</p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Ubah kata pencarian atau pilih filter kondisi yang lain.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-surface-container pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Menampilkan {ternakTampil.length ? (halamanAktif - 1) * perHalaman + 1 : 0}–{Math.min(halamanAktif * perHalaman, ternakTampil.length)} dari {ternakTampil.length} kelompok ternak
              </p>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Halaman sebelumnya" disabled={halamanAktif <= 1} onClick={() => setHalaman(halamanAktif - 1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40">
                  <Ikon nama="chevron_left" />
                </button>
                <span className="min-w-10 text-center font-label-sm text-label-sm text-on-surface">{halamanAktif} / {totalHalaman}</span>
                <button type="button" aria-label="Halaman berikutnya" disabled={halamanAktif >= totalHalaman} onClick={() => setHalaman(halamanAktif + 1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40">
                  <Ikon nama="chevron_right" />
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6 xl:col-span-4">
            <section className="rounded-3xl bg-surface-container-lowest p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-fixed/60 text-tertiary">
                  <Ikon nama="notification_important" className="text-[22px]" />
                </div>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface">Perlu Perhatian</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{ternakAktif.filter(item => item.status === 'Sakit').length} kelompok berstatus sakit</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {ternakAktif.filter(item => item.status === 'Sakit').length ? ternakAktif.filter(item => item.status === 'Sakit').map(item => (
                  <button key={item.id} type="button" onClick={() => setTernakTerpilih(item)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3 text-left transition-colors hover:bg-tertiary-fixed/40">
                    <span className="min-w-0">
                      <span className="block truncate font-label-md text-label-md text-on-surface">{item.komoditas} {item.ras}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{item.kode} · {item.jumlah} ekor</span>
                    </span>
                    <Ikon nama="chevron_right" className="shrink-0 text-on-surface-variant" />
                  </button>
                )) : (
                  <p className="rounded-xl bg-primary-fixed/40 p-3 font-body-sm text-body-sm text-primary">Tidak ada ternak berstatus sakit.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-primary-container p-5 text-on-primary sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-on-primary/15">
                  <Ikon nama="vaccines" className="text-[22px]" />
                </div>
                <h2 className="font-title-lg text-title-lg">Catatan Data</h2>
              </div>
              <p className="mt-3 font-body-sm text-body-sm leading-relaxed">
                Jadwal vaksinasi dan stok obat belum tersedia pada data aplikasi. Catatan pemeriksaan baru disimpan di browser/perangkat ini.
              </p>
            </section>

            <section className="rounded-3xl bg-surface-container-low p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Ikon nama="info" className="mt-0.5 text-[21px] text-primary" />
                <div>
                  <h2 className="font-label-md text-label-md text-on-surface">Tentang status kesehatan</h2>
                  <p className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                    Status Sehat atau Sakit di halaman ini mengikuti data inventaris ternak. Catatan pemeriksaan tidak mengubah status di Daftar Ternak.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {modalPemeriksaan && (
        <Modal
          judul="Catat Pemeriksaan"
          deskripsi="Simpan hasil pemeriksaan untuk kelompok ternak yang dipilih."
          tutup={() => {
            setModalPemeriksaan(null)
            setSimpanError('')
          }}
        >
          <form className="space-y-4" onSubmit={simpanPemeriksaan}>
            <label className="block space-y-1.5">
              <span className="font-label-sm text-label-sm text-on-surface">Ternak</span>
              <select
                name="kode"
                required
                defaultValue={modalPemeriksaan === true ? '' : modalPemeriksaan.kode}
                className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>Pilih kode ternak</option>
                {ternakAktif.map(item => (
                  <option key={item.id} value={item.kode}>{item.kode} — {item.komoditas} {item.ras} ({item.jumlah} ekor)</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="font-label-sm text-label-sm text-on-surface">Kondisi saat diperiksa</span>
              <select name="kondisi" defaultValue="Sehat" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20">
                <option value="Sehat">Sehat</option>
                <option value="Sakit">Perlu perhatian</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="font-label-sm text-label-sm text-on-surface">Hasil pemeriksaan <span className="text-tertiary">*</span></span>
              <textarea name="keluhan" required maxLength={500} rows={3} placeholder="Tuliskan hasil pemeriksaan atau keluhan..." className="w-full resize-y rounded-xl bg-surface-container-low p-3 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20" />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="font-label-sm text-label-sm text-on-surface">Tindakan / terapi</span>
                <input name="tindakan" maxLength={200} placeholder="Opsional" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="block space-y-1.5">
                <span className="font-label-sm text-label-sm text-on-surface">Nama dokter / petugas</span>
                <input name="dokter" maxLength={100} placeholder="Opsional" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20" />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="font-label-sm text-label-sm text-on-surface">Suhu tubuh (°C)</span>
              <input name="suhu" type="number" min="25" max="45" step="0.1" placeholder="Opsional" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20" />
            </label>
            {simpanError && <p role="alert" className="rounded-xl bg-tertiary-fixed/60 p-3 font-body-sm text-body-sm text-tertiary">{simpanError}</p>}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModalPemeriksaan(null)} className="rounded-xl px-5 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">Batal</button>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary/90">
                <Ikon nama="save" className="text-[19px]" />
                Simpan Pemeriksaan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {ternakTerpilih && (
        <Modal
          judul={`${ternakTerpilih.komoditas} ${ternakTerpilih.ras}`}
          deskripsi={`Ringkasan kesehatan kelompok ternak ${ternakTerpilih.kode}.`}
          tutup={() => setTernakTerpilih(null)}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-4">
              <div>
                <p className="font-mono text-label-md text-on-surface">{ternakTerpilih.kode}</p>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{ternakTerpilih.jumlah} ekor · {ternakTerpilih.komoditas} {ternakTerpilih.ras}</p>
              </div>
              <StatusBadge status={ternakTerpilih.status} />
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-on-surface">Riwayat pemeriksaan</h3>
              <div className="mt-2 space-y-2">
                {catatanTerbaru.filter(item => item.kode === ternakTerpilih.kode).length ? catatanTerbaru.filter(item => item.kode === ternakTerpilih.kode).map(item => (
                  <article key={item.id} className="rounded-xl bg-surface-container-low p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge status={item.kondisi} />
                      <time className="font-body-sm text-body-sm text-on-surface-variant">{formatTanggal(item.tanggal)}</time>
                    </div>
                    <p className="mt-3 font-body-md text-body-md text-on-surface">{item.keluhan}</p>
                    {item.tindakan && <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Tindakan: {item.tindakan}</p>}
                    {item.dokter && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Petugas: {item.dokter}</p>}
                    {item.suhu && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Suhu: {item.suhu}°C</p>}
                  </article>
                )) : (
                  <p className="rounded-xl bg-surface-container-low p-4 font-body-sm text-body-sm text-on-surface-variant">Belum ada catatan pemeriksaan untuk kode ternak ini.</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTernakTerpilih(null)
                setSimpanError('')
                setModalPemeriksaan(ternakTerpilih)
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-label-md text-on-primary hover:bg-primary/90"
            >
              <Ikon nama="add_circle" />
              Catat Pemeriksaan
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
