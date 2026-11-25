'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeftRight,
    ArrowUpRight,
    BookOpen,
    Layers,
    Library,
    Megaphone,
    Tags,
    TriangleAlert,
    Users,
    Wallet,
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import KartuStatistik from '@/components/KartuStatistik';
import StatusPil from '@/components/StatusPil';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { kelasPanel } from '@/lib/gaya';
import { DAFTAR_STATUS, NADA_STATUS, WARNA_BATANG } from '@/lib/statusTransaksi';

// Panel navigasi utama admin. `bulat` = warna latar ikon (kelas ditulis utuh agar terbaca Tailwind).
const MENU = [
    {
        href: '/dashboard/admin/users',
        ikon: Users,
        judul: 'Pengguna',
        teks: 'Kelola akun admin, pegawai, dan mahasiswa.',
        bulat: 'bg-tinta text-krem',
    },
    {
        href: '/dashboard/admin/kategori',
        ikon: Tags,
        judul: 'Kategori buku',
        teks: 'Atur kategori dan kode klasifikasi koleksi.',
        bulat: 'bg-kuning-muda text-kuning',
    },
    {
        href: '/dashboard/admin/transaksi',
        ikon: ArrowLeftRight,
        judul: 'Log transaksi',
        teks: 'Pantau seluruh peminjaman dan denda.',
        bulat: 'bg-hijau-muda text-hijau',
    },
    {
        href: '/dashboard/pegawai/buku',
        ikon: Library,
        judul: 'Koleksi buku',
        teks: 'Tambah, ubah, dan hapus buku serta stok.',
        bulat: 'bg-koral/10 text-koral-tua',
    },
    {
        href: '/dashboard/pegawai/pengumuman',
        ikon: Megaphone,
        judul: 'Pengumuman',
        teks: 'Tulis kabar operasional, layanan, dan acara.',
        bulat: 'bg-tinta/10 text-tinta',
    },
];

