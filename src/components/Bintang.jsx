import { Star } from 'lucide-react';
import { formatRating } from '@/lib/format';


export default function Bintang({ nilai, jumlah, ukuran = 14 }) {
    if (jumlah === 0) {
        return <span className="text-xs text-abu">Belum ada ulasan</span>;
    }

    const bulat = Math.floor(nilai);
    const label =
        jumlah === undefined
        ? `Rating ${nilai} dari 5`
        : `Rating ${formatRating(nilai)} dari 5, ${jumlah} ulasan`;

        
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-tinta-lembut" aria-label={label}>
            <span className="flex" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                        key={n}
                        size={ukuran}
                        className={n <= bulat ? 'fill-koral text-koral' : 'text-garis'}
                    />
                ))}
            </span>

            {jumlah !== undefined && (
                <span aria-hidden="true">
                    {formatRating(nilai)} ({jumlah})
                </span>
            )}
        </span>
    );
}