// Lingkaran berisi inisial nama. Warnanya dipilih dari nama, jadi orang yang sama
// selalu mendapat warna yang sama di semua tempat.
const WARNA = [
    'bg-koral/15 text-koral-tua',
    'bg-hijau-muda text-hijau',
    'bg-kuning-muda text-kuning',
    'bg-tinta/10 text-tinta',
];

export default function Avatar({ nama, ukuran = 36 }) {
    const inisial = nama
        .split(' ')
        .map((kata) => kata[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    const indeks = [...nama].reduce((total, huruf) => total + huruf.charCodeAt(0), 0) % WARNA.length;

    return (
        <span
            aria-hidden="true"
            style={{ width: ukuran, height: ukuran }}
            className={`flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${WARNA[indeks]}`}
        >
            {inisial}
        </span>
    );
}