'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, Search } from 'lucide-react';
import Avatar from '@/components/Avatar';
import KondisiKosong from '@/components/KondisiKosong';
import Paginasi from '@/components/Paginasi';
import StatusPil from '@/components/StatusPil';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { kelasInput, kelasPanel } from '@/lib/gaya';
import { DAFTAR_STATUS, NADA_STATUS } from '@/lib/statusTransaksi';

const KOLOM =
    'md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.8fr)]';

const kelasChip = 'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors';

const NADA_PERPANJANGAN = { Diajukan: 'kuning', Disetujui: 'hijau', Ditolak: 'koral' };
const NADA_DENDA = { Tertunggak: 'koral', Lunas: 'hijau' };

export default function MonitoringTransaksi() {
    const [transaksi, setTransaksi] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [jumlahPerStatus, setJumlahPerStatus] = useState({});
    const [galat, setGalat] = useState('');
    const [status, setStatus] = useState('');
    const [cari, setCari] = useState('');
    const [halaman, setHalaman] = useState(1);

    // Dashboard admin membuka halaman ini dengan ?status=... untuk menyaring langsung
    useEffect(() => {
        const dariAlamat = new URLSearchParams(window.location.search).get('status');
        if (dariAlamat && DAFTAR_STATUS.includes(dariAlamat)) setStatus(dariAlamat);
    }, []);

    useEffect(() => {
        let dibatalkan = false;
        const params = new URLSearchParams({ page: String(halaman), limit: '10' });
        if (status) params.set('status', status);
        if (cari.trim()) params.set('q', cari.trim());

        fetch(`/api/admin/transaksi?${params.toString()}`)
            .then(async (res) => {
                if (!res.ok) throw new Error('gagal');
                const data = await res.json();
                if (dibatalkan) return;
                setTransaksi(data.transaksi);
                setPagination(data.pagination);
                setJumlahPerStatus(data.jumlah_per_status);
                setGalat('');
                if (data.pagination.halaman !== halaman) setHalaman(data.pagination.halaman);
            })
            .catch(() => {
                if (!dibatalkan) setGalat('Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.');
            });
        return () => {
            dibatalkan = true;
        };
    }, [halaman, status, cari]);

    const ubahFilter = useCallback((nilai) => {
        setStatus(nilai);
        setHalaman(1);
    }, []);

    const totalSemua = Object.values(jumlahPerStatus).reduce((total, n) => total + n, 0);
    const daftarFilter = [
        { nilai: '', label: 'Semua', jumlah: totalSemua },
        ...DAFTAR_STATUS.map((s) => ({ nilai: s, label: s, jumlah: jumlahPerStatus[s] ?? 0 })),
    ];

    return (
        <div className="space-y-6 py-4 md:py-8">
            <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
            >
                <ArrowLeft size={16} aria-hidden="true" /> Kembali ke dashboard
            </Link>

            <div>
                <p className="text-xs font-medium uppercase tracking-widest text-abu">Monitoring</p>
                <h1 className="mt-1 font-judul text-3xl md:text-4xl">Log transaksi</h1>
                <p className="mt-1 text-sm text-tinta-lembut">
                    {pagination ? `${pagination.total} transaksi ditemukan` : 'Memuat transaksi...'}
                </p>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status transaksi">
                    {daftarFilter.map((f) => (
                        <button
                            key={f.label}
                            type="button"
                            aria-pressed={status === f.nilai}
                            onClick={() => ubahFilter(f.nilai)}
                            className={`${kelasChip} ${
                                status === f.nilai
                                    ? 'border-tinta bg-tinta text-krem'
                                    : 'border-garis bg-kertas hover:border-tinta/40'
                            }`}
                        >
                            {f.label}
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                    status === f.nilai ? 'bg-krem/20 text-krem' : 'bg-tinta/10 text-tinta'
                                }`}
                            >
                                {f.jumlah}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full xl:max-w-sm">
                    <Search
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-abu"
                    />
                    <input
                        type="search"
                        value={cari}
                        onChange={(e) => {
                            setCari(e.target.value);
                            setHalaman(1);
                        }}
                        aria-label="Cari nama, NIM, atau judul buku"
                        placeholder="Cari nama, NIM, atau judul buku..."
                        className={`${kelasInput} rounded-full pl-10`}
                    />
                </div>
            </div>

            {galat && (
                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {galat}
                </p>
            )}

            {transaksi === null && !galat && (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="h-20 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {transaksi?.length === 0 && (
                <KondisiKosong
                    ikon={ArrowLeftRight}
                    judul="Tidak ada transaksi yang cocok"
                    teks="Coba kata kunci atau filter status lain."
                />
            )}

            {transaksi?.length > 0 && (
                <div className={`${kelasPanel} overflow-hidden`}>
                    <div
                        className={`hidden gap-4 border-b border-garis bg-krem/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-abu md:grid ${KOLOM}`}
                    >
                        <span>Peminjam</span>
                        <span>Buku</span>
                        <span>Tanggal</span>
                        <span>Status</span>
                        <span className="text-right">Denda</span>
                    </div>

                    <ul className="divide-y divide-garis">
                        {transaksi.map((t) => (
                            <li key={t.id} className={`grid gap-3 px-4 py-4 md:items-start md:gap-4 md:px-5 ${KOLOM}`}>
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar nama={t.nama} ukuran={36} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{t.nama}</p>
                                        <p className="truncate text-xs text-abu">{t.nim}</p>
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <p className="line-clamp-2 text-sm font-medium leading-snug">{t.judul}</p>
                                    <p className="mt-0.5 text-xs text-abu">Transaksi #{t.id}</p>
                                </div>

                                <dl className="space-y-0.5 text-xs text-tinta-lembut">
                                    <div>
                                        <dt className="inline text-abu">Diajukan </dt>
                                        <dd className="inline">{formatTanggal(t.tanggal_pengajuan)}</dd>
                                    </div>
                                    {t.tanggal_jatuh_tempo && (
                                        <div>
                                            <dt className="inline text-abu">Jatuh tempo </dt>
                                            <dd className="inline">{formatTanggal(t.tanggal_jatuh_tempo)}</dd>
                                        </div>
                                    )}
                                    {t.tanggal_kembali && (
                                        <div>
                                            <dt className="inline text-abu">Kembali </dt>
                                            <dd className="inline">{formatTanggal(t.tanggal_kembali)}</dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="flex flex-col gap-1.5">
                                    <StatusPil nada={NADA_STATUS[t.status]}>{t.status}</StatusPil>
                                    {t.status_perpanjangan !== 'Tidak Ada' && (
                                        <StatusPil nada={NADA_PERPANJANGAN[t.status_perpanjangan]}>
                                            Perpanjangan {t.status_perpanjangan.toLowerCase()}
                                        </StatusPil>
                                    )}
                                    {t.status_denda !== 'Tidak Ada' && (
                                        <StatusPil nada={NADA_DENDA[t.status_denda]}>
                                            Denda {t.status_denda.toLowerCase()}
                                        </StatusPil>
                                    )}
                                </div>

                                <div className="text-sm md:text-right">
                                    {t.denda > 0 ? (
                                        <>
                                            <p className="font-medium">{formatRupiah(t.denda)}</p>
                                            {t.hari_terlambat > 0 && (
                                                <p className="text-xs text-koral-tua">
                                                    terlambat {t.hari_terlambat} hari
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-abu">-</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {pagination && (
                        <div className="px-5 pb-5">
                            <Paginasi
                                halaman={pagination.halaman}
                                totalHalaman={pagination.totalHalaman}
                                total={pagination.total}
                                limit={pagination.limit}
                                onUbah={setHalaman}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}