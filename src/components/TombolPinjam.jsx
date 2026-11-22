'use client';
import { useState } from 'react';
import Link from 'next/link';
import { kelasTombol } from '@/lib/gaya';


// Tombol "Ajukan Pinjam" di halaman detail buku.
// `akses` berasal dari API detail buku: { login, role, terblokir, sudahAda }.
// Tombol hanya aktif untuk mahasiswa yang tidak terblokir denda, belum meminjam buku ini, dan stok > 0.
export default function TombolPinjam({ bukuId, stok, akses, onBerhasil }) {
    const [loading, setLoading] = useState(false);
    const [hasil, setHasil] = useState(null); // { ok: true/false, pesan: '...' }

    // Guest: arahkan ke halaman login, lalu kembali ke buku ini.
    if (!akses.login) {
        return (
            <Link href={`/login?dari=/buku/${bukuId}`} className={kelasTombol.gelap}>
                Masuk untuk meminjam
            </Link>
        );
    }

    if (akses.role !== 'mahasiswa') {
        return <p className="text-sm text-abu">Peminjaman hanya tersedia untuk akun mahasiswa.</p>;
    }

    // Alasan tombol nonaktif (kosong berarti tombol aktif)
    let alasanNonaktif = '';
    if (akses.terblokir) {
        alasanNonaktif = 'Kamu masih punya denda tertunggak. Lunasi di meja sirkulasi untuk meminjam lagi.';
    } else if (akses.sudahAda) {
        alasanNonaktif = 'Kamu sudah mengajukan atau sedang meminjam buku ini.';
    } else if (stok <= 0) {
        alasanNonaktif = 'Stok buku sedang habis.';
    }

    async function ajukan() {
        setLoading(true);
        setHasil(null);

        const res = await kirimAksi('/api/loans', { book_id: bukuId });
        setLoading(false);

        setHasil({ ok: res.ok, pesan: res.pesan });
        if (res.ok) onBerhasil?.();
    }

    return (
        <div>
            <button
                type="button"
                onClick={ajukan}
                disabled={Boolean(alasanNonaktif) || loading}
                className={kelasTombol.koral}
            >
                {loading ? 'Memproses...' : 'Ajukan Pinjam'}
            </button>

            {alasanNonaktif && <p className="mt-2 max-w-sm text-sm text-abu">{alasanNonaktif}</p>}

            {hasil && (
                <p
                    role={hasil.ok ? 'status' : 'alert'}
                    className={`mt-3 max-w-sm rounded-xl px-4 py-3 text-sm ${
                        hasil.ok ? 'border border-garis bg-kertas' : 'bg-koral/10 text-koral-tua'
                    }`}
                >
                    {hasil.pesan}
                </p>
            )}
        </div>
    );
}