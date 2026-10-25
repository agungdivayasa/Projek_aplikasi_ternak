import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import { ternak } from '../data/ternak'

const warna = ['#2e7d32', '#f59e0b', '#0288d1']

export default function Dashboard() {
  const total = ternak.reduce((a, t) => a + t.jumlah, 0)
  const sehat = ternak.filter(t => t.status === 'Sehat').reduce((a, t) => a + t.jumlah, 0)
  const sakit = ternak.filter(t => t.status === 'Sakit').reduce((a, t) => a + t.jumlah, 0)
  const daftarKomoditas = [...new Set(ternak.map(t => t.komoditas))]

  const dataGrafik = daftarKomoditas.map(k => ({
    nama: k,
    jumlah: ternak.filter(t => t.komoditas === k).reduce((a, t) => a + t.jumlah, 0),
  }))

  return (
    <Layout>
      <h1>Dashboard</h1>
      <p className="sub">Ringkasan data peternakan kamu</p>

      <div className="kartu-grid">
        <div className="kartu"><div>Total Ternak</div><div className="angka">{total}</div></div>
        <div className="kartu sehat"><div>Sehat</div><div className="angka">{sehat}</div></div>
        <div className="kartu sakit"><div>Sakit</div><div className="angka">{sakit}</div></div>
        <div className="kartu"><div>Jenis Komoditas</div><div className="angka">{daftarKomoditas.length}</div></div>
      </div>

      <div className="grafik">
        <h3>Komposisi Populasi per Komoditas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={dataGrafik} dataKey="jumlah" nameKey="nama" outerRadius={100} label>
              {dataGrafik.map((d, i) => <Cell key={d.nama} fill={warna[i % warna.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  )
}