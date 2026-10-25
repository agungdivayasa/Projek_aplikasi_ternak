import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function FormTernak() {
  const pindah = useNavigate()
  const [komoditas, setKomoditas] = useState('Sapi')

  return (
    <Layout>
      <h1>Tambah / Edit Ternak</h1>
      <p className="sub">Isi data ternak dengan lengkap</p>

      <div className="form-kartu">
        <div className="field"><label>Kode *</label><input placeholder="SPI-001" /></div>
        <div className="field">
          <label>Komoditas *</label>
          <select value={komoditas} onChange={e => setKomoditas(e.target.value)}>
            <option>Sapi</option><option>Kambing</option><option>Ayam</option>
          </select>
        </div>
        <div className="field"><label>Ras</label><input placeholder="Bali, Etawa, Broiler..." /></div>
        <div className="field"><label>Jumlah *</label><input type="number" placeholder="1" /></div>
        <div className="field">
          <label>Status *</label>
          <select><option>Sehat</option><option>Sakit</option><option>Terjual</option></select>
        </div>
        <div className="field"><label>Tanggal Lahir</label><input type="date" /></div>

        <h3>Detail {komoditas}</h3>
        {komoditas === 'Ayam' ? (
          <>
            <div className="field"><label>No. Kandang</label><input placeholder="K-02" /></div>
            <div className="field"><label>Produksi Telur per Hari</label><input type="number" placeholder="420" /></div>
          </>
        ) : (
          <>
            <div className="field"><label>Bobot (kg)</label><input type="number" placeholder="320" /></div>
            <div className="field"><label>Vaksin Terakhir</label><input type="date" /></div>
          </>
        )}

        <div className="form-tombol">
          <button className="btn btn-abu" onClick={() => pindah('/ternak')}>Batal</button>
          <button className="btn btn-hijau" onClick={() => pindah('/ternak')}>Simpan</button>
        </div>
      </div>
    </Layout>
  )
}