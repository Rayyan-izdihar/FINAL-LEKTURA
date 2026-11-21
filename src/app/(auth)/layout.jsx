import Image from 'next/image';
import Link from 'next/link';
import Sampul from '@/components/Sampul';

// Tampilan khusus halaman login dan register: tanpa sidebar,
// panel kiri berisi suasana perpustakaan (hanya di layar lebar), panel kanan berisi formulir.
export default function LayoutAuth({ children }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <aside className="hidden flex-col justify-between border-r border-garis bg-kertas p-10 lg:flex">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/logo.svg" alt="" width={36} height={36} />
                    <span className="font-judul text-2xl">Lektura</span>
                </Link>

                <div>
                    <h2 className="font-judul text-4xl leading-tight">
                        Setiap buku punya
                        <br />
                        cerita berikutnya.
                    </h2>

                    <p className="mt-3 max-w-sm text-sm text-tinta-lembut">
                        Telusuri koleksi, ajukan peminjaman, dan pantau jatuh tempo dalam satu tempat.
                    </p>

                    <div className="mt-8 flex items-end gap-4">
                        <Sampul src="/covers/bumi.svg" judul="Bumi" className="w-24" />
                        <Sampul src="/covers/laskar-pelangi.svg" judul="Laskar Pelangi" className="w-32" />
                        <Sampul src="/covers/atomic-habits.svg" judul="Atomic Habits" className="w-24" />
                    </div>
                </div>

                <p className="text-xs text-abu">Perpustakaan kampus</p>
            </aside>

            <main className="flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md">
                    <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
                        <Image src="/logo.svg" alt="" width={32} height={32} />
                        <span className="font-judul text-xl">Lektura</span>
                    </Link>

                    {children}
                </div>
            </main>
        </div>
    );
}