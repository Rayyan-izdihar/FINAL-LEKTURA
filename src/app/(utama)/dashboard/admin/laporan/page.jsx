'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowLeftRight, BookOpen, CalendarClock, Download, Wallet } from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { kelasInput, kelasPanel, kelasTombol } from '@/lib/gaya';


const BERKAS = [
    {
        href: '/api/admin/laporan/transaksi',
        ikon: ArrowLeftRight,
        judul: 'Transaksi peminjaman',
        teks: 'Setiap peminjaman lengkap dengan status, tanggal, perpanjangan, keterlambatan, dan denda.',
        bulat: 'bg-hijau-muda text-hijau',
    },
    {
        href: '/api/admin/laporan/denda',
        ikon: Wallet,
        judul: 'Rekap denda',
        teks: 'Denda yang sudah lunas, tertunggak, dan masih berjalan beserta nama peminjamnya.',
        bulat: 'bg-koral/10 text-koral-tua',
    },
];


const JENIS_DENDA = [
    { kunci: 'lunas', label: 'Lunas', teks: 'sudah dibayar', warna: 'bg-hijau' },
    { kunci: 'tertunggak', label: 'Tertunggak', teks: 'buku sudah kembali, belum dibayar', warna: 'bg-koral' },
    { kunci: 'berjalan', label: 'Berjalan', teks: 'buku belum dikembalikan', warna: 'bg-kuning' },
];


function namaBulan(teks) {
    const [tahun, bulan] = teks.split('-').map(Number);
    return new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
}


