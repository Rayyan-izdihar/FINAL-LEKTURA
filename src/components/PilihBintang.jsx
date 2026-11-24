'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

const KETERANGAN = ['Kurang', 'Biasa', 'Cukup bagus', 'Bagus', 'Luar biasa'];

// Pemilih rating 1 sampai 5 untuk formulir ulasan.
// nilai = rating yang sedang dipilih (0 = belum memilih), onUbah = fungsi yang dipanggil saat bintang diklik.
// Saat kursor di atas bintang, bintang dan keterangan menampilkan pratinjau pilihan itu.
export default function PilihBintang({ nilai, onUbah }) {
    const [sorot, setSorot] = useState(0);
    const tampil = sorot || nilai;

    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <div
                role="radiogroup"
                aria-label="Rating"
                className="flex gap-1"
                onMouseLeave={() => setSorot(0)}
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={nilai === n}
                        aria-label={`${n} dari 5, ${KETERANGAN[n - 1]}`}
                        onClick={() => onUbah(n)}
                        onMouseEnter={() => setSorot(n)}
                        className="flex size-12 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 hover:bg-tinta/5"
                    >
                        <Star
                            size={32}
                            aria-hidden="true"
                            className={n <= tampil ? 'fill-koral text-koral' : 'text-abu/70'}
                        />
                    </button>
                ))}
            </div>

            <p aria-live="polite" className="min-w-28 font-judul text-xl text-tinta">
                {tampil ? KETERANGAN[tampil - 1] : <span className="text-base text-abu">Pilih bintang</span>}
            </p>
        </div>
    );
}