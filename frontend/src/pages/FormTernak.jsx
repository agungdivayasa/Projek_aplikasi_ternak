import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { komoditas as daftarKomoditas, unggas } from '../data/komoditas'

const daftarStatus = [
  { nama: 'Sehat', ikon: 'check_circle' },
  { nama: 'Sakit', ikon: 'coronavirus' },
  { nama: 'Terjual', ikon: 'sell' },
]

const kolom =
  'w-full h-12 pl-12 pr-4 rounded-xl bg-surface font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all'

function Ikon({ nama }) {
  return (
    <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none">
      {nama}
    </span>
  )
}

export default function FormTernak() {
  const pindah = useNavigate()
  const [params] = useSearchParams()
  const edit = params.get('mode') === 'edit'

  // Mode edit memakai data contoh supaya form terlihat terisi
  const [kode, setKode] = useState(edit ? 'SPI-001' : '')
  const [komoditas, setKomoditas] = useState('Sapi')
  const [ras, setRas] = useState(edit ? 'Bali' : '')
  const [jumlah, setJumlah] = useState(1)
  const [status, setStatus] = useState('Sehat')
  const [lahir, setLahir] = useState('')
  const [detail1, setDetail1] = useState(edit ? '320' : '')
  const [detail2, setDetail2] = useState('')

  const adalahUnggas = unggas.includes(komoditas)

  function ubahKomoditas(nilai) {
    setKomoditas(nilai)
    setDetail1('')
    setDetail2('')
  }

  function simpan(e) {
    e.preventDefault()
    pindah('/ternak')
  }

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        {/* Kembali dan penanda mode */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => pindah('/ternak')}
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors py-2 px-3 -ml-3 rounded-xl hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-md text-label-md">Kembali ke Daftar Ternak</span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            {edit ? 'Mode Edit Data' : 'Mode Tambah Data'}
          </span>
        </div>

        {/* Judul */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight">
              {edit ? 'Edit Ternak' : 'Tambah Ternak'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">
              {edit ? 'Ubah' : 'Baru'}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Isi data ternak dengan lengkap untuk pencatatan inventaris peternakan.
          </p>
        </div>

        {/* Kartu form */}
        <div className="w-full bg-surface-container-lowest rounded-3xl p-5 sm:p-8 shadow-sm">
          <form className="space-y-8" onSubmit={simpan}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kode */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="kode">
                  <span>Kode Ternak <span className="text-tertiary">*</span></span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Identifikasi unik</span>
                </label>
                <div className="relative flex items-center">
                  <Ikon nama="label" />
                  <input id="kode" type="text" placeholder="Contoh: SPI-001" value={kode} onChange={e => setKode(e.target.value)} className={kolom} />
                </div>
              </div>

              {/* Komoditas */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="komoditas">
                  Komoditas <span className="text-tertiary">*</span>
                </label>
                <div className="relative flex items-center">
                  <Ikon nama="pets" />
                  <select
                    id="komoditas"
                    value={komoditas}
                    onChange={e => ubahKomoditas(e.target.value)}
                    className={kolom + ' pr-10 appearance-none cursor-pointer'}
                  >
                    {daftarKomoditas.map(k => <option key={k.nama} value={k.nama}>{k.nama}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Ras */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="ras">Ras</label>
                <div className="relative flex items-center">
                  <Ikon nama="category" />
                  <input id="ras" type="text" placeholder="Contoh: Bali, Etawa, Landrace" value={ras} onChange={e => setRas(e.target.value)} className={kolom} />
                </div>
              </div>

              {/* Jumlah */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="jumlah">
                  <span>Jumlah <span className="text-tertiary">*</span></span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Ekor</span>
                </label>
                <div className="relative flex items-center">
                  <Ikon nama="numbers" />
                  <input id="jumlah" type="number" min="1" value={jumlah} onChange={e => setJumlah(e.target.value)} className={kolom} />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface">
                  Status <span className="text-tertiary">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {daftarStatus.map(s => {
                    const aktif = status === s.nama
                    return (
                      <button
                        key={s.nama}
                        type="button"
                        onClick={() => setStatus(s.nama)}
                        className={
                          'flex items-center justify-center gap-1.5 h-12 px-3 rounded-xl font-label-md text-label-md transition-all cursor-pointer ' +
                          (aktif
                            ? 'bg-primary-container text-on-primary-container shadow-sm'
                            : 'bg-surface hover:bg-surface-container text-on-surface-variant')
                        }
                      >
                        <span className={'material-symbols-outlined text-[18px] ' + (aktif ? '' : 'opacity-60')}>{s.ikon}</span>
                        <span>{s.nama}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tanggal lahir */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="lahir">Tanggal Lahir</label>
                <div className="relative flex items-center">
                  <Ikon nama="calendar_today" />
                  <input id="lahir" type="date" value={lahir} onChange={e => setLahir(e.target.value)} className={kolom + ' cursor-pointer'} />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-surface-container"></div>

            {/* Detail sesuai komoditas */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Detail {komoditas}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adalahUnggas ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface" htmlFor="kandang">No. Kandang</label>
                      <div className="relative flex items-center">
                        <Ikon nama="warehouse" />
                        <input id="kandang" type="text" placeholder="Contoh: KND-A02" value={detail1} onChange={e => setDetail1(e.target.value)} className={kolom} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface" htmlFor="telur">Produksi Telur per Hari</label>
                      <div className="relative flex items-center">
                        <Ikon nama="egg" />
                        <input id="telur" type="number" placeholder="Contoh: 120" value={detail2} onChange={e => setDetail2(e.target.value)} className={kolom + ' pr-16'} />
                        <span className="absolute right-4 font-body-sm text-body-sm text-on-surface-variant font-medium pointer-events-none">butir</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface" htmlFor="bobot">Bobot (kg)</label>
                      <div className="relative flex items-center">
                        <Ikon nama="scale" />
                        <input id="bobot" type="number" step="0.1" placeholder="Contoh: 350" value={detail1} onChange={e => setDetail1(e.target.value)} className={kolom + ' pr-12'} />
                        <span className="absolute right-4 font-body-sm text-body-sm text-on-surface-variant font-medium pointer-events-none">kg</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface" htmlFor="vaksin">Vaksin Terakhir</label>
                      <div className="relative flex items-center">
                        <Ikon nama="vaccines" />
                        <input id="vaksin" type="date" value={detail2} onChange={e => setDetail2(e.target.value)} className={kolom + ' cursor-pointer'} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-surface-container-low text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">info</span>
                <p className="font-body-sm text-body-sm leading-relaxed">
                  Untuk Ayam dan Bebek, kolom ini berubah menjadi No. Kandang dan Produksi Telur per Hari.
                </p>
              </div>
            </div>

            {/* Tombol */}
            <div className="pt-2 flex items-center justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => pindah('/ternak')}
                className="px-6 py-3 rounded-xl bg-surface hover:bg-surface-container text-on-surface-variant font-label-lg text-label-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-primary-container text-on-primary-container hover:brightness-105 active:scale-[0.99] font-label-lg text-label-lg transition-all shadow flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">check</span>
                <span>Simpan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}