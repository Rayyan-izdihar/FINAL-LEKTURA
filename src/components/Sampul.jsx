'use client';
import { useState } from 'react';

// Kalau sampul kosong atau gambarnya gagal dimuat, tampil kotak gelap berisi judul buku.
// Ukuran diatur lewat className dari luar, contoh: <Sampul src={...} judul={...} className="w-32" />
export default function Sampul({ src, judul, className = '' }) {
    const [gagal, setGagal] = useState(false);

    if (!src || gagal) {
        return (
            <div className={`relative flex aspect-[5/7] flex-col items-start justify-between rounded-sm bg-tinta p-3 font-judul text-sm text-krem`}>
                <img
                    src="/covers/cover-placeholder.svg"
                    alt="Sampul belum tersedia"
                    className={`mx-auto mt-4 object-contain ${className}`}
                />
                {judul}
            </div>
        );
    }

    return (
        // Memakai <img> biasa (bukan next/image) agar alamat gambar dari luar situs
        // yang diisi pegawai juga bisa tampil tanpa konfigurasi tambahan.
        <img
            src={src}
            alt={`Sampul buku ${judul}`}
            onError={() => setGagal(true)}
            className={`aspect-[5/7] rounded-sm object-cover shadow-[0_14px_24px_-10px_rgba(31,36,48,0.45)] ${className}`}
        />
    );
}