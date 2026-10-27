import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { bacaData, bulanSekarang, formatRupiah, formatTanggal, kunciTransaksi, simpanData, transaksiAwal } from '../data/operasional'

function Ikon({ nama, className = '' }) {
	return <span className={`material-symbols-outlined ${className}`}>{nama}</span>
}

export default function Keuangan() {
	const [transaksi, setTransaksi] = useState(() => bacaData(kunciTransaksi, transaksiAwal))
	const [jenisFilter, setJenisFilter] = useState('Semua')
	const [bulan, setBulan] = useState(bulanSekarang())
	const [tanggalHariIni] = useState(() => new Date().toISOString().slice(0, 10))
	const [modal, setModal] = useState(false)
	const [pesanError, setPesanError] = useState('')

	const transaksiBulan = useMemo(() => transaksi.filter(item => item.tanggal.slice(0, 7) === bulan), [transaksi, bulan])
	const pemasukan = transaksiBulan.filter(item => item.jenis === 'Pemasukan').reduce((total, item) => total + Number(item.jumlah || 0), 0)
	const pengeluaran = transaksiBulan.filter(item => item.jenis === 'Pengeluaran').reduce((total, item) => total + Number(item.jumlah || 0), 0)
	const saldo = pemasukan - pengeluaran
	const tampil = transaksiBulan.filter(item => jenisFilter === 'Semua' || item.jenis === jenisFilter).sort((a, b) => b.tanggal.localeCompare(a.tanggal))

	function simpan(event) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const jumlah = Number(form.get('jumlah'))
		if (jumlah <= 0) {
			setPesanError('Jumlah transaksi harus lebih dari nol.')
			return
		}
		const baru = {
			id: `transaksi-${Date.now()}`,
			jenis: String(form.get('jenis')),
			kategori: String(form.get('kategori')),
			keterangan: String(form.get('keterangan')).trim(),
			jumlah,
			tanggal: String(form.get('tanggal')),
		}
		const terbaru = [baru, ...transaksi]
		try {
			simpanData(kunciTransaksi, terbaru)
			setTransaksi(terbaru)
			setBulan(baru.tanggal.slice(0, 7))
			setPesanError('')
			setModal(false)
		} catch (error) {
			console.error('Gagal menyimpan transaksi:', error)
			setPesanError('Transaksi tidak dapat disimpan. Periksa penyimpanan browser.')
		}
	}

	return (
		<Layout>
			<div className="space-y-6 sm:space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div><div className="mb-2 flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant"><Ikon nama="home" className="text-[17px]" /><span>Ternak Saya</span><Ikon nama="chevron_right" className="text-[16px]" /><span className="text-on-surface">Keuangan</span></div><h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface sm:font-headline-lg sm:text-headline-lg">Keuangan</h1><p className="mt-1 font-body-md text-body-md text-on-surface-variant">Catat pemasukan dan pengeluaran peternakan.</p></div>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center"><label className="flex h-12 items-center gap-2 rounded-xl bg-surface-container-low px-3"><Ikon nama="calendar_month" className="text-[20px] text-on-surface-variant" /><input aria-label="Pilih bulan laporan keuangan" type="month" value={bulan} onChange={event => setBulan(event.target.value)} className="min-w-0 bg-transparent font-body-sm text-body-sm text-on-surface outline-none" /></label><button type="button" onClick={() => { setPesanError(''); setModal(true) }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-label-md text-on-primary shadow-sm hover:bg-primary/90"><Ikon nama="add" className="text-[21px]" /> Catat Transaksi</button></div>
				</div>

				{pesanError && !modal && <p role="alert" className="rounded-xl bg-tertiary-fixed/60 p-3 font-body-sm text-body-sm text-tertiary">{pesanError}</p>}

				<section aria-label="Ringkasan keuangan" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Ringkasan ikon="north_east" judul="Pemasukan" nilai={formatRupiah(pemasukan)} keterangan="Bulan yang dipilih" warna="text-primary" />
					<Ringkasan ikon="south_east" judul="Pengeluaran" nilai={formatRupiah(pengeluaran)} keterangan="Bulan yang dipilih" warna="text-tertiary" />
					<Ringkasan ikon="account_balance_wallet" judul="Selisih" nilai={formatRupiah(saldo)} keterangan={saldo >= 0 ? 'Pemasukan lebih besar dari pengeluaran' : 'Pengeluaran lebih besar dari pemasukan'} warna={saldo >= 0 ? 'text-on-surface' : 'text-tertiary'} />
				</section>

				<section className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
					<div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="font-headline-md text-headline-md text-on-surface">Riwayat Transaksi</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{transaksiBulan.length} transaksi pada bulan ini</p></div><div className="flex flex-wrap gap-1 rounded-xl bg-surface-container-low p-1" role="tablist" aria-label="Filter transaksi">{['Semua', 'Pemasukan', 'Pengeluaran'].map(jenis => <button key={jenis} type="button" role="tab" aria-selected={jenisFilter === jenis} onClick={() => setJenisFilter(jenis)} className={`rounded-lg px-3 py-2 font-label-sm text-label-sm transition-colors ${jenisFilter === jenis ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>{jenis}</button>)}</div></div>
					<div className="overflow-x-auto"><table className="w-full min-w-[650px] border-collapse text-left"><thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant"><tr><th className="px-5 py-3">Tanggal</th><th className="px-4 py-3">Keterangan</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Jenis</th><th className="px-5 py-3 text-right">Jumlah</th></tr></thead><tbody className="divide-y divide-surface-container">{tampil.map(item => <tr key={item.id} className="font-body-sm text-body-sm text-on-surface"><td className="whitespace-nowrap px-5 py-4 text-on-surface-variant">{formatTanggal(item.tanggal)}</td><td className="px-4 py-4 font-label-md text-label-md">{item.keterangan}</td><td className="px-4 py-4 text-on-surface-variant">{item.kategori}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 font-label-sm text-label-sm ${item.jenis === 'Pemasukan' ? 'bg-primary-fixed/50 text-primary' : 'bg-tertiary-fixed/60 text-tertiary'}`}>{item.jenis}</span></td><td className={`whitespace-nowrap px-5 py-4 text-right font-label-md text-label-md ${item.jenis === 'Pemasukan' ? 'text-primary' : 'text-tertiary'}`}>{item.jenis === 'Pemasukan' ? '+' : '−'} {formatRupiah(item.jumlah)}</td></tr>)}</tbody></table>
						{!tampil.length && <div className="p-10 text-center"><Ikon nama="receipt_long" className="text-[34px] text-on-surface-variant" /><p className="mt-2 font-label-md text-label-md text-on-surface">Belum ada transaksi</p><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Pilih bulan lain atau catat transaksi baru.</p></div>}
					</div>
				</section>
				<p className="font-body-sm text-body-sm text-on-surface-variant">Data transaksi tersimpan di browser ini. Pembelian pakan juga muncul otomatis sebagai pengeluaran.</p>
			</div>

			{modal && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setModal(false) }}><section role="dialog" aria-modal="true" aria-labelledby="judul-modal-transaksi" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface-container-lowest p-5 shadow-xl sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="judul-modal-transaksi" className="font-headline-md text-headline-md text-on-surface">Catat Transaksi</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Masukkan pemasukan atau pengeluaran baru.</p></div><button type="button" aria-label="Tutup" onClick={() => setModal(false)} className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container"><Ikon nama="close" /></button></div>
				<form onSubmit={simpan} className="space-y-4"><label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Jenis transaksi</span><select name="jenis" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"><option>Pemasukan</option><option>Pengeluaran</option></select></label><label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Keterangan</span><input name="keterangan" required maxLength={100} placeholder="Contoh: Penjualan hasil ternak" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Kategori</span><select name="kategori" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20"><option>Operasional</option><option>Pakan</option><option>Kesehatan</option><option>Penjualan ternak</option><option>Penjualan hasil ternak</option><option>Lainnya</option></select></label><label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Jumlah (Rp)</span><input name="jumlah" type="number" min="1" step="1000" required className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label></div><label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Tanggal</span><input name="tanggal" type="date" required defaultValue={tanggalHariIni} className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label>{pesanError && <p role="alert" className="font-body-sm text-body-sm text-tertiary">{pesanError}</p>}<div className="flex justify-end gap-2 border-t border-surface-container pt-4"><button type="button" onClick={() => setModal(false)} className="rounded-xl px-4 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">Batal</button><button type="submit" className="rounded-xl bg-primary px-4 py-2.5 font-label-md text-label-md text-on-primary">Simpan Transaksi</button></div></form>
			</section></div>}
		</Layout>
	)
}

function Ringkasan({ ikon, judul, nilai, keterangan, warna }) {
	return <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-body-sm text-body-sm text-on-surface-variant">{judul}</p><p className={`mt-2 break-words font-title-lg text-title-lg sm:font-headline-md sm:text-headline-md ${warna}`}>{nilai}</p></div><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container ${warna}`}><Ikon nama={ikon} className="text-[23px]" /></div></div><p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{keterangan}</p></div>
}
