'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import KartuPinjaman from '@/components/KartuPinjaman';
import Sampul from '@/components/Sampul';
import StatusPil from '@/components/StatusPil';
import { kelasPanel, kelasTombol, kelasTombolKecil } from '@/lib/gaya';
import { formatRupiah, formatTanggal } from '@/lib/format';

const NADA_STATUS = { Selesai: 'hijau', Ditolak: 'koral' };
const NADA_DENDA = { Tertunggak: 'koral', Lunas: 'hijau' };

// Satu baris di bagian riwayat (transaksi yang sudah Selesai atau Ditolak)
function BarisRiwayat({ p }) {
    const selesai = p.status === 'Selesai';

    return (
        <li className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5">
            <Sampul src={p.sampul} judul={p.judul} className="w-11 shrink-0" />

            <div className="min-w-0 flex-1 basis-48">
                <Link href={`/buku/${p.book_id}`} className="font-judul text-lg leading-snug hover:underline">
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
                <StatusPil nada={NADA_STATUS[p.status] ?? 'netral'}>{p.status}</StatusPil>

                {p.status_denda !== 'Tidak Ada' && (
                    <StatusPil nada={NADA_DENDA[p.status_denda]}>Denda {p.status_denda.toLowerCase()}</StatusPil>
                )}
                {selesai && !p.sudah_diulas && (
                    <Link href={`/dashboard/mahasiswa/ulasan/${p.id}`} className={kelasTombolKecil.garis}>
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
        return (
            <div className="space-y-6 py-4 md:py-8" aria-busy="true">
                <div className="h-40 animate-pulse rounded-3xl bg-garis/60" />
                <div className="h-56 animate-pulse rounded-2xl bg-garis/60" />
            </div>
        );
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

    const dipinjam = aktif.filter((p) => p.status === 'Sedang Dipinjam');
    let kalimatRingkas = 'Pantau pinjaman, jatuh tempo, dan denda kamu di sini.';
    if (ringkasan.terblokir) {
        kalimatRingkas = 'Peminjaman baru diblokir sampai denda kamu dilunasi.';
    } else if (dipinjam.length > 0) {
        kalimatRingkas = `Kamu sedang meminjam ${dipinjam.length} buku. Jatuh tempo terdekat ${formatTanggal(dipinjam[0].tanggal_jatuh_tempo)}.`;
    }


    return (
        <div className="space-y-10 py-4 md:py-8">
            <section className="relative overflow-hidden rounded-3xl bg-tinta p-6 text-krem md:p-8">
                <div aria-hidden="true" className="absolute -right-10 -top-16 size-48 rounded-full bg-koral" />
                <div aria-hidden="true" className="absolute -bottom-20 right-28 size-40 rounded-full bg-krem/10" />

                <div className="relative max-w-xl">
                    <p className="text-xs font-medium uppercase tracking-widest text-krem/70">Rak saya</p>
                    <h1 className="mt-2 font-judul text-3xl leading-tight md:text-4xl">Halo, {namaDepan}</h1>
                    <p className="mt-3 text-sm text-krem/85 md:text-base">{kalimatRingkas}</p>
                </div>
            </section>

            {ringkasan.terblokir && (
                <section
                    aria-labelledby="judul-denda"
                    className="flex flex-col gap-5 rounded-2xl border border-koral/40 bg-koral/5 p-5 sm:flex-row sm:gap-6 sm:p-6"
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <TriangleAlert size={22} aria-hidden="true" className="shrink-0 text-koral-tua" />
                            <h2 id="judul-denda" className="font-judul text-xl">
                                Denda tertunggak
                            </h2>
                            <StatusPil nada="koral">Peminjaman diblokir</StatusPil>
                        </div>

                        <p className="mt-2 text-sm text-tinta-lembut">
                            Kamu tidak dapat mengajukan peminjaman baru sampai denda dilunasi.
                            Pembayaran dicatat pegawai di meja sirkulasi.
                        </p>

                        <ul className="mt-4 divide-y divide-koral/15 rounded-xl border border-koral/20 bg-kertas text-sm">
                            {ringkasan.rincian_denda.map((r) => (
                                <li key={r.id} className="flex justify-between gap-4 px-4 py-2.5">
                                    <span>
                                        {r.judul}{' '}
                                        <span className="text-abu">(terlambat {r.hari_terlambat} hari)</span>
                                    </span>

                                    <span className="shrink-0 font-medium text-koral-tua">{formatRupiah(r.denda)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-dashed border-koral/30 pt-4 sm:flex sm:w-48 sm:shrink-0 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                        <p className="text-xs text-abu">Total denda</p>
                        <p className="font-judul text-4xl leading-tight text-koral-tua">
                            {formatRupiah(ringkasan.total_denda)}
                        </p>
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
                    <ul className={`${kelasPanel} mt-4 divide-y divide-garis`}>
                        {riwayat.map((p) => (
                            <BarisRiwayat key={p.id} p={p} />
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}