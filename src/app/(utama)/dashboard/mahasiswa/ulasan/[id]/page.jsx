'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Sampul from '@/components/Sampul';
import PilihBintang from '@/components/PilihBintang';
import { kelasTombol } from '@/lib/gaya';

export default function HalamanUlasan() {
    const { id } = useParams(); // nomor transaksi dari alamat, contoh /dashboard/mahasiswa/ulasan/3
    const router = useRouter();

    const [pinjaman, setPinjaman] = useState(null);
    const [status, setStatus] = useState('memuat'); // 'memuat' | 'ada' | 'tidak-ada' | 'galat'
    const [rating, setRating] = useState(0);
    const [ulasan, setUlasan] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/loans/${id}`)
            .then(async (res) => {
                if (!res.ok) {
                    setStatus('tidak-ada');
                    return;
                }
                
                const data = await res.json();
                setPinjaman(data.pinjaman);
                setStatus('ada');
            })
            .catch(() => setStatus('galat'));
    }, [id]);

    async function kirim(e) {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Pilih rating terlebih dahulu.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loan_id: Number(id), rating, ulasan }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.pesan);
                return;
            }

            router.push('/dashboard/mahasiswa');
        } catch {
            setError('Tidak dapat menghubungi server. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    const tautanKembali = (
        <Link
            href="/dashboard/mahasiswa"
            className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
        >
            <ArrowLeft size={16} aria-hidden="true" /> Kembali ke dashboard
        </Link>
    );

    if (status === 'memuat') {
        return <p className="py-10 text-tinta-lembut">Memuat...</p>;
    }
    if (status === 'tidak-ada') {
        return (
            <div className="py-16 text-center">
                <p className="font-judul text-2xl">Transaksi tidak ditemukan</p>
                <div className="mt-3">{tautanKembali}</div>
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

    // Ulasan hanya untuk transaksi Selesai yang belum diulas
    const tidakBisa =
        pinjaman.status !== 'Selesai'
            ? 'Ulasan hanya dapat ditulis setelah buku selesai dipinjam.'
            : pinjaman.sudah_diulas
              ? 'Kamu sudah menulis ulasan untuk peminjaman ini.'
              : '';

    return (
        <div className="py-4 md:py-8">
            {tautanKembali}

            <div className="mt-6 max-w-lg">
                <h1 className="font-judul text-3xl">Tulis ulasan</h1>

                <div className="mt-5 flex items-center gap-4">
                    <Sampul src={pinjaman.sampul} judul={pinjaman.judul} className="w-16 shrink-0" />
                    <div>
                        <p className="font-medium leading-snug">{pinjaman.judul}</p>
                        <p className="text-sm text-tinta-lembut">{pinjaman.penulis}</p>
                    </div>
                </div>

                {tidakBisa ? (
                    <p className="mt-8 rounded-xl border border-garis bg-kertas px-4 py-3 text-sm">
                        {tidakBisa}
                    </p>
                ) : (
                    <form onSubmit={kirim} className="mt-8 space-y-5">
                        <div>
                            <span className="mb-1 block text-sm font-medium">Rating</span>
                            <PilihBintang nilai={rating} onUbah={setRating} />
                        </div>

                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium">
                                Ulasan (opsional)
                            </span>
                            <textarea
                                value={ulasan}
                                onChange={(e) => setUlasan(e.target.value)}
                                maxLength={500}
                                rows={4}
                                placeholder="Ceritakan pendapatmu tentang buku ini..."
                                className="w-full rounded-xl border border-garis bg-kertas px-4 py-2.5 text-sm placeholder:text-abu focus:border-tinta"
                            />
                        </label>

                        {error && (
                            <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={loading} className={kelasTombol.koral}>
                            {loading ? 'Menyimpan...' : 'Kirim ulasan'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}