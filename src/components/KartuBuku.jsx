import Link from 'next/link';
import Sampul from '@/components/Sampul';
import Bintang from '@/components/Bintang';

// Satu buku di halaman katalog: sampul, judul, penulis, rating, dan ketersediaan stok.
export default function KartuBuku({ buku }) {
    const tersedia = buku.stok_tersedia > 0;

    return (
        <Link href={`/buku/${buku.id}`} className="group flex flex-col gap-3">
            <Sampul
                src={buku.sampul}
                judul={buku.judul}
                className="w-full transition-transform group-hover:-translate-y-1"
            />
            
            <div className="space-y-1">
                <p className="text-xs text-abu">{buku.kategori}</p>
                <h3 className="font-medium leading-snug">{buku.judul}</h3>
                <p className="text-sm text-tinta-lembut">{buku.penulis}</p>
                
                <Bintang nilai={buku.rata_rating} jumlah={buku.jumlah_ulasan} />

                <p className={`text-xs ${tersedia ? 'text-abu' : 'font-medium text-koral-tua'}`}>
                    {tersedia ? `Tersedia ${buku.stok_tersedia} dari ${buku.stok_total}` : 'Stok habis'}
                </p>
            </div>
        </Link>
    );
}