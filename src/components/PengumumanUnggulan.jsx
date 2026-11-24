import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatTanggal } from '@/lib/format';
import { gayaKategori } from '@/lib/kategoriPengumuman';

// Kartu besar gelap untuk pengumuman paling baru di bagian atas daftar.
export default function PengumumanUnggulan({ item }) {
    const gaya = gayaKategori(item.kategori);
    const Ikon = gaya.ikon;

    return (
        <Link
            href={`/pengumuman/${item.id}`}
            className="group relative block overflow-hidden rounded-3xl bg-tinta p-6 text-krem shadow-kartu sm:p-8 md:p-10"
        >
            <Ikon
                aria-hidden="true"
                strokeWidth={1.25}
                className={`pointer-events-none absolute -bottom-12 -right-8 size-72 ${gaya.ikonGelap}`}
            />

            <div className="relative max-w-2xl">
                <div className="flex flex-wrap items-center gap-3 text-sm text-krem/70">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${gaya.pilGelap}`}>
                        <Ikon size={14} aria-hidden="true" />
                        {item.kategori}
                    </span>
                    <time dateTime={item.tanggal_rilis}>{formatTanggal(item.tanggal_rilis)}</time>
                </div>

                <h2 className="mt-4 font-judul text-3xl leading-tight md:text-4xl">{item.judul}</h2>
                <p className="mt-3 line-clamp-3 text-krem/75">{item.cuplikan}</p>

                <span className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-krem py-1 pl-5 pr-1.5 text-sm font-medium text-tinta">
                    Baca selengkapnya
                    <span className="flex size-8 items-center justify-center rounded-full bg-tinta text-krem transition-transform group-hover:translate-x-0.5">
                        <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                </span>
            </div>
        </Link>
    );
}