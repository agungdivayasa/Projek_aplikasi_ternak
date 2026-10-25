import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { ternak } from '../data/ternak'

export default function DaftarTernak() {
  const pindah = useNavigate()
  const [daftar, setDaftar] = useState(ternak)
  const [cari, setCari] = useState('')
  const [komoditas, setKomoditas] = useState('Semua')
  const [status, setStatus] = useState('Semua')
  const [hapus, setHapus] = useState(null) // menyimpan data yang mau dihapus

  const hasil = daftar.filter(t =>
    (t.kode + ' ' + t.ras).toLowerCase().includes(cari.toLowerCase()) &&
    (komoditas === 'Semua' || t.komoditas === komoditas) &&
    (status === 'Semua' || t.status === status)
  )

  function konfirmasiHapus() {
    setDaftar(daftar.filter(t => t.id !== hapus.id))
    setHapus(null)
  }

  return (
    <Layout>
      <div className="atas">
        <div>
          <h1>Daftar Ternak</h1>
          <p className="sub" style={{ margin: 0 }}>Kelola semua data ternak</p>
        </div>
        <button className="btn btn-hijau" onClick={() => pindah('/ternak/form')}>+ Tambah Ternak</button>
      </div>

      <div className="filter">
        <input placeholder="🔍 Cari kode atau ras..." value={cari} onChange={e => setCari(e.target.value)} />
        <select value={komoditas} onChange={e => setKomoditas(e.target.value)}>
          <option>Semua</option><option>Sapi</option><option>Kambing</option><option>Ayam</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option>Semua</option><option>Sehat</option><option>Sakit</option><option>Terjual</option>
        </select>
      </div>

      <div className="tabel-bungkus">
        <table>
          <thead>
            <tr><th>Kode</th><th>Komoditas</th><th>Ras</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {hasil.map(t => (
              <tr key={t.id}>
                <td>{t.kode}</td>
                <td>{t.komoditas}</td>
                <td>{t.ras}</td>
                <td>{t.jumlah}</td>
                <td><span className={'badge ' + t.status.toLowerCase()}>{t.status}</span></td>
                <td className="aksi">
                  <button onClick={() => pindah('/ternak/form')} title="Edit">✏️</button>
                  <button onClick={() => setHapus(t)} title="Hapus">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hasil.length === 0 && <div className="kosong">Data tidak ditemukan</div>}
      </div>

      {hapus && (
        <div className="latar" onClick={() => setHapus(null)}>
          <div className="popup" onClick={e => e.stopPropagation()}>
            <h2>Hapus data ternak?</h2>
            <p>{hapus.kode} akan dihapus permanen.</p>
            <div className="tombol">
              <button className="btn btn-abu" onClick={() => setHapus(null)}>Batal</button>
              <button className="btn btn-merah" onClick={konfirmasiHapus}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}