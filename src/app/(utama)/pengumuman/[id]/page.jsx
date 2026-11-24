'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Check, Clock, Link2 } from 'lucide-react';
import { formatTanggal } from '@/lib/format';
import { kelasTombol } from '@/lib/gaya';
import { gayaKategori } from '@/lib/kategoriPengumuman';

export default function DetailPengumuman() {
    const { id } = useParams();
    const [pengumuman, setPengumuman] = useState(null);
    const [lainnya, setLainnya] = useState([]);
    const [status, setStatus] = useState('memuat'); // 'memuat' | 'ada' | 'tidak-ada' | 'galat'

    useEffect(() => {
        fetch(`/api/announcements/${id}`)
            .then(async (res) => {
                if (res.status === 404) {
                    setStatus('tidak-ada');
                    return;
                }
                const data = await res.json();

                setPengumuman(data.pengumuman);
                setStatus('ada');
            })
            .catch(() => setStatus('galat'));
    }, [id]);

    // Pengumuman lain untuk kolom samping (kegagalan di sini tidak mengganggu halaman utama)
    useEffect(() => {
        fetch('/api/announcements?limit=6')
            .then((res) => res.json())
            .then((data) => setLainnya((data.pengumuman ?? []).filter((item) => String(item.id) !== String(id)).slice(0, 4)))
            .catch(() => setLainnya([]));
    }, [id]);


    if (status === 'memuat') {
        return <p className="py-10 text-tinta-lembut">Memuat pengumuman...</p>;
    }
    if (status === 'tidak-ada') {
        return (
            <div className="py-16 text-center">
                <p className="font-judul text-2xl">Pengumuman tidak ditemukan</p>
                <Link href="/pengumuman" className="mt-3 inline-block text-sm underline underline-offset-4">
                    Kembali ke daftar pengumuman
                </Link>
            </div>
        );
    }
    if (status === 'galat') {
        return (
            <p role="alert" className="py-10 text-koral-tua">
                Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.
            </p>
        );
    }

    const gaya = gayaKategori(pengumuman.kategori);
    const Ikon = gaya.ikon;
    const kata = pengumuman.isi.trim().split(/\s+/).length;

    return (
        <article className="mx-auto max-w-6xl py-4 md:py-8">
            <Link
                href="/pengumuman"
                className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
            >
                <ArrowLeft size={16} aria-hidden="true" /> Semua pengumuman
            </Link>

            {/* Kepala: warna mengikuti kategori */}
            <header className={`relative mt-5 overflow-hidden rounded-3xl border px-6 py-8 md:px-10 md:py-12 ${gaya.latar}`}>
                <Ikon
                    aria-hidden="true"
                    strokeWidth={1.25}
                    className={`pointer-events-none absolute -bottom-10 -right-6 size-64 ${gaya.ikonBesar}`}
                />

                <div className="relative">
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-kertas px-3 py-1 text-xs font-medium ${gaya.teks}`}>
                        <Ikon size={14} aria-hidden="true" />
                        {pengumuman.kategori}
                    </span>

                    <h1 className="mt-4 max-w-3xl font-judul text-3xl leading-tight md:text-5xl">
                        {pengumuman.judul}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-tinta-lembut">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={16} aria-hidden="true" />
                            <time dateTime={pengumuman.tanggal_rilis}>{formatTanggal(pengumuman.tanggal_rilis)}</time>
                        </span>
                    </div>
                </div>
            </header>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                {/* Isi pengumuman */}
                <div className="rounded-3xl border border-garis bg-kertas p-6 shadow-kartu md:p-10">
                    <p className="max-w-[68ch] whitespace-pre-line text-lg leading-8 text-tinta">
                        {pengumuman.isi}
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-garis pt-6">
                        <Link href="/pengumuman" className={kelasTombol.gelap}>
                            Lihat semua pengumuman
                        </Link>
                    </div>
                </div>

                {/* Kolom samping */}
                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                    {lainnya.length > 0 && (
                        <section className="rounded-3xl border border-garis bg-kertas p-5 shadow-kartu">
                            <h2 className="font-judul text-xl">Pengumuman lainnya</h2>

                            <ul className="mt-3 divide-y divide-garis">
                                {lainnya.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={`/pengumuman/${item.id}`}
                                            className="group flex gap-3 py-3 first:pt-1 last:pb-1"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`mt-1.5 size-2.5 shrink-0 rounded-full ${gayaKategori(item.kategori).titik}`}
                                            />
                                            <span className="min-w-0">
                                                <span className="block text-sm font-medium leading-snug group-hover:underline group-hover:underline-offset-4">
                                                    {item.judul}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-abu">
                                                    {item.kategori}, {formatTanggal(item.tanggal_rilis)}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </aside>
            </div>
        </article>
    );
}