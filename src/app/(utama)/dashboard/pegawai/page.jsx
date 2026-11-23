'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BookOpen, CalendarClock, Hourglass, Library, Megaphone, Wallet } from 'lucide-react';
import AntreanPerpanjangan from '@/components/pegawai/AntreanPerpanjangan';
import AntreanPinjam from '@/components/pegawai/AntreanPinjam';
import MejaSirkulasi from '@/components/pegawai/MejaSirkulasi';
import PelunasanDenda from '@/components/pegawai/PelunasanDenda';
import KartuStatistik from '@/components/KartuStatistik';
import PesanAksi from '@/components/PesanAksi';


// Pintasan ke halaman kelola (dibuat di bagian berikutnya)
const PINTASAN = [
    {
        href: '/pegawai/buku',
        ikon: Library,
        judul: 'Kelola buku',
        teks: 'Tambah, ubah, dan hapus koleksi serta stok.',
    },
    {
        href: '/pegawai/pengumuman',
        ikon: Megaphone,
        judul: 'Kelola pengumuman',
        teks: 'Tulis kabar operasional, layanan, dan acara.',
    },
];


export default function DashboardPegawai() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [galat, setGalat] = useState('');
    const [tab, setTab] = useState('pinjam'); // 'pinjam' | 'perpanjangan' | 'sirkulasi' | 'denda'
    const [versi, setVersi] = useState(0); // naik 1 setiap ada aksi, memicu semua daftar memuat ulang
    const [pesan, setPesan] = useState(null);

    useEffect(() => {
        let dibatalkan = false;

        fetch('/api/pegawai/dashboard')
            .then(async (res) => {
                if (res.status === 401 || res.status === 403) {
                    router.push('/login?dari=/dashboard/pegawai');
                    return;
                }

                if (!res.ok) throw new Error('gagal');

                const hasil = await res.json();
                if (!dibatalkan) {
                    setData(hasil);
                    setGalat('');
                }
            })
            .catch(() => {
                if (!dibatalkan) setGalat('Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.');
            });

        return () => {
            dibatalkan = true;
        };
    }, [versi, router]);

    // Stabil di antara render, dibutuhkan PesanAksi untuk penghitung waktunya
    const tutupPesan = useCallback(() => setPesan(null), []);

    // Dipanggil komponen anak setelah sebuah aksi: tampilkan pesan lalu muat ulang semua data
    function selesai(hasil) {
        setPesan(hasil);
        setVersi((v) => v + 1);
    }

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
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-24 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
                <div className="h-64 animate-pulse rounded-2xl bg-garis/60" />
            </div>
        );
    }


    const { ringkasan } = data;
    const namaDepan = data.nama.split(' ')[0];

    const butuhKeputusan = ringkasan.menunggu + ringkasan.perpanjangan;
    const kalimatRingkas =
        butuhKeputusan > 0
            ? `Ada ${ringkasan.menunggu} pengajuan pinjam dan ${ringkasan.perpanjangan} perpanjangan yang menunggu keputusanmu.`
            : 'Semua antrean sudah beres. Tidak ada pengajuan yang menunggu.';

    const daftarTab = [
        { id: 'pinjam', label: 'Antrean pinjam', jumlah: ringkasan.menunggu },
        { id: 'perpanjangan', label: 'Perpanjangan', jumlah: ringkasan.perpanjangan },
        { id: 'sirkulasi', label: 'Meja sirkulasi', jumlah: ringkasan.aktif },
        { id: 'denda', label: 'Denda', jumlah: ringkasan.tertunggak },
    ];


    return (
        <div className="space-y-8 py-4 md:py-8">
            <section className="relative overflow-hidden rounded-3xl bg-tinta p-6 text-krem md:p-10">
                <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full bg-koral" />
                <div aria-hidden="true" className="absolute -bottom-24 right-32 size-52 rounded-full bg-krem/10" />

                <div className="relative max-w-xl">
                    <p className="text-xs font-medium uppercase tracking-widest text-krem/70">Meja pegawai</p>
                    <h1 className="mt-2 font-judul text-3xl leading-tight md:text-4xl">Halo, {namaDepan}</h1>
                    <p className="mt-3 text-sm text-krem/85 md:text-base">{kalimatRingkas}</p>
                </div>
            </section>

            <section aria-label="Ringkasan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KartuStatistik
                    ikon={Hourglass}
                    label="Menunggu konfirmasi"
                    nilai={ringkasan.menunggu}
                    nada="kuning"
                    aktif={tab === 'pinjam'}
                    onClick={() => setTab('pinjam')}
                />
                <KartuStatistik
                    ikon={CalendarClock}
                    label="Perpanjangan diajukan"
                    nilai={ringkasan.perpanjangan}
                    nada="tinta"
                    aktif={tab === 'perpanjangan'}
                    onClick={() => setTab('perpanjangan')}
                />
                <KartuStatistik
                    ikon={BookOpen}
                    label="Sedang dipinjam"
                    nilai={ringkasan.aktif}
                    nada="hijau"
                    aktif={tab === 'sirkulasi'}
                    onClick={() => setTab('sirkulasi')}
                />
                <KartuStatistik
                    ikon={Wallet}
                    label="Denda tertunggak"
                    nilai={ringkasan.tertunggak}
                    nada="koral"
                    aktif={tab === 'denda'}
                    onClick={() => setTab('denda')}
                />
            </section>

            <section aria-label="Pintasan" className="grid gap-3 sm:grid-cols-2">
                {PINTASAN.map((p) => (
                    <Link
                        key={p.href}
                        href={p.href}
                        className="group flex items-center gap-4 rounded-2xl border border-garis bg-kertas p-4 shadow-kartu transition hover:-translate-y-0.5 hover:border-tinta/40"
                    >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tinta text-krem">
                            <p.ikon size={20} aria-hidden="true" />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block font-medium">{p.judul}</span>
                            <span className="block text-sm text-tinta-lembut">{p.teks}</span>
                        </span>

                        <ArrowUpRight
                            size={18}
                            aria-hidden="true"
                            className="shrink-0 text-abu transition group-hover:text-tinta"
                        />
                    </Link>
                ))}
            </section>

            <section>
                <div role="tablist" aria-label="Pekerjaan pegawai" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                    {daftarTab.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            id={`tab-${t.id}`}
                            aria-selected={tab === t.id}
                            aria-controls={`panel-${t.id}`}
                            onClick={() => setTab(t.id)}
                            className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors ${
                                tab === t.id
                                    ? 'border-tinta bg-tinta text-krem'
                                    : 'border-garis bg-kertas text-tinta-lembut hover:border-tinta/40'
                            }`}
                        >
                            {t.label}
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                    tab === t.id ? 'bg-krem/20 text-krem' : 'bg-tinta/10 text-tinta'
                                }`}
                            >
                                {t.jumlah}
                            </span>
                        </button>
                    ))}
                </div>

                <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-4">
                    {tab === 'pinjam' && 
                        <AntreanPinjam daftar={data.antrean_pinjam} onSelesai={selesai} 
                    />}

                    {tab === 'perpanjangan' && (
                        <AntreanPerpanjangan daftar={data.antrean_perpanjangan} onSelesai={selesai} />
                    )}

                    {tab === 'sirkulasi' && 
                        <MejaSirkulasi versi={versi} onSelesai={selesai} 
                    />}

                    {tab === 'denda' && (
                        <PelunasanDenda versi={versi} onSelesai={selesai} onKeSirkulasi={() => setTab('sirkulasi')} />
                    )}
                </div>
            </section>

            <PesanAksi pesan={pesan} onTutup={tutupPesan} />
        </div>
    );
}