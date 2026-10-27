import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Layout from '../components/Layout'
import { bacaData, bulanSekarang, formatRupiah, kunciPakan, kunciTransaksi, pakanAwal, transaksiAwal } from '../data/operasional'
import { ternak } from '../data/ternak'

function Ikon({ nama, className = '' }) {
	return <span className={`material-symbols-outlined ${className}`}>{nama}</span>
}

export default function Laporan() {
	const [bulan, setBulan] = useState(bulanSekarang())
	const [pakan] = useState(() => bacaData(kunciPakan, pakanAwal))
	const [transaksi] = useState(() => bacaData(kunciTransaksi, transaksiAwal))
	const aktif = ternak.filter(item => item.status !== 'Terjual').reduce((total, item) => total + item.jumlah, 0)
	const transaksiBulan = useMemo(() => transaksi.filter(item => item.tanggal.slice(0, 7) === bulan), [transaksi, bulan])
	const pemasukan = transaksiBulan.filter(item => item.jenis === 'Pemasukan').reduce((total, item) => total + Number(item.jumlah || 0), 0)
	const pengeluaran = transaksiBulan.filter(item => item.jenis === 'Pengeluaran').reduce((total, item) => total + Number(item.jumlah || 0), 0)
	const pakanKritis = pakan.filter(item => Number(item.stok) <= Number(item.minimum))
	const kategori = useMemo(() => {
		const agregat = new Map()
		transaksiBulan.forEach(item => {
			const saatIni = agregat.get(item.kategori) || { kategori: item.kategori, pemasukan: 0, pengeluaran: 0 }
			saatIni[item.jenis === 'Pemasukan' ? 'pemasukan' : 'pengeluaran'] += Number(item.jumlah || 0)
			agregat.set(item.kategori, saatIni)
		})
		return [...agregat.values()]
	}, [transaksiBulan])

	function cetak() {
		window.print()
	}

	return (
		<Layout>
			<div className="space-y-6 sm:space-y-8 print:space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div><div className="mb-2 flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant"><Ikon nama="home" className="text-[17px]" /><span>Ternak Saya</span><Ikon nama="chevron_right" className="text-[16px]" /><span className="text-on-surface">Laporan</span></div><h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface sm:font-headline-lg sm:text-headline-lg">Laporan Peternakan</h1><p className="mt-1 font-body-md text-body-md text-on-surface-variant">Ringkasan kondisi ternak, persediaan pakan, dan arus keuangan.</p></div>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center print:hidden"><label className="flex h-12 items-center gap-2 rounded-xl bg-surface-container-low px-3"><Ikon nama="calendar_month" className="text-[20px] text-on-surface-variant" /><input aria-label="Pilih bulan laporan" type="month" value={bulan} onChange={event => setBulan(event.target.value)} className="min-w-0 bg-transparent font-body-sm text-body-sm text-on-surface outline-none" /></label><button type="button" onClick={cetak} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-label-md text-on-primary shadow-sm hover:bg-primary/90"><Ikon nama="print" className="text-[21px]" /> Cetak Laporan</button></div>
				</div>

				<section aria-label="Ringkasan laporan" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<Ringkasan ikon="pets" judul="Ternak Aktif" nilai={`${aktif.toLocaleString('id-ID')} ekor`} warna="text-on-surface" />
					<Ringkasan ikon="warehouse" judul="Persediaan Pakan" nilai={`${pakan.reduce((total, item) => total + Number(item.stok || 0), 0).toLocaleString('id-ID')} kg`} warna="text-primary" />
					<Ringkasan ikon="north_east" judul="Pemasukan Bulan Ini" nilai={formatRupiah(pemasukan)} warna="text-primary" />
					<Ringkasan ikon="south_east" judul="Pengeluaran Bulan Ini" nilai={formatRupiah(pengeluaran)} warna="text-tertiary" />
				</section>

				<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
					<section className="rounded-3xl bg-surface-container-lowest p-5 shadow-sm sm:p-6 xl:col-span-8">
						<div className="mb-4"><h2 className="font-headline-md text-headline-md text-on-surface">Arus Keuangan</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Perbandingan pemasukan dan pengeluaran berdasarkan kategori.</p></div>
						{kategori.length ? <div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={kategori} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7eeff" /><XAxis dataKey="kategori" tick={{ fill: '#3f493f', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={nilai => `${Math.round(nilai / 1000000)} jt`} tick={{ fill: '#3f493f', fontSize: 11 }} axisLine={false} tickLine={false} width={42} /><Tooltip formatter={nilai => formatRupiah(nilai)} contentStyle={{ borderRadius: 12, border: '1px solid #e7eeff', fontSize: 12 }} /><Bar dataKey="pemasukan" name="Pemasukan" fill="#15803d" radius={[5, 5, 0, 0]} /><Bar dataKey="pengeluaran" name="Pengeluaran" fill="#da1544" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <div className="flex h-[240px] flex-col items-center justify-center rounded-2xl bg-surface-container-low"><Ikon nama="bar_chart" className="text-[36px] text-on-surface-variant" /><p className="mt-2 font-label-md text-label-md text-on-surface">Belum ada transaksi bulan ini</p><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Transaksi akan dirangkum di sini.</p></div>}
					</section>

					<aside className="space-y-6 xl:col-span-4">
						<section className={`rounded-3xl p-5 sm:p-6 ${pengeluaran > pemasukan ? 'bg-tertiary-fixed/60' : 'bg-primary-fixed/50'}`}><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70"><Ikon nama="account_balance" className={pengeluaran > pemasukan ? 'text-tertiary' : 'text-primary'} /></div><h2 className="font-title-lg text-title-lg text-on-surface">Ringkasan Bersih</h2></div><p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">Pemasukan dikurangi pengeluaran</p><p className={`mt-1 break-words font-headline-md text-headline-md sm:font-headline-lg sm:text-headline-lg ${pengeluaran > pemasukan ? 'text-tertiary' : 'text-primary'}`}>{formatRupiah(pemasukan - pengeluaran)}</p><p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">{transaksiBulan.length} transaksi tercatat pada bulan yang dipilih.</p></section>
						<section className="rounded-3xl bg-surface-container-lowest p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-title-lg text-title-lg text-on-surface">Stok Perlu Perhatian</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Pakan di bawah batas minimum</p></div><Ikon nama="warning" className="text-[22px] text-tertiary" /></div><div className="mt-4 space-y-2">{pakanKritis.length ? pakanKritis.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-tertiary-fixed/40 p-3"><span className="min-w-0 truncate font-label-md text-label-md text-on-surface">{item.nama}</span><span className="shrink-0 font-label-sm text-label-sm text-tertiary">{item.stok} / {item.minimum} kg</span></div>) : <p className="rounded-xl bg-primary-fixed/40 p-3 font-body-sm text-body-sm text-primary">Semua stok pakan berada di atas batas minimum.</p>}</div></section>
					</aside>
				</div>

				<section className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm"><div className="p-5 sm:p-6"><h2 className="font-headline-md text-headline-md text-on-surface">Rincian Transaksi</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Total per kategori untuk bulan yang dipilih.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-left"><thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant"><tr><th className="px-5 py-3">Kategori</th><th className="px-4 py-3 text-right">Pemasukan</th><th className="px-5 py-3 text-right">Pengeluaran</th></tr></thead><tbody className="divide-y divide-surface-container">{kategori.map(item => <tr key={item.kategori} className="font-body-sm text-body-sm"><td className="px-5 py-4 font-label-md text-label-md text-on-surface">{item.kategori}</td><td className="px-4 py-4 text-right text-primary">{formatRupiah(item.pemasukan)}</td><td className="px-5 py-4 text-right text-tertiary">{formatRupiah(item.pengeluaran)}</td></tr>)}</tbody></table>{!kategori.length && <p className="p-8 text-center font-body-sm text-body-sm text-on-surface-variant">Tidak ada rincian transaksi untuk bulan ini.</p>}</div></section>
				<p className="font-body-sm text-body-sm text-on-surface-variant print:hidden">Jumlah ternak aktif diambil dari data Daftar Ternak. Data pakan dan transaksi tersimpan di browser ini.</p>
			</div>
		</Layout>
	)
}

function Ringkasan({ ikon, judul, nilai, warna }) {
	return <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-body-sm text-body-sm text-on-surface-variant">{judul}</p><p className={`mt-2 break-words font-title-lg text-title-lg sm:font-headline-md sm:text-headline-md ${warna}`}>{nilai}</p></div><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container ${warna}`}><Ikon nama={ikon} className="text-[23px]" /></div></div></div>
}
