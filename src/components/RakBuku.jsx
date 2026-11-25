
import Link from 'next/link';
import Sampul from '@/components/Sampul';

// Urutan tampil di layar lebar: peringkat 1 di tengah dan paling besar.
const URUTAN_LAYAR_LEBAR = ['lg:order-3', 'lg:order-2', 'lg:order-4', 'lg:order-1', 'lg:order-5'];

export default function RakBuku({ buku }) {
    return (
        <div className="overflow-x-auto border-b border-garis pb-5">
            <div className="flex w-max min-w-full snap-x items-end gap-4 px-6 pt-4 lg:justify-center lg:gap-8">
                {buku.map((item, i) => (
                    <Link
                        key={item.id}
                        href={`/buku/${item.id}`}
                        className={`mt-1 group flex shrink-0 snap-start flex-col gap-3 ${
                            i === 0 ? 'w-40 lg:w-52' : i < 3 ? 'w-36 lg:w-44' : 'w-32 lg:w-36'
                        } ${URUTAN_LAYAR_LEBAR[i]}`}
                    >        
                        {/* Sampul buku dan lencana peringkat */}
                        <div className="relative w-full transition-transform group-hover:-translate-y-1">
                            <Sampul
                                src={item.sampul}
                                judul={item.judul}
                                className="w-full"
                            />

                            
                            <span className={`absolute -left-4 -top-1 z-10 -rotate-20 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${i === 0 ? "bg-kuning-muda text-tinta border border-kuning" : "bg-tinta text-kertas"} shadow-kartu`}>
                                ★ TOP {i + 1}
                            </span>
                        </div>

                        <div className="h-16">
                            <p className={`line-clamp-2 leading-snug ${i === 0 ? 'font-medium' : 'text-sm'}`}>
                                {item.judul}
                            </p>

                            <p className="mt-0.5 text-xs text-abu">
                                {item.jumlah_pinjam} kali dipinjam
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
