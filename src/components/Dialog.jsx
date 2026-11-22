'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Jendela konfirmasi yang muncul di tengah layar, memakai elemen <dialog> bawaan browser.
// Elemen ini otomatis mengurus fokus keyboard dan tombol Esc.
// buka = true/false, onTutup = fungsi yang dipanggil saat ditutup (Esc, tombol X, atau klik di luar).
export default function Dialog({ buka, onTutup, judul, children }) {
    const ref = useRef(null);

    // Menyamakan keadaan <dialog> dengan nilai `buka` dari halaman induk
    useEffect(() => {
        const elemen = ref.current;
        if (buka && !elemen.open) elemen.showModal();
        if (!buka && elemen.open) elemen.close();
    }, [buka]);

    return (
        <dialog
            ref={ref}
            onClose={onTutup}
            onClick={(e) => {
                // Klik pada latar gelap (bukan isi dialog) menutup dialog
                if (e.target === ref.current) onTutup();
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-garis bg-kertas p-0 text-tinta shadow-2xl backdrop:bg-tinta/40 backdrop:backdrop-blur-sm"
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="font-judul text-xl leading-snug">{judul}</h2>
                    
                    <button
                        type="button"
                        onClick={onTutup}
                        aria-label="Tutup"
                        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-tinta-lembut hover:bg-tinta/10"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <div className="mt-4">{children}</div>
            </div>
        </dialog>
    );
}