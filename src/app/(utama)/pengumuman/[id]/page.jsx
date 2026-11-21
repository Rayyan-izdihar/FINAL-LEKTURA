'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { formatTanggal } from '@/lib/format';

export default function DetailPengumuman() {
    const { id } = useParams();
    const [pengumuman, setPengumuman] = useState(null);
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


    return (
        <article className="py-4 md:py-8">
            <Link
                href="/pengumuman"
                className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
            >
                <ArrowLeft size={16} aria-hidden="true" /> Semua pengumuman
            </Link>

            <div className="mt-6 max-w-2xl">
                <div className="mb-3 flex items-center gap-2 text-xs text-abu">
                    <span className="rounded-full bg-tinta/5 px-2.5 py-0.5 font-medium text-tinta-lembut">
                        {pengumuman.kategori}
                    </span>
                    <time dateTime={pengumuman.tanggal_rilis}>{formatTanggal(pengumuman.tanggal_rilis)}</time>
                </div>

                <h1 className="font-judul text-3xl leading-tight md:text-4xl">{pengumuman.judul}</h1>
                <p className="mt-6 whitespace-pre-line leading-relaxed text-tinta-lembut">{pengumuman.isi}</p>
            </div>
        </article>
    );
}