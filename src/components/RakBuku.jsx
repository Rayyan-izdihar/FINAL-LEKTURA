import Link from 'next/link';
import Sampul from '@/components/Sampul';

// Urutan tampil di layar lebar: peringkat 1 di tengah dan paling besar, peringkat lain di kiri-kanannya.
// Di layar kecil urutannya biasa (peringkat 1 sampai 5) dan bisa digeser ke samping.
// Kelas ditulis lengkap (bukan disusun dari variabel) supaya terbaca oleh Tailwind.
const URUTAN_LAYAR_LEBAR = ['lg:order-3', 'lg:order-2', 'lg:order-4', 'lg:order-1', 'lg:order-5'];

export default function RakBuku({ buku }) {
    return (
        <div className="flex snap-x items-end gap-4 overflow-x-auto border-b border-garis pb-5 pt-4 lg:justify-center lg:gap-8">
            {buku.map((item, i) => (
                <Link
                    key={item.id}
                    href={`/buku/${item.id}`}
                    className={`group flex shrink-0 snap-start flex-col gap-3 ${
                        i === 0 ? 'w-40 lg:w-52' : i < 3 ? 'w-36 lg:w-44' : 'w-32 lg:w-36'
                    } ${URUTAN_LAYAR_LEBAR[i]}`}
                >
                    <Sampul
                        src={item.sampul}
                        judul={item.judul}
                        className="w-full transition-transform group-hover:-translate-y-1"
                    />
                    
                    <div className="h-16">
                        <p className={`line-clamp-2 leading-snug ${i === 0 ? 'font-medium' : 'text-sm'}`}>
                            {item.judul}
                        </p>

                        <p className="mt-0.5 text-xs text-abu">
                            Peringkat {i + 1}, dipinjam {item.jumlah_pinjam}x
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}