export default function DashboardAdmin() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [galat, setGalat] = useState('');

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then(async (res) => {
                if (res.status === 401 || res.status === 403) {
                    router.push('/login?dari=/dashboard/admin');
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
                <div className="h-44 animate-pulse rounded-3xl bg-garis/60" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-24 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
                <div className="h-64 animate-pulse rounded-2xl bg-garis/60" />
            </div>
        );
    }

    const { statistik: s } = data;
    const namaDepan = data.nama.split(' ')[0];

    // Jumlah per status disusun mengikuti urutan DAFTAR_STATUS, status yang belum ada dihitung 0
    const jumlahStatus = DAFTAR_STATUS.map((status) => ({
        status,
        jumlah: data.per_status.find((p) => p.status === status)?.jumlah ?? 0,
    }));
    const totalTransaksi = jumlahStatus.reduce((total, p) => total + p.jumlah, 0);

    return (
        <div className="space-y-8 py-4 md:py-8">
            <section className="relative overflow-hidden rounded-3xl bg-tinta p-6 text-krem md:p-10">
                <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full bg-koral" />
                <div aria-hidden="true" className="absolute -bottom-24 right-32 size-52 rounded-full bg-krem/10" />
                <div className="relative max-w-xl">
                    <p className="text-xs font-medium uppercase tracking-widest text-krem/70">Panel admin</p>
                    <h1 className="mt-2 font-judul text-3xl leading-tight md:text-4xl">Halo, {namaDepan}</h1>
                    <p className="mt-3 text-sm text-krem/85 md:text-base">
                        Ringkasan perpustakaan hari ini: <br />{s.transaksi_aktif} buku sedang dipinjam dari{' '}
                        {s.total_eksemplar} stok yang tersedia di koleksi.
                    </p>
                </div>
            </section>

            <section aria-label="Statistik" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <KartuStatistik
                    ikon={Library}
                    label="Judul buku"
                    nilai={s.total_judul}
                    nada="tinta"
                    onClick={() => router.push('/dashboard/pegawai/buku')}
                />
                <KartuStatistik
                    ikon={Layers}
                    label="Total eksemplar"
                    nilai={s.total_eksemplar}
                    nada="kuning"
                    onClick={() => router.push('/dashboard/pegawai/buku')}
                />
                <KartuStatistik
                    ikon={Users}
                    label="Mahasiswa terdaftar"
                    nilai={s.total_mahasiswa}
                    nada="hijau"
                    onClick={() => router.push('/dashboard/admin/users?role=mahasiswa')}
                />
                <KartuStatistik
                    ikon={BookOpen}
                    label="Transaksi aktif"
                    nilai={s.transaksi_aktif}
                    nada="hijau"
                    onClick={() => router.push('/dashboard/admin/transaksi?status=Sedang%20Dipinjam')}
                />
                <KartuStatistik
                    ikon={Wallet}
                    label="Denda sudah lunas"
                    nilai={formatRupiah(s.denda_lunas)}
                    nada="tinta"
                    onClick={() => router.push('/dashboard/admin/transaksi?status=Selesai')}
                />
                <KartuStatistik
                    ikon={TriangleAlert}
                    label="Denda tertunggak"
                    nilai={s.denda_tertunggak}
                    nada="koral"
                    onClick={() => router.push('/dashboard/pegawai')}
                />
            </section>

            <section aria-labelledby="judul-menu">
                <h2 id="judul-menu" className="font-judul text-2xl">
                    Pengelolaan
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {MENU.map((m) => (
                        <Link
                            key={m.href}
                            href={m.href}
                            className="group flex items-center gap-4 rounded-2xl border border-garis bg-kertas p-4 shadow-kartu transition hover:-translate-y-0.5 hover:border-tinta/40"
                        >
                            <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${m.bulat}`}>
                                <m.ikon size={22} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-medium">{m.judul}</span>
                                <span className="block text-sm text-tinta-lembut">{m.teks}</span>
                            </span>
                            <ArrowUpRight
                                size={18}
                                aria-hidden="true"
                                className="shrink-0 text-abu transition group-hover:text-tinta"
                            />
                        </Link>
                    ))}
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <section aria-labelledby="judul-status" className={`${kelasPanel} p-5 md:p-6`}>
                    <h2 id="judul-status" className="font-judul text-xl">
                        Status transaksi
                    </h2>
                    <p className="mt-1 text-sm text-tinta-lembut">{totalTransaksi} transaksi tercatat</p>

                    <ul className="mt-5 space-y-4">
                        {jumlahStatus.map((p) => {
                            const persen = totalTransaksi > 0 ? (p.jumlah / totalTransaksi) * 100 : 0;
                            return (
                                <li key={p.status}>
                                    <div className="flex justify-between text-sm">
                                        <span>{p.status}</span>
                                        <span className="font-medium">{p.jumlah}</span>
                                    </div>
                                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-tinta/10">
                                        <div
                                            className={`h-full rounded-full ${WARNA_BATANG[p.status]}`}
                                            style={{ width: `${persen}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section aria-labelledby="judul-terbaru" className={`${kelasPanel} p-5 md:p-6`}>
                    <div className="flex items-baseline justify-between">
                        <h2 id="judul-terbaru" className="font-judul text-xl">
                            Transaksi terbaru
                        </h2>
                        <Link href="/dashboard/admin/transaksi" className="text-sm underline underline-offset-4">
                            Lihat semua
                        </Link>
                    </div>

                    {data.terbaru.length === 0 ? (
                        <p className="mt-4 text-sm text-tinta-lembut">Belum ada transaksi.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-garis">
                            {data.terbaru.map((t) => (
                                <li key={t.id} className="flex items-center gap-3 py-3">
                                    <Avatar nama={t.nama} ukuran={36} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{t.judul}</p>
                                        <p className="truncate text-xs text-abu">
                                            {t.nama}, {formatTanggal(t.tanggal_pengajuan)}
                                        </p>
                                    </div>
                                    <StatusPil nada={NADA_STATUS[t.status]}>{t.status}</StatusPil>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}