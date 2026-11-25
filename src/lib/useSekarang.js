'use client';
import { useEffect, useState } from 'react';

// Mengembalikan waktu sekarang (milidetik) dan memperbaruinya setiap `setiap` milidetik.
// Komponen yang memakainya otomatis digambar ulang, sehingga tulisan "x menit lalu" ikut berubah
// tanpa perlu memuat ulang halaman.
export function useSekarang(setiap = 60000) {
    const [sekarang, setSekarang] = useState(() => Date.now());

    useEffect(() => {
        const perbarui = () => setSekarang(Date.now());

        const id = setInterval(perbarui, setiap);

        // Tab yang sedang di latar belakang sering ditahan browser,
        // jadi perbarui juga saat tab dibuka kembali.
        document.addEventListener('visibilitychange', perbarui);

        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', perbarui);
        };
    }, [setiap]);

    return sekarang;
}