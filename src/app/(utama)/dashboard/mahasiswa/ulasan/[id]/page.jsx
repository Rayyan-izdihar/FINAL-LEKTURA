'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Sampul from '@/components/Sampul';
import PilihBintang from '@/components/PilihBintang';
import { formatTanggal } from '@/lib/format';
import { kelasTombol } from '@/lib/gaya';

const BATAS = 500;

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
        <div className="mx-auto max-w-5xl py-4 md:py-8">
            {tautanKembali}

            <div className="mt-6 grid gap-3 rounded-3xl border border-garis bg-kertas py-4 pl-4 shadow-kartu lg:grid-cols-[auto_minmax(0,1fr)]">
                {/* Kiri: buku yang diulas. Lebarnya mengikuti sampul (lg:w-56), sisanya untuk formulir. */}
                <aside className="bg-tinta px-8 py-10 text-krem lg:px-10 rounded-3xl">
                    <div className="mx-auto flex flex-col items-center gap-6 text-center lg:mx-0 lg:w-56 lg:items-start lg:text-left">
                        <Sampul
                            src={pinjaman.sampul}
                            judul={pinjaman.judul}
                            className="w-36 ring-1 ring-krem/15 sm:w-44 lg:w-full"
                        />

                        <div>
                            <p className="font-judul text-2xl leading-tight">{pinjaman.judul}</p>
                            <p className="mt-1 text-krem/70">{pinjaman.penulis}</p>

                            {pinjaman.tanggal_kembali && (
                                <p className="mt-5 border-t border-krem/15 pt-4 text-sm text-krem/70">
                                    Dikembalikan {formatTanggal(pinjaman.tanggal_kembali)}
                                </p>
                            )}
                            <p className="mt-4 text-sm text-krem/70">
                                Ulasanmu membantu mahasiswa lain memilih buku.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Kanan: formulir */}
                <section className="bg-kertas px-6 py-8 sm:px-10 sm:py-10">
                    <h1 className="font-judul text-3xl">Tulis ulasan</h1>
                    <p className="mt-1 text-sm text-tinta-lembut">Bagaimana pendapatmu tentang buku ini?</p>

                    {tidakBisa ? (
                        <p className="mt-8 rounded-xl border border-garis bg-krem px-4 py-3 text-sm">
                            {tidakBisa}
                        </p>
                    ) : (
                        <form onSubmit={kirim} className="mt-8 space-y-7">
                            <div>
                                <span className="mb-2 block text-sm font-medium">Rating</span>
                                <PilihBintang nilai={rating} onUbah={setRating} />
                            </div>

                            <div>
                                <label htmlFor="ulasan" className="mb-1.5 block text-sm font-medium">
                                    Ulasan (opsional)
                                </label>
                                <textarea
                                    id="ulasan"
                                    value={ulasan}
                                    onChange={(e) => setUlasan(e.target.value)}
                                    maxLength={BATAS}
                                    rows={6}
                                    placeholder="Ceritakan pendapatmu tentang buku ini..."
                                    className="w-full rounded-xl border border-garis bg-white/60 px-4 py-3 text-sm placeholder:text-abu focus:border-tinta"
                                />
                                <p className="mt-1 text-right text-xs text-abu">
                                    {ulasan.length}/{BATAS}
                                </p>
                            </div>

                            {error && (
                                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 border-t border-garis pt-6">
                                <button type="submit" disabled={loading} className={kelasTombol.koral}>
                                    {loading ? 'Menyimpan...' : 'Kirim ulasan'}
                                </button>
                                <Link href="/dashboard/mahasiswa" className={kelasTombol.garis}>
                                    Batal
                                </Link>
                            </div>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
}