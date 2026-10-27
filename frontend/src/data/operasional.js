export const kunciPakan = 'ternakku.stok-pakan'
export const kunciTransaksi = 'ternakku.transaksi-keuangan'

const hariIni = () => new Date().toISOString().slice(0, 10)

export const pakanAwal = [
  { id: 'pakan-1', nama: 'Konsentrat Sapi', jenis: 'Konsentrat', stok: 180, minimum: 50, hargaPerKg: 5200 },
  { id: 'pakan-2', nama: 'Dedak Padi', jenis: 'Bahan baku', stok: 95, minimum: 40, hargaPerKg: 3200 },
  { id: 'pakan-3', nama: 'Pelet Ikan', jenis: 'Pelet', stok: 24, minimum: 30, hargaPerKg: 11500 },
  { id: 'pakan-4', nama: 'Jagung Giling', jenis: 'Bahan baku', stok: 125, minimum: 35, hargaPerKg: 4800 },
]

export const transaksiAwal = [
  { id: 'transaksi-1', jenis: 'Pengeluaran', kategori: 'Pakan', keterangan: 'Pembelian konsentrat sapi', jumlah: 1040000, tanggal: hariIni() },
  { id: 'transaksi-2', jenis: 'Pemasukan', kategori: 'Penjualan ternak', keterangan: 'Penjualan telur dan hasil ternak', jumlah: 3250000, tanggal: hariIni() },
  { id: 'transaksi-3', jenis: 'Pengeluaran', kategori: 'Kesehatan', keterangan: 'Vitamin dan obat ternak', jumlah: 475000, tanggal: hariIni() },
  { id: 'transaksi-4', jenis: 'Pengeluaran', kategori: 'Operasional', keterangan: 'Biaya operasional kandang', jumlah: 600000, tanggal: hariIni() },
]

export function bacaData(kunci, dataAwal) {
  try {
    const tersimpan = window.localStorage.getItem(kunci)
    if (!tersimpan) return dataAwal
    const hasil = JSON.parse(tersimpan)
    return Array.isArray(hasil) ? hasil : dataAwal
  } catch (error) {
    console.error(`Gagal membaca ${kunci}:`, error)
    return dataAwal
  }
}

export function simpanData(kunci, data) {
  window.localStorage.setItem(kunci, JSON.stringify(data))
}

export const formatRupiah = nilai => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(nilai || 0)

export const formatTanggal = tanggal => new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(`${tanggal}T00:00:00`))

export const bulanSekarang = () => new Date().toISOString().slice(0, 7)