function DaftarBatang({ daftar, warna, urut = false }) {
    const maks = Math.max(...daftar.map((d) => d.jumlah), 0);

    if (daftar.length === 0 || maks === 0) {
        return <p className="mt-5 text-sm text-tinta-lembut">Belum ada data peminjaman.</p>;
    }

    return (
        <ul className="mt-5 space-y-4">
            {daftar.map((d, i) => (
                <li key={d.nama ?? d.judul}>
                    <div className="flex justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">
                            {urut && <span className="mr-2 text-abu">{i + 1}.</span>}
                            {d.nama ?? d.judul}
                        </span>
                        <span className="shrink-0 font-medium">{d.jumlah}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-tinta/10">
                        <div
                            className={`h-full rounded-full ${i === 0 && urut ? 'bg-koral' : warna}`}
                            style={{ width: `${(d.jumlah / maks) * 100}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}


// utama
export default function LaporanAdmin() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [galat, setGalat] = useState('');
    const [dari, setDari] = useState('');
    const [sampai, setSampai] = useState('');

    useEffect(() => {
        fetch('/api/admin/laporan')
            .then(async (res) => {
                if (res.status === 401 || res.status === 403) {
                    router.push('/login?dari=/dashboard/admin/laporan');
                    return;
                }
                if (!res.ok) throw new Error('gagal');
                setData(await res.json());
            })
            .catch(() => setGalat('Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.'));
    }, [router]);

    if (galat) {
        return (
            <p role="alert" className="py-10 text-koral-tua">
                {galat}
            </p>
        );
    }

    if (!data) {
        return (
            <div className="space-y-6 py-4 md:py-8" aria-busy="true">
                <div className="h-20 animate-pulse rounded-2xl bg-garis/60" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-24 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
                <div className="h-48 animate-pulse rounded-2xl bg-garis/60" />
                <div className="h-72 animate-pulse rounded-2xl bg-garis/60" />
            </div>
        );
    }

    const { ringkasan: r, bulanan, buku_populer: bukuPopuler, per_kategori: perKategori, denda } = data;

    const persenTerlambat = r.selesai > 0 ? Math.round((r.selesai_terlambat / r.selesai) * 100) : 0;
    const kartu = [
        { ikon: ArrowLeftRight, label: 'Total transaksi', nilai: r.total, bulat: 'bg-tinta/10 text-tinta' },
        { ikon: BookOpen, label: 'Peminjaman disetujui', nilai: r.disetujui, bulat: 'bg-hijau-muda text-hijau' },
        {
            ikon: CalendarClock,
            label: 'Pengembalian terlambat',
            nilai: `${persenTerlambat}%`,
            bulat: 'bg-kuning-muda text-kuning',
        },
        { ikon: Wallet, label: 'Denda terkumpul', nilai: formatRupiah(denda.lunas.nominal), bulat: 'bg-koral/10 text-koral-tua' },
    ];

    const maksBulan = Math.max(...bulanan.map((b) => b.jumlah), 0);
    const totalDenda = JENIS_DENDA.reduce((total, j) => total + denda[j.kunci].nominal, 0);

    // Rentang tanggal untuk unduhan. Kosong = seluruh data.
    const rentangTerbalik = dari && sampai && dari > sampai;
    const parameter = new URLSearchParams();
    if (dari) parameter.set('dari', dari);
    if (sampai) parameter.set('sampai', sampai);
    const sufiks = parameter.toString() ? `?${parameter.toString()}` : '';

    return (
        <div className="space-y-12 py-4 md:py-8">
            <div className="space-y-6">
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
                >
                    <ArrowLeft size={16} aria-hidden="true" /> Kembali ke dashboard
                </Link>

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-abu">Laporan</p>
                    <h1 className="mt-1 font-judul text-3xl md:text-4xl">Export dan analitik</h1>
                    <p className="mt-1 text-sm text-tinta-lembut">
                        Ringkasan aktivitas perpustakaan dan unduhan data untuk pelaporan operasional.
                    </p>
                </div>
            </div>

            <section aria-label="Ringkasan" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {kartu.map((k) => (
                    <div
                        key={k.label}
                        className="flex items-center gap-4 rounded-2xl border border-garis bg-kertas p-4 shadow-kartu"
                    >
                        <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${k.bulat}`}>
                            <k.ikon size={22} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-judul text-2xl leading-none sm:text-3xl">{k.nilai}</span>
                            <span className="mt-1.5 block text-sm text-tinta-lembut">{k.label}</span>
                        </span>
                    </div>
                ))}
            </section>

            <section aria-labelledby="judul-unduh">
                <h2 id="judul-unduh" className="font-judul text-2xl">
                    Unduh data
                </h2>
                <p className="mt-1 text-sm text-tinta-lembut">
                    Format Excel, bisa dibuka di Excel atau Google Sheets. Rentang tanggal memakai tanggal pengajuan.
                </p>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Dari tanggal</span>
                        <input
                            type="date"
                            value={dari}
                            max={sampai || undefined}
                            onChange={(e) => setDari(e.target.value)}
                            className={`${kelasInput} w-44`}
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Sampai tanggal</span>
                        <input
                            type="date"
                            value={sampai}
                            min={dari || undefined}
                            onChange={(e) => setSampai(e.target.value)}
                            className={`${kelasInput} w-44`}
                        />
                    </label>
                    {(dari || sampai) && (
                        <button
                            type="button"
                            onClick={() => {
                                setDari('');
                                setSampai('');
                            }}
                            className={kelasTombol.garis}
                        >
                            Semua tanggal
                        </button>
                    )}
                </div>

                <p className={`mt-2 text-xs ${rentangTerbalik ? 'text-koral-tua' : 'text-abu'}`}>
                    {rentangTerbalik
                        ? 'Tanggal awal tidak boleh setelah tanggal akhir.'
                        : dari || sampai
                          ? 'Hanya transaksi dengan tanggal pengajuan pada rentang ini yang diunduh.'
                          : 'Tanpa rentang tanggal, seluruh data diunduh.'}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {BERKAS.map((b) => (
                        <div key={b.href} className={`${kelasPanel} flex flex-col p-5`}>
                            <div className="flex items-start gap-4">
                                <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${b.bulat}`}>
                                    <b.ikon size={22} aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="font-judul text-xl">{b.judul}</h3>
                                    <p className="mt-1 text-sm text-tinta-lembut">{b.teks}</p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-garis pt-4">
                                <span className="text-xs text-abu">Excel, UTF-8</span>
                                {rentangTerbalik ? (
                                    <button type="button" disabled className={kelasTombol.gelap}>
                                        <Download size={16} aria-hidden="true" /> Unduh Excel
                                    </button>
                                ) : (
                                    <a href={`${b.href}${sufiks}`} download className={kelasTombol.gelap}>
                                        <Download size={16} aria-hidden="true" /> Unduh Excel
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section aria-labelledby="judul-analitik">
                <h2 id="judul-analitik" className="font-judul text-2xl">
                    Analitik
                </h2>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                    <section aria-labelledby="judul-bulanan" className={`${kelasPanel} p-5 md:p-6`}>
                        <h3 id="judul-bulanan" className="font-judul text-xl">
                            Pengajuan per bulan
                        </h3>
                        <p className="mt-1 text-sm text-tinta-lembut">Enam bulan terakhir, bulan ini berwarna merah</p>

                        <div className="mt-6 flex h-48 gap-2 sm:gap-4">
                            {bulanan.map((b, i) => {
                                const persen = maksBulan > 0 ? (b.jumlah / maksBulan) * 100 : 0;
                                const bulanIni = i === bulanan.length - 1;
                                return (
                                    <div key={b.bulan} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                                        <span className="text-xs font-medium">{b.jumlah}</span>
                                        <div className="flex w-full flex-1 items-end justify-center">
                                            <div
                                                className={`w-full max-w-12 rounded-t-xl ${
                                                    b.jumlah === 0 ? 'bg-tinta/10' : bulanIni ? 'bg-koral' : 'bg-tinta'
                                                }`}
                                                style={{ height: `${Math.max(persen, 3)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-abu">{namaBulan(b.bulan)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section aria-labelledby="judul-denda" className={`${kelasPanel} p-5 md:p-6`}>
                        <h3 id="judul-denda" className="font-judul text-xl">
                            Rekap denda
                        </h3>
                        <p className="mt-1 text-sm text-tinta-lembut">
                            Total <span className="font-medium text-tinta">{formatRupiah(totalDenda)}</span> dari semua jenis denda
                        </p>

                        <ul className="mt-5 space-y-4">
                            {JENIS_DENDA.map((j) => {
                                const { jumlah, nominal } = denda[j.kunci];
                                const persen = totalDenda > 0 ? (nominal / totalDenda) * 100 : 0;
                                return (
                                    <li key={j.kunci}>
                                        <div className="flex justify-between gap-3 text-sm">
                                            <span>{j.label}</span>
                                            <span className="font-medium">{formatRupiah(nominal)}</span>
                                        </div>
                                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-tinta/10">
                                            <div className={`h-full rounded-full ${j.warna}`} style={{ width: `${persen}%` }} />
                                        </div>
                                        <p className="mt-1 text-xs text-abu">
                                            {jumlah} transaksi, {j.teks}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section aria-labelledby="judul-populer" className={`${kelasPanel} p-5 md:p-6`}>
                        <h3 id="judul-populer" className="font-judul text-xl">
                            Buku paling sering dipinjam
                        </h3>
                        <p className="mt-1 text-sm text-tinta-lembut">Lima judul teratas, jumlah peminjaman</p>
                        <DaftarBatang daftar={bukuPopuler} warna="bg-tinta" urut />
                    </section>

                    <section aria-labelledby="judul-kategori" className={`${kelasPanel} p-5 md:p-6`}>
                        <h3 id="judul-kategori" className="font-judul text-xl">
                            Peminjaman per kategori
                        </h3>
                        <p className="mt-1 text-sm text-tinta-lembut">Kategori dengan peminjaman terbanyak</p>
                        <DaftarBatang daftar={perKategori} warna="bg-hijau" />
                    </section>
                </div>
            </section>
        </div>
    );
}