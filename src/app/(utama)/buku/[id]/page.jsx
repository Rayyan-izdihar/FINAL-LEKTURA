'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Sampul from '@/components/Sampul';
import Bintang from '@/components/Bintang';
import TombolPinjam from '@/components/TombolPinjam';
import { formatRupiah, formatTanggal } from '@/lib/format';

export default function DetailBuku() {
    const { id } = useParams(); // nilai [id] dari alamat, contoh /buku/3 -> "3"
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('memuat'); // 'memuat' | 'ada' | 'tidak-ada' | 'galat'
    const [batasUlasan, setBatasUlasan] = useState(6);


    // useCallback: fungsi ini juga dipanggil TombolPinjam setelah pengajuan berhasil, untuk memuat ulang.
    const muat = useCallback(async () => {
        try {
            const res = await fetch(`/api/books/${id}`);
            if (res.status === 404) {
                setStatus('tidak-ada');
                return;
            }

            if (!res.ok) throw new Error('gagal');

            setData(await res.json());
            setStatus('ada');
        } catch {
            setStatus('galat');
        }
    }, [id]);

    useEffect(() => {
        muat();
    }, [muat]);


    if (status === 'memuat') {
        return <p className="py-10 text-tinta-lembut">Memuat buku...</p>;
    }
    if (status === 'tidak-ada') {
        return (
            <div className="py-16 text-center">
                <p className="font-judul text-2xl">Buku tidak ditemukan</p>
                <Link href="/katalog" className="mt-3 inline-block text-sm underline underline-offset-4">
                    Kembali ke katalog
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


    const { buku, ulasan, rata_rating: rataRating, akses } = data;

    const rincian = [
        ['ISBN', buku.isbn],
        ['Penerbit', buku.penerbit],
        ['Tahun terbit', buku.tahun_terbit],
        ['Kategori', buku.kategori],
        ['Stok tersedia', `${buku.stok_tersedia} dari ${buku.stok_total}`],
        ['Batas lama pinjam', `${buku.maksimal_pinjam} hari`],
        ['Denda per hari', formatRupiah(buku.denda_per_hari)],
    ];


    return (
        <div className="space-y-12 py-4 md:py-8">
            <Link
                href="/katalog"
                className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
            >
                <ArrowLeft size={16} aria-hidden="true" /> Kembali ke katalog
            </Link>

            <section className="grid gap-8 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-12">
                <Sampul src={buku.sampul} judul={buku.judul} className="w-full max-w-64 md:max-w-none" />

                <div>
                    <p className="text-sm text-abu">{buku.kategori}</p>
                    <h1 className="mt-1 font-judul text-3xl leading-tight md:text-4xl">{buku.judul}</h1>
                    <p className="mt-1 text-tinta-lembut">{buku.penulis}</p>

                    <div className="mt-3">
                        <Bintang nilai={rataRating} jumlah={ulasan.length} ukuran={16} />
                    </div>

                    <dl className="mt-6 grid max-w-xl grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                        {rincian.map(([nama, nilai]) => (
                            <div key={nama} className="border-b border-garis pb-2">
                                <dt className="text-xs text-abu">{nama}</dt>
                                <dd className="font-medium">{nilai}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-8">
                        <TombolPinjam
                            bukuId={buku.id}
                            stok={buku.stok_tersedia}
                            akses={akses}
                            onBerhasil={muat}
                        />
                    </div>
                </div>
            </section>

            <section aria-labelledby="judul-ulasan">
                <h2 id="judul-ulasan" className="font-judul text-2xl">
                    Ulasan mahasiswa <span className="text-base text-abu">({ulasan.length})</span>
                </h2>

                {ulasan.length === 0 ? (
                        <p className="mt-4 text-sm text-tinta-lembut">
                            Belum ada ulasan. Ulasan dapat ditulis setelah buku selesai dipinjam.
                        </p>
                    ) : (
                        <>
                            <ul className="mt-4 grid gap-4 md:grid-cols-2">
                                {ulasan.slice(0, batasUlasan).map((u) => (
                                    <li key={u.id} className="rounded-2xl border border-garis bg-kertas p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium">{u.nama}</span>

                                            <time dateTime={u.tanggal} className="text-xs text-abu">
                                                {formatTanggal(u.tanggal)}
                                            </time>
                                        </div>

                                        <div className="mt-1">
                                            <Bintang nilai={u.rating} />
                                        </div>

                                        {u.ulasan && (
                                            <p className="mt-2 text-sm text-tinta-lembut">
                                                {u.ulasan}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {ulasan.length > batasUlasan && (
                                <button
                                    type="button"
                                    onClick={() => setBatasUlasan((jumlah) => jumlah + 4)}
                                    className="mt-5 rounded-full border border-garis px-5 py-2.5 text-sm font-medium transition-colors hover:bg-kertas"
                                >
                                    Tampilkan ulasan lainnya
                                </button>
                            )}
                        </>
                    )}
            </section>
        </div>
    );
}