import Link from 'next/link';
import { formatTanggal } from '@/lib/format';
import { kelasKartu } from '@/lib/gaya';

// Kartu pengumuman yang bisa diklik menuju halaman detailnya.
export default function KartuPengumuman({ item }) {
    return (
        <Link
            href={`/pengumuman/${item.id}`}
            className={`${kelasKartu} block transition-colors hover:border-tinta/40`}
        >
            <div className="mb-2 flex items-center gap-2 text-xs text-abu">
                <span className="rounded-full bg-tinta/5 px-2.5 py-0.5 font-medium text-tinta-lembut">
                    {item.kategori}
                </span>
                
                <time dateTime={item.tanggal_rilis}>{formatTanggal(item.tanggal_rilis)}</time>
            </div>

            <h3 className="font-judul text-lg leading-snug">{item.judul}</h3>
            <p className="mt-1.5 line-clamp-3 text-sm text-tinta-lembut">{item.cuplikan}</p>
        </Link>
    );
}