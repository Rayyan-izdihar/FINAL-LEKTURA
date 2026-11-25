'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

// Ikon lonceng di topbar untuk mahasiswa, dengan angka merah jumlah notifikasi yang belum dibaca.
// Angkanya dimuat ulang saat: halaman dibuka, pindah halaman, setiap 60 detik,
// dan saat komponen lain mengumumkan perubahan lewat event "notifikasi-berubah".
export default function Lonceng() {
    const pathname = usePathname();
    const [jumlah, setJumlah] = useState(0);

    const muat = useCallback(() => {
        fetch('/api/notifications/jumlah')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) setJumlah(data.belum_dibaca);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        muat();
    }, [muat, pathname]);

    useEffect(() => {
        const penghitung = setInterval(muat, 60000);
        window.addEventListener('notifikasi-berubah', muat);
        return () => {
            clearInterval(penghitung);
            window.removeEventListener('notifikasi-berubah', muat);
        };
    }, [muat]);

    return (
        <Link
            href="/dashboard/mahasiswa#notifikasi"
            aria-label={jumlah > 0 ? `Notifikasi, ${jumlah} belum dibaca` : 'Notifikasi'}
            className="relative flex size-11 items-center justify-center rounded-full text-tinta-lembut hover:bg-tinta/5"
        >
            <Bell size={20} aria-hidden="true" />
            {jumlah > 0 && (
                <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-koral px-1 text-[11px] font-semibold text-white"
                >
                    {jumlah > 9 ? '9+' : jumlah}
                </span>
            )}
        </Link>
    );
}