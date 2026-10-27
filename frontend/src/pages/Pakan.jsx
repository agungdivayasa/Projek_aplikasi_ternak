import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { bacaData, bulanSekarang, formatRupiah, kunciPakan, kunciTransaksi, pakanAwal, simpanData, transaksiAwal } from '../data/operasional'

function Ikon({ nama, className = '' }) {
	return <span className={`material-symbols-outlined ${className}`}>{nama}</span>
}

export default function Pakan() {
	const [pakan, setPakan] = useState(() => bacaData(kunciPakan, pakanAwal))
	const [transaksi, setTransaksi] = useState(() => bacaData(kunciTransaksi, transaksiAwal))
	const [bulanAktif] = useState(bulanSekarang)
	const [modal, setModal] = useState(null)
	const [pesanError, setPesanError] = useState('')

	const totalStok = pakan.reduce((total, item) => total + Number(item.stok || 0), 0)
	const stokMenipis = pakan.filter(item => Number(item.stok) <= Number(item.minimum)).length
	const pengeluaranBulanIni = useMemo(() => transaksi
		.filter(item => item.jenis === 'Pengeluaran' && item.kategori === 'Pakan' && item.tanggal.slice(0, 7) === bulanAktif)
		.reduce((total, item) => total + Number(item.jumlah || 0), 0), [transaksi, bulanAktif])

	function simpan(event) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const nama = String(form.get('nama') || '').trim()
		const jumlah = Number(form.get('jumlah'))
		const hargaPerKg = Number(form.get('hargaPerKg') || 0)

		if (!nama || jumlah <= 0) {
			setPesanError('Isi nama pakan dan jumlah yang valid.')
			return
		}

		let stokBaru = pakan
		let transaksiBaru = transaksi
		if (modal.mode === 'pemakaian') {
			const item = pakan.find(p => p.id === modal.id)
			if (!item || jumlah > item.stok) {
				setPesanError('Jumlah pemakaian melebihi stok yang tersedia.')
				return
			}
			stokBaru = pakan.map(p => p.id === item.id ? { ...p, stok: Number(p.stok) - jumlah } : p)
		} else {
			const ada = pakan.find(p => p.nama.toLocaleLowerCase('id-ID') === nama.toLocaleLowerCase('id-ID'))
			stokBaru = ada
				? pakan.map(p => p.id === ada.id ? { ...p, stok: Number(p.stok) + jumlah, hargaPerKg: hargaPerKg || p.hargaPerKg } : p)
				: [...pakan, { id: `pakan-${Date.now()}`, nama, jenis: String(form.get('jenis') || 'Lainnya'), stok: jumlah, minimum: Number(form.get('minimum') || 10), hargaPerKg }]

			if (hargaPerKg > 0) {
				const transaksiBaruItem = {
					id: `transaksi-${Date.now()}`,
					jenis: 'Pengeluaran',
					kategori: 'Pakan',
					keterangan: `Pembelian ${nama}`,
					jumlah: jumlah * hargaPerKg,
					tanggal: new Date().toISOString().slice(0, 10),
				}
				transaksiBaru = [transaksiBaruItem, ...transaksi]
			}
		}

		try {
			simpanData(kunciPakan, stokBaru)
			if (transaksiBaru !== transaksi) simpanData(kunciTransaksi, transaksiBaru)
			setPakan(stokBaru)
			setTransaksi(transaksiBaru)
			setPesanError('')
			setModal(null)
		} catch (error) {
			console.error('Gagal menyimpan data pakan:', error)
			setPesanError('Data tidak dapat disimpan. Periksa ruang penyimpanan browser.')
		}
	}

	return (
		<Layout>
			<div className="space-y-6 sm:space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="mb-2 flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
							<Ikon nama="home" className="text-[17px]" /><span>Ternak Saya</span><Ikon nama="chevron_right" className="text-[16px]" /><span className="text-on-surface">Pakan</span>
						</div>
						<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface sm:font-headline-lg sm:text-headline-lg">Manajemen Pakan</h1>
						<p className="mt-1 font-body-md text-body-md text-on-surface-variant">Pantau persediaan dan catat pemakaian pakan ternak.</p>
					</div>
					<button type="button" onClick={() => { setPesanError(''); setModal({ mode: 'tambah' }) }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-label-md text-on-primary shadow-sm hover:bg-primary/90">
						<Ikon nama="add" className="text-[21px]" /> Tambah Stok
					</button>
				</div>

				{pesanError && <p role="alert" className="rounded-xl bg-tertiary-fixed/60 p-3 font-body-sm text-body-sm text-tertiary">{pesanError}</p>}

				<section aria-label="Ringkasan stok pakan" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Ringkasan ikon="inventory_2" judul="Jenis Pakan" nilai={pakan.length} keterangan="Jenis tercatat" warna="text-on-surface" />
					<Ringkasan ikon="scale" judul="Total Persediaan" nilai={`${totalStok.toLocaleString('id-ID')} kg`} keterangan="Stok semua jenis pakan" warna="text-primary" />
					<Ringkasan ikon="warning" judul="Stok Menipis" nilai={stokMenipis} keterangan="Perlu segera diperiksa" warna={stokMenipis ? 'text-tertiary' : 'text-primary'} />
				</section>

				<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
					<section className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm xl:col-span-8">
						<div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
							<div><h2 className="font-headline-md text-headline-md text-on-surface">Persediaan Pakan</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Stok diperbarui setiap kali ada pemakaian atau pembelian.</p></div>
							<span className="rounded-full bg-primary-fixed/50 px-3 py-1 font-label-sm text-label-sm text-primary">{pakan.length} jenis</span>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full min-w-[650px] border-collapse text-left">
								<thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant"><tr><th className="px-5 py-3">Nama pakan</th><th className="px-4 py-3">Stok</th><th className="px-4 py-3">Batas minimum</th><th className="px-4 py-3">Harga / kg</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead>
								<tbody className="divide-y divide-surface-container">
									{pakan.map(item => {
										const menipis = Number(item.stok) <= Number(item.minimum)
										return <tr key={item.id} className="font-body-sm text-body-sm text-on-surface">
											<td className="px-5 py-4"><p className="font-label-md text-label-md">{item.nama}</p><p className="mt-1 text-on-surface-variant">{item.jenis}</p></td>
											<td className="px-4 py-4"><span className={`font-label-md text-label-md ${menipis ? 'text-tertiary' : 'text-on-surface'}`}>{Number(item.stok).toLocaleString('id-ID')} kg</span><span className={`ml-2 rounded-full px-2 py-1 font-label-sm text-label-sm ${menipis ? 'bg-tertiary-fixed/60 text-tertiary' : 'bg-primary-fixed/50 text-primary'}`}>{menipis ? 'Menipis' : 'Aman'}</span></td>
											<td className="px-4 py-4 text-on-surface-variant">{item.minimum} kg</td><td className="px-4 py-4 text-on-surface-variant">{formatRupiah(item.hargaPerKg)}</td>
											<td className="px-5 py-4 text-right"><button type="button" onClick={() => { setPesanError(''); setModal({ mode: 'pemakaian', id: item.id }) }} className="rounded-lg px-3 py-2 font-label-sm text-label-sm text-primary hover:bg-primary-fixed/50">Catat pemakaian</button></td>
										</tr>
									})}
								</tbody>
							</table>
							{!pakan.length && <p className="p-8 text-center font-body-sm text-body-sm text-on-surface-variant">Belum ada data pakan. Tambahkan stok untuk memulai.</p>}
						</div>
					</section>

					<aside className="space-y-4 xl:col-span-4">
						<section className="rounded-3xl bg-primary-container p-5 text-on-primary sm:p-6">
							<div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-on-primary/15"><Ikon nama="payments" className="text-[22px]" /></div><h2 className="font-title-lg text-title-lg">Biaya Pakan</h2></div>
							<p className="mt-4 font-body-sm text-body-sm text-on-primary/80">Pengeluaran pakan bulan ini</p><p className="mt-1 font-headline-lg text-headline-lg">{formatRupiah(pengeluaranBulanIni)}</p>
							<p className="mt-3 font-body-sm text-body-sm text-on-primary/80">Pembelian baru otomatis masuk ke halaman Keuangan dan Laporan.</p>
						</section>
						<section className="rounded-3xl bg-surface-container-low p-5 sm:p-6">
							<div className="flex items-start gap-3"><Ikon nama="info" className="mt-0.5 text-[21px] text-primary" /><div><h2 className="font-label-md text-label-md text-on-surface">Pencatatan stok</h2><p className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">Masukkan harga per kilogram saat menambah stok agar nilai pembelian tercatat sebagai pengeluaran pakan.</p></div></div>
						</section>
					</aside>
				</div>
			</div>

			{modal && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null) }}>
				<section role="dialog" aria-modal="true" aria-labelledby="judul-modal-pakan" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface-container-lowest p-5 shadow-xl sm:p-7">
					<div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="judul-modal-pakan" className="font-headline-md text-headline-md text-on-surface">{modal.mode === 'pemakaian' ? 'Catat Pemakaian' : 'Tambah Stok Pakan'}</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{modal.mode === 'pemakaian' ? `Stok ${pakan.find(item => item.id === modal.id)?.nama} akan dikurangi.` : 'Isi jumlah pembelian untuk memperbarui persediaan.'}</p></div><button type="button" aria-label="Tutup" onClick={() => setModal(null)} className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container"><Ikon nama="close" /></button></div>
					<form onSubmit={simpan} className="space-y-4">
						{modal.mode === 'tambah' ? <>
							<label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Nama pakan</span><input name="nama" required maxLength={70} placeholder="Contoh: Konsentrat Sapi" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label>
							<label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Jenis pakan</span><input name="jenis" maxLength={40} placeholder="Konsentrat, hijauan, bahan baku..." className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Jumlah (kg)</span><input name="jumlah" type="number" min="0.1" step="0.1" required className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label><label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Batas minimum (kg)</span><input name="minimum" type="number" min="0" step="0.1" defaultValue="10" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label></div>
							<label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Harga per kg (Rp)</span><input name="hargaPerKg" type="number" min="0" step="100" placeholder="0 jika tidak ingin mencatat biaya" className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label>
						</> : <label className="block space-y-1.5"><span className="font-label-sm text-label-sm text-on-surface">Jumlah pemakaian (kg)</span><input name="nama" type="hidden" value={pakan.find(item => item.id === modal.id)?.nama || ''} readOnly /><input name="jumlah" type="number" min="0.1" max={pakan.find(item => item.id === modal.id)?.stok} step="0.1" required className="h-12 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20" /></label>}
						{pesanError && <p role="alert" className="font-body-sm text-body-sm text-tertiary">{pesanError}</p>}
						<div className="flex justify-end gap-2 border-t border-surface-container pt-4"><button type="button" onClick={() => setModal(null)} className="rounded-xl px-4 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">Batal</button><button type="submit" className="rounded-xl bg-primary px-4 py-2.5 font-label-md text-label-md text-on-primary">{modal.mode === 'pemakaian' ? 'Simpan Pemakaian' : 'Simpan Stok'}</button></div>
					</form>
				</section>
			</div>}
		</Layout>
	)
}

function Ringkasan({ ikon, judul, nilai, keterangan, warna }) {
	return <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-body-sm text-body-sm text-on-surface-variant">{judul}</p><p className={`mt-2 font-metric-val text-metric-val ${warna}`}>{nilai}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container ${warna}`}><Ikon nama={ikon} className="text-[23px]" /></div></div><p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{keterangan}</p></div>
}
