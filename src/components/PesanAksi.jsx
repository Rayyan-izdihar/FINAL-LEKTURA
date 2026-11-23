'use client';
import { useEffect } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';

// Pesan singkat yang muncul di pojok layar setelah sebuah aksi (setujui, tolak, dan sebagainya).
// pesan = { ok: true/false, teks: '...' } atau null. Hilang sendiri setelah 6 detik.
// Fungsi onTutup harus stabil (dibuat dengan useCallback di halaman induk), kalau tidak
// penghitung waktunya akan terus diulang setiap halaman dirender.
export default function PesanAksi({ pesan, onTutup }) {
    useEffect(() => {
        if (!pesan) return;
        const penghitung = setTimeout(onTutup, 6000);
        return () => clearTimeout(penghitung);
    }, [pesan, onTutup]);

    if (!pesan) return null;

    const Ikon = pesan.ok ? CircleCheck : CircleAlert;

    return (
        <div
            role={pesan.ok ? 'status' : 'alert'}
            className="fixed inset-x-4 bottom-24 z-50 md:inset-x-auto md:bottom-6 md:right-6 md:w-96"
        >
            <div
                className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${
                    pesan.ok ? 'border-hijau/30 bg-hijau-muda' : 'border-koral/40 bg-kertas'
                }`}
            >
                <Ikon
                    size={20}
                    aria-hidden="true"
                    className={`mt-0.5 shrink-0 ${pesan.ok ? 'text-hijau' : 'text-koral-tua'}`}
                />

                <p className="flex-1 text-sm text-tinta">{pesan.pesan}</p>
                
                <button
                    type="button"
                    onClick={onTutup}
                    aria-label="Tutup pesan"
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-tinta-lembut hover:bg-tinta/10"
                >
                    <X size={16} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}