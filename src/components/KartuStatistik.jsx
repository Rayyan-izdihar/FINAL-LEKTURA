// Kartu angka ringkasan di bagian atas dashboard. Bisa diklik (mis. untuk berpindah tab).
// ikon = komponen ikon dari lucide-react, nada = warna ikon.
const NADA = {
    kuning: 'bg-kuning-muda text-kuning',
    hijau: 'bg-hijau-muda text-hijau',
    koral: 'bg-koral/10 text-koral-tua',
    tinta: 'bg-tinta/10 text-tinta',
};

export default function KartuStatistik({ ikon: Ikon, label, nilai, nada = 'tinta', aktif = false, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={aktif}
            className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-kertas p-4 text-left shadow-kartu transition hover:-translate-y-0.5 ${
                aktif ? 'border-tinta' : 'border-garis'
            }`}
        >
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${NADA[nada]}`}>
                <Ikon size={22} aria-hidden="true" />
            </span>
            <span>
                <span className="block font-judul text-3xl leading-none">{nilai}</span>
                <span className="mt-1.5 block text-sm text-tinta-lembut">{label}</span>
            </span>
        </button>
    );
}