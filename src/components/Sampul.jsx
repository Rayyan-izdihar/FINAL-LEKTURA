'use client';
import { useState } from 'react';

// Kalau sampul kosong atau gambarnya gagal dimuat, tampil sampul kosong (ikon buku) berisi judul buku.
// Ukuran diatur lewat className dari luar, contoh: <Sampul src={...} judul={...} className="w-32" />
export default function Sampul({ src, judul, className = '' }) {
    // Simpan alamat yang gagal dimuat (bukan true/false), supaya saat src berubah
    // (misalnya pegawai sedang mengetik path) pratinjau otomatis mencoba lagi.
    const [srcGagal, setSrcGagal] = useState(null);
    const gagal = srcGagal === src;

    if (!src || gagal) {
        return (
            <div className={`@container relative aspect-[5/7] overflow-hidden rounded-sm bg-tinta font-judul text-sm text-krem shadow-[0_14px_24px_-10px_rgba(31,36,48,0.45)] ${className}`}>
                <img
                    src="/covers/cover-placeholder.svg"
                    alt="Sampul belum tersedia"
                    className="absolute inset-0 size-full object-cover"
                />
                <span className="absolute inset-x-[7cqw] bottom-[7cqw] hidden text-[7.5cqw] font-bold tracking-wide leading-tight @min-[7rem]:line-clamp-3">{judul}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={`Sampul buku ${judul}`}
            onError={() => setSrcGagal(src)}
            className={`aspect-[5/7] rounded-sm object-cover shadow-[0_14px_24px_-10px_rgba(31,36,48,0.45)] ${className}`}
        />
    );
}