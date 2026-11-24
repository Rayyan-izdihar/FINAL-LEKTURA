'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import RakBuku from '@/components/RakBuku';
import KartuPengumuman from '@/components/KartuPengumuman';
import { kelasTombol } from '@/lib/gaya';

export default function Beranda() {
    // null = masih memuat
    const [populer, setPopuler] = useState(null);
    const [pengumuman, setPengumuman] = useState(null);
    const [galat, setGalat] = useState(false);

    // Dua data diambil sekali saat halaman dibuka, masing-masing dari route handler-nya.
    useEffect(() => {
        fetch('/api/books/popular')
            .then((res) => res.json())
            .then((data) => setPopuler(data.buku))
            .catch(() => setGalat(true));

        fetch('/api/announcements?limit=2')
            .then((res) => res.json())
            .then((data) => setPengumuman(data.pengumuman))
            .catch(() => setGalat(true));
    }, []);

    return (
        <div className="space-y-10 py-4 md:py-8">
            <section className="grid items-start gap-10 lg:grid-cols-[1.4fr_1.4fr] lg:gap-14">
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

                <aside
                    aria-labelledby="judul-pengumuman"
                    className="w-full space-y-3 lg:max-w-xl lg:justify-self-end"
                >
                    <div className="flex items-baseline justify-between">
                        <h2 id="judul-pengumuman" className="text-sm font-medium text-abu">
                            Pengumuman terbaru
                        </h2>

                        <Link href="/pengumuman" className="text-sm underline underline-offset-4">
                            Lihat semua
                        </Link>
                    </div>

                    {pengumuman === null && <p className="text-sm text-abu">Memuat pengumuman...</p>}

                    {pengumuman?.length === 0 && (
                        <p className="text-sm text-abu">Belum ada pengumuman.</p>
                    )}

                    {pengumuman?.map((item) => (
                        <KartuPengumuman key={item.id} item={item} />
                    ))}
                </aside>
            </section>

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
        </div>
    );
}