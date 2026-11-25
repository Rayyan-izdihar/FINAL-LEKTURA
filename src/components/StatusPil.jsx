// Label status berbentuk pil dengan titik warna di depannya.
// nada: 'netral' | 'tinta' | 'hijau' | 'kuning' | 'koral'
// Contoh: <StatusPil nada="hijau">Stok tersedia 4</StatusPil>
const GAYA = {
    netral: 'bg-tinta/5 text-tinta-lembut',
    tinta: 'bg-tinta text-krem',
    hijau: 'bg-hijau-muda text-hijau',
    kuning: 'bg-kuning-muda text-kuning',
    koral: 'bg-koral/10 text-koral-tua',
};

const TITIK = {
    netral: 'bg-abu',
    tinta: 'bg-krem',
    hijau: 'bg-hijau',
    kuning: 'bg-kuning',
    koral: 'bg-koral-tua',
};

export default function StatusPil({ nada = 'netral', children }) {
    return (
        <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${GAYA[nada]}`}
        >
            <span aria-hidden="true" className={`size-1.5 rounded-full ${TITIK[nada]}`} />
            {children}
        </span>
    );
}