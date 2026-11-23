'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Library, Megaphone, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

// Satu komponen, dua tampilan:
// - layar lebar: sidebar ikon vertikal di kiri
// - layar kecil: tab bar di bawah layar
const kelasItem =
  'flex min-h-12 min-w-16 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors md:size-11 md:min-h-0 md:min-w-0 md:rounded-full';
const kelasAktif = 'bg-koral text-white';
const kelasBiasa = 'text-tinta-lembut hover:bg-tinta/5';

function Item({ href, label, Ikon, aktif, warna }) {
    return (
        <Link
            href={href}
            title={label}
            aria-current={aktif ? 'page' : undefined}
            className={`${kelasItem} ${aktif ? kelasAktif : warna || kelasBiasa}`}
        >
            <Ikon size={20} aria-hidden="true" />
            <span className="text-[11px] md:sr-only">{label}</span>
        </Link>
    );
}

// user: undefined = masih memuat, null = guest, objek = sudah login
export default function Navigasi({ user }) {
    const pathname = usePathname();

    const menu = [
        { href: '/', label: 'Beranda', Ikon: House, aktif: pathname === '/' },
        {
            href: '/katalog',
            label: 'Katalog',
            Ikon: Library,
            aktif: pathname.startsWith('/katalog') || pathname.startsWith('/buku'),
        },
        {
            href: '/pengumuman',
            label: 'Pengumuman',
            Ikon: Megaphone,
            aktif: pathname.startsWith('/pengumuman'),
        },
    ];

    // Menu Dashboard hanya muncul setelah login, tujuannya mengikuti role.
    if (user) {
        menu.push({
            href: `/dashboard/${user.role}`,
            label: 'Dashboard',
            Ikon: LayoutDashboard,
            aktif: ['/dashboard', '/admin', '/pegawai'].some((awalan) => pathname.startsWith(awalan)),
        });
    }

    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-garis bg-kertas/95 px-2 py-1 backdrop-blur md:sticky md:inset-auto md:top-0 md:h-screen md:w-16 md:flex-col md:justify-start md:gap-2 md:border-r md:border-t-0 md:px-0 md:py-5"
        >
            <Link href="/" aria-label="Lektura, ke beranda" className="mb-4 hidden md:block">
                <Image src="/logo.svg" alt="" width={36} height={36} priority />
            </Link>

            {menu.map((item) => (
                <Item key={item.href} {...item} />
            ))}

            <div className="md:mb-8 md:mt-auto">
                {user === null && (
                    <Item
                        href="/login"
                        label="Masuk"
                        Ikon={LogIn}
                        aktif={false}
                        warna="text-tinta-lembut hover:bg-koral/10 hover:text-koral"
                    />
                )}

                {user && (
                    // Logout memakai server action (src/app/actions/auth.js)
                    <form action={logout}>
                        <button
                            type="submit"
                            title="Keluar"
                            className={`${kelasItem} text-tinta-lembut hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors`}
                        >
                            <LogOut size={20} aria-hidden="true" />
                            <span className="text-[11px] md:sr-only">Keluar</span>
                        </button>
                    </form>
                )}
            </div>
        </nav>
    );
}