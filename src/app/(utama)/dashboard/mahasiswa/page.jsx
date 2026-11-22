'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import KartuPinjaman from '@/components/KartuPinjaman';
import LencanaStatus from '@/components/LencanaStatus';
import { kelasTombol } from '@/lib/gaya';
import { formatRupiah, formatTanggal } from '@/lib/format';

// Satu baris di bagian riwayat (transaksi yang sudah Selesai atau Ditolak)
function BarisRiwayat({ p }) {
    const selesai = p.status === 'Selesai';

    return (
        <li className="flex flex-wrap items-center justify-between gap-3 border-b border-garis py-4 last:border-b-0">
            <div className="min-w-0">
                <Link href={`/buku/${p.book_id}`} className="font-medium hover:underline">
                    {p.judul}
                </Link>

                <p className="mt-0.5 text-xs text-abu">
                    {selesai
                        ? `Dipinjam ${formatTanggal(p.tanggal_pinjam)}, dikembalikan ${formatTanggal(p.tanggal_kembali)}`
                        : `Diajukan ${formatTanggal(p.tanggal_pengajuan)}`}
                </p>

                {p.status === 'Ditolak' && p.alasan_penolakan && (
                    <p className="mt-0.5 text-xs text-koral-tua">Alasan: {p.alasan_penolakan}</p>
                )}
                {selesai && p.status_denda !== 'Tidak Ada' && (
                    <p className="mt-0.5 text-xs text-tinta-lembut">
                        Terlambat {p.hari_terlambat} hari, denda {formatRupiah(p.denda)}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <LencanaStatus status={p.status} />
                
                {p.status_denda !== 'Tidak Ada' && (
                    <LencanaStatus
                        status={p.status_denda}
                        label={`Denda ${p.status_denda.toLowerCase()}`}
                    />
                )}
                {selesai && !p.sudah_diulas && (
                    <Link
                        href={`/dashboard/mahasiswa/ulasan/${p.id}`}
                        className="text-sm font-medium underline underline-offset-4"
                    >
                        Tulis ulasan
                    </Link>
                )}
                {selesai && p.sudah_diulas && <span className="text-xs text-abu">Sudah diulas</span>}
            </div>
        </li>
    );
}


export default function DashboardMahasiswa() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [galat, setGalat] = useState('');

    // useCallback: fungsi ini juga dipanggil KartuPinjaman setelah perpanjangan diajukan.
    const muat = useCallback(async () => {
        try {
            const res = await fetch('/api/loans');
            if (res.status === 401 || res.status === 403) {
                router.push('/login?dari=/dashboard/mahasiswa');
                return;
            }

            if (!res.ok) throw new Error('gagal');
            setData(await res.json());
            setGalat('');
        } catch {
            setGalat('Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.');
        }
    }, [router]);

    useEffect(() => {
        muat();
    }, [muat]);

    if (galat) {
        return (
            <p role="alert" className="py-10 text-koral-tua">
                {galat}
            </p>
        );
    }
    if (!data) {
        return <p className="py-10 text-tinta-lembut">Memuat dashboard...</p>;
    }

    const { pinjaman, ringkasan } = data;
    const namaDepan = data.nama.split(' ')[0];

    // Pinjaman aktif: yang sedang dipinjam tampil lebih dulu (jatuh tempo terdekat di atas)
    const aktif = pinjaman
        .filter((p) => p.status === 'Sedang Dipinjam' || p.status === 'Menunggu Konfirmasi')
        .sort((a, b) => {
            if (a.status !== b.status) return a.status === 'Sedang Dipinjam' ? -1 : 1;
            return (a.tanggal_jatuh_tempo ?? '').localeCompare(b.tanggal_jatuh_tempo ?? '');
        });
    const riwayat = pinjaman.filter((p) => p.status === 'Selesai' || p.status === 'Ditolak');


    return (
        <div className="space-y-10 py-4 md:py-8">
            <div>
                <h1 className="font-judul text-3xl md:text-4xl">Halo, {namaDepan}</h1>
                <p className="mt-1 text-sm text-tinta-lembut">
                    Pantau pinjaman, jatuh tempo, dan denda kamu di sini.
                </p>
            </div>

            {ringkasan.terblokir && (
                <section
                    aria-labelledby="judul-denda"
                    className="rounded-2xl border border-koral/40 bg-koral/5 p-5"
                >
                    <div className="flex items-start gap-3">
                        <TriangleAlert
                            size={22}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-koral-tua"
                        />

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 id="judul-denda" className="font-judul text-xl">
                                    Denda tertunggak
                                </h2>
                                <LencanaStatus status="Tertunggak" label="Peminjaman diblokir" />
                            </div>

                            <p className="mt-1 text-2xl font-medium">
                                {formatRupiah(ringkasan.total_denda)}
                            </p>
                            <p className="mt-1 text-sm text-tinta-lembut">
                                Kamu tidak dapat mengajukan peminjaman baru sampai denda dilunasi.
                                Pembayaran dicatat pegawai di meja sirkulasi.
                            </p>

                            <ul className="mt-3 space-y-1 text-sm">
                                {ringkasan.rincian_denda.map((r) => (
                                    <li key={r.id} className="flex justify-between gap-4">
                                        <span>
                                            {r.judul}{' '}
                                            <span className="text-abu">
                                                (terlambat {r.hari_terlambat} hari)
                                            </span>
                                        </span>

                                        <span className="shrink-0 font-medium">
                                            {formatRupiah(r.denda)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            )}

            <section aria-labelledby="judul-aktif">
                <h2 id="judul-aktif" className="font-judul text-2xl">
                    Peminjaman aktif <span className="text-base text-abu">({aktif.length})</span>
                </h2>

                {aktif.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-garis py-12 text-center">
                        <p className="font-judul text-xl">Belum ada peminjaman aktif</p>
                        <p className="mt-1 text-sm text-tinta-lembut">
                            Temukan buku berikutnya di katalog.
                        </p>
                        <Link href="/katalog" className={`${kelasTombol.gelap} mt-4`}>
                            Jelajahi katalog
                        </Link>
                    </div>
                ) : (
                    <ul className="mt-4 grid gap-4 lg:grid-cols-2">
                        {aktif.map((p) => (
                            <KartuPinjaman key={p.id} pinjaman={p} onUbah={muat} />
                        ))}
                    </ul>
                )}
            </section>

            {/* Bagian notifikasi (id="notifikasi") ditambahkan di bagian 7 */}

            <section aria-labelledby="judul-riwayat">
                <h2 id="judul-riwayat" className="font-judul text-2xl">
                    Riwayat transaksi <span className="text-base text-abu">({riwayat.length})</span>
                </h2>

                {riwayat.length === 0 ? (
                    <p className="mt-4 text-sm text-tinta-lembut">Belum ada riwayat transaksi.</p>
                ) : (
                    <ul className="mt-2">
                        {riwayat.map((p) => (
                            <BarisRiwayat key={p.id} p={p} />
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}