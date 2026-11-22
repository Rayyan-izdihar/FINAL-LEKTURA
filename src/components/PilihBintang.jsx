'use client';
import { Star } from 'lucide-react';

// Pemilih rating 1 sampai 5 untuk formulir ulasan.
// nilai = rating yang sedang dipilih (0 = belum memilih), onUbah = fungsi yang dipanggil saat bintang diklik.
export default function PilihBintang({ nilai, onUbah }) {
    return (
        <div role="radiogroup" aria-label="Rating" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={nilai === n}
                    aria-label={`${n} dari 5`}
                    onClick={() => onUbah(n)}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-tinta/5"
                >
                    <Star
                        size={26}
                        aria-hidden="true"
                        className={n <= nilai ? 'fill-koral text-koral' : 'text-abu'}
                    />
                </button>
            ))}
        </div>
    );
}