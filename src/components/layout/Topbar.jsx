'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import Lonceng from './Lonceng';
import { kelasTombol } from '@/lib/gaya';

const namaRole = { admin: 'Admin', pegawai: 'Pegawai', mahasiswa: 'Mahasiswa' };
const HALAMAN_DENGAN_PENCARIAN = ['/', '/katalog'];

function ambilInisial(nama) {
    return nama
        .split(' ')
        .map((kata) => kata[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}


export default function Topbar({ user }) {
    const pathname = usePathname();
    const tampilkanPencarian = !HALAMAN_DENGAN_PENCARIAN.includes(pathname);

    return (
        <header className="sticky top-0 z-20 bg-krem/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
                {tampilkanPencarian && (
                    <form action="/katalog" role="search" className="relative max-w-xl flex-1">
                        <Search
                            size={16}
                            aria-hidden="true"
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-abu"
                        />

                        <input
                            type="search"
                            name="q"
                            aria-label="Cari buku"
                            placeholder="Cari judul atau pengarang..."
                            className="min-h-11 w-full rounded-full border border-garis bg-kertas pl-10 pr-4 text-sm placeholder:text-abu focus:border-tinta"
                        />
                    </form>
                )}

                <div className="ml-auto flex items-center gap-3">
                    {user?.role === 'mahasiswa' &&
                        <Lonceng />
                    }

                    {user && (
                        <div className="flex items-center gap-2">
                            <span
                                aria-hidden="true"
                                className="flex size-8 items-center justify-center rounded-full bg-tinta text-xs font-medium text-krem"
                            >
                                {ambilInisial(user.nama)}
                            </span>

                            <span className="hidden text-sm leading-tight sm:block">
                                <span className="block max-w-36 truncate font-medium">{user.nama}</span>
                                <span className="block text-xs text-abu">{namaRole[user.role]}</span>
                            </span>
                        </div>
                    )}

                    {user === null && (
                        <Link href="/login" className={`${kelasTombol.gelap} hidden sm:inline-flex`}>
                            Masuk
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}