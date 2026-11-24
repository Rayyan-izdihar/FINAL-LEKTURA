
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatTanggal } from '@/lib/format';
import { gayaKategori } from '@/lib/kategoriPengumuman';

// Kartu pengumuman yang bisa diklik menuju halaman detailnya.
// Warna garis tepi dan ikon mengikuti kategori (Acara, Layanan, Operasional).
export default function KartuPengumuman({ item }) {
    const gaya = gayaKategori(item.kategori);
    const Ikon = gaya.ikon;

    return (
        <Link
            href={`/pengumuman/${item.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-kertas p-5 pl-6 shadow-kartu transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-tinta/30 hover:shadow-lg"
        >
            <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${gaya.bar}`} />

            <div className="flex items-center gap-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${gaya.ubin}`}>
                    <Ikon size={20} aria-hidden="true" />
                </span>

                <div className="min-w-0 text-xs">
                    <p className={`font-medium ${gaya.teks}`}>
                        {item.kategori}
                    </p>

                    <time dateTime={item.tanggal_rilis} className="text-abu">
                        {formatTanggal(item.tanggal_rilis)}
                    </time>
                </div>
            </div>

            <h3 className="mt-4 line-clamp-2 font-judul text-xl leading-snug">{item.judul}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-tinta-lembut">{item.cuplikan}</p>

            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                Baca selengkapnya

                <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
            </span>
        </Link>
    );
}