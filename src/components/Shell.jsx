'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navigasi from '@/components/Navigasi';
import Topbar from '@/components/Topbar';

// Kerangka halaman: sidebar (Navigasi) + topbar + isi halaman + baris info kecil di bawah.
export default function Shell({ children }) {
    const pathname = usePathname();
    // undefined = belum tahu, null = guest (belum login), objek = data user yang login
    const [user, setUser] = useState(undefined);

    // Tanya server siapa yang login. Dijalankan lagi setiap pindah halaman,
    // supaya setelah login/logout tampilan langsung ikut berubah.
    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => setUser(data.user))
            .catch(() => setUser(null));
    }, [pathname]);

    return (
        <div className="md:flex">
            <Navigasi user={user} />

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <Topbar user={user} />

                <main className="flex-1 px-4 pb-6 pt-2 md:px-8">
                    <div className="mx-auto w-full max-w-6xl">{children}</div>
                </main>

                <footer className="border-t border-garis px-4 pb-20 pt-3 text-xs text-abu md:px-8 md:pb-3">
                    Lektura, perpustakaan kampus. Buka Senin sampai Sabtu, 09.00-20.00 WITA.
                </footer>
            </div>
        </div>
    );
}