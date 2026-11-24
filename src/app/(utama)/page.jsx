'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, BookOpen, Clock, GraduationCap, Search, Tags } from 'lucide-react';
import RakBuku from '@/components/RakBuku';
import KartuPengumuman from '@/components/KartuPengumuman';
import { kelasTombol } from '@/lib/gaya';

// Angka ringkas di bawah bagian atas beranda
const STATISTIK = [
    { kunci: 'total_judul', label: 'Judul buku', ikon: BookOpen, warna: 'bg-koral/10 text-koral-tua' },
    { kunci: 'total_kategori', label: 'Kategori koleksi', ikon: Tags, warna: 'bg-hijau-muda text-hijau' },
    { kunci: 'total_mahasiswa', label: 'Mahasiswa terdaftar', ikon: GraduationCap, warna: 'bg-kuning-muda text-kuning' },
    { kunci: 'total_peminjaman', label: 'Peminjaman tercatat', ikon: ArrowLeftRight, warna: 'bg-tinta/5 text-tinta' },
];

export default function Beranda() {
    // null = masih memuat
    const [populer, setPopuler] = useState(null);
    const [pengumuman, setPengumuman] = useState(null);
    const [statistik, setStatistik] = useState(null);
    const [user, setUser] = useState(undefined); // undefined = belum tahu, null = belum login
    const [galat, setGalat] = useState(false);

    // Semua data diambil sekali saat halaman dibuka, masing-masing dari route handler-nya.
    useEffect(() => {
        fetch('/api/books/popular')
            .then((res) => res.json())
            .then((data) => setPopuler(data.buku))
            .catch(() => setGalat(true));

        fetch('/api/announcements?limit=3')
            .then((res) => res.json())
            .then((data) => setPengumuman(data.pengumuman))
            .catch(() => setGalat(true));

        // Statistik hanya pelengkap: kalau gagal, bagiannya disembunyikan saja
        fetch('/api/statistik')
            .then((res) => res.json())
            .then((data) => setStatistik(data.statistik ?? false))
            .catch(() => setStatistik(false));

        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => setUser(data.user))
            .catch(() => setUser(undefined));
    }, []);

    return (
        <div className="space-y-12 py-4 md:space-y-14 md:py-8">
            <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
                <div>
                    <h1 className="font-judul text-4xl leading-tight md:text-5xl">
                        Temukan bacaan
                        <br className="hidden md:block" /> <span className='italic font-isi'>berikutnya.</span>
                    </h1>
                    <p className="mt-4 max-w-md text-tinta-lembut">
                        Telusuri koleksi perpustakaan kampus, ajukan peminjaman, dan pantau jatuh tempo dalam
                        satu tempat.
                    </p>

                    {/* Pencarian cepat: mengirim ?q=... ke halaman katalog */}
                    <form action="/katalog" role="search" className="relative mt-6 max-w-md">
                        <Search
                            size={16}
                            aria-hidden="true"
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-abu"
                        />

                        <input
                            type="search"
                            name="q"
                            aria-label="Cari buku berdasarkan judul atau pengarang"
                            placeholder="Cari judul atau pengarang..."
                            className="min-h-12 w-full rounded-full border border-garis bg-kertas pl-10 pr-20 text-sm placeholder:text-abu focus:border-tinta"
                        />

                        <button
                            type="submit"
                            className={`${kelasTombol.gelap} absolute right-1 top-1/2 -translate-y-1/2`}
                        >
                            Cari
                        </button>
                    </form>

                    <Link href="/katalog" className={`${kelasTombol.gelap} group pr-2 mt-4`}>
                        Jelajahi katalog
                        <span className="flex size-7 items-center justify-center rounded-full bg-krem/15 transition-transform group-hover:translate-x-0.5">
                            <ArrowRight size={16} aria-hidden="true" />
                        </span>
                    </Link>
                </div>

                {/* Ilustrasi hiasan (public/ilustrasi/rak-buku.svg) dengan info jam buka di pojoknya */}
                <div className="relative rounded-[2rem] bg-kuning-muda p-4 sm:p-6">
                    <img src="/rak-buku.svg" alt="" className="h-auto w-full" />
                    <p className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-kertas px-4 py-2 text-xs shadow-kartu sm:bottom-6 sm:left-6">
                        <Clock size={14} aria-hidden="true" className="text-hijau" />
                        Buka Senin sampai Sabtu, 09.00-20.00 WITA
                    </p>
                </div>
            </section>

            {/* Statistik singkat: gambaran awal koleksi untuk pengunjung baru */}
            {statistik !== false && (
                <section aria-label="Lektura dalam angka">
                    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-garis bg-garis shadow-kartu lg:grid-cols-4">
                        {STATISTIK.map(({ kunci, label, ikon: Ikon, warna }) => (
                            <div key={kunci} className="flex items-center gap-4 bg-kertas p-5 sm:p-6">
                                <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${warna}`}>
                                    <Ikon size={22} aria-hidden="true" />
                                </span>
                                <div>
                                    <dd className="font-judul text-3xl leading-none">
                                        {statistik ? Number(statistik[kunci]).toLocaleString('id-ID') : '-'}
                                    </dd>
                                    <dt className="mt-1.5 text-sm text-tinta-lembut">{label}</dt>
                                </div>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            <section aria-labelledby="judul-populer">
                <h2 id="judul-populer" className="mb-1 text-sm font-medium text-abu">
                    5 buku terpopuler
                </h2>

                {populer === null && !galat && <p className="py-6 text-sm text-abu">Memuat buku...</p>}

                {populer?.length === 0 && (
                    <p className="py-6 text-sm text-abu">Belum ada data peminjaman.</p>
                )}

                {populer?.length > 0 && <RakBuku buku={populer} />}

                {galat && (
                    <p role="alert" className="py-6 text-sm text-koral-tua">
                        Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.
                    </p>
                )}
            </section>

            <section aria-labelledby="judul-pengumuman">
                <div className="mb-4 flex items-baseline justify-between">
                    <h2 id="judul-pengumuman" className="font-judul text-2xl md:text-3xl">
                        Pengumuman terbaru
                    </h2>

                    <Link href="/pengumuman" className="text-sm underline underline-offset-4">
                        Lihat semua
                    </Link>
                </div>

                {pengumuman === null && <p className="text-sm text-abu">Memuat pengumuman...</p>}

                {pengumuman?.length === 0 && <p className="text-sm text-abu">Belum ada pengumuman.</p>}

                {pengumuman?.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {pengumuman.map((item) => (
                            <KartuPengumuman key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </section>

            {/* Ajakan masuk: hanya tampil untuk pengunjung yang belum login */}
            {user === null && (
                <section
                    aria-labelledby="judul-ajakan"
                    className="relative overflow-hidden rounded-3xl bg-tinta px-6 py-10 text-krem sm:px-10 md:py-14"
                >
                    <BookOpen
                        aria-hidden="true"
                        strokeWidth={1.25}
                        className="pointer-events-none absolute -bottom-10 -right-6 size-64 text-krem/10"
                    />

                    <div className="relative max-w-xl">
                        <h2 id="judul-ajakan" className="font-judul text-3xl leading-tight md:text-4xl">
                            Mulai meminjam bukumu sendiri
                        </h2>
                        <p className="mt-3 text-krem/75">
                            Masuk dengan akun mahasiswa untuk mengajukan peminjaman, memantau jatuh tempo, dan
                            menulis ulasan. Belum punya akun? Daftar dengan email kampus.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/login"
                                className="inline-flex min-h-11 items-center rounded-full bg-krem px-6 text-sm font-medium text-tinta transition-colors hover:bg-white"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex min-h-11 items-center rounded-full border border-krem/30 px-6 text-sm font-medium transition-colors hover:bg-krem/10"
                            >
                                Daftar akun
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}