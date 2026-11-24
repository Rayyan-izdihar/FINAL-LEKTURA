import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Paginasi({ halaman, totalHalaman, total, limit, onUbah }) {
    if (totalHalaman <= 1) return null;

    const awal = Math.max(1, Math.min(halaman - 1, totalHalaman - 2));
    const akhir = Math.min(totalHalaman, Math.max(3, halaman + 1));
    const halamanTampil = Array.from({ length: akhir - awal + 1 }, (_, indeks) => awal + indeks);
    const mulaiData = total ? (halaman - 1) * limit + 1 : 0;
    const akhirData = Math.min(halaman * limit, total);

    return (
        <nav aria-label="Navigasi halaman" className="flex flex-col items-center justify-center gap-3 border-t border-garis pt-5 sm:flex-row">
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onUbah(halaman - 1)}
                    disabled={halaman <= 1}
                    aria-label="Halaman sebelumnya"
                    className="flex size-9 items-center justify-center rounded-full border border-garis bg-kertas text-tinta transition hover:border-tinta/40 hover:bg-krem-tua disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                </button>

                {awal > 1 && <span className="px-1 text-sm text-abu">…</span>}
                {halamanTampil.map((nomor) => (
                    <button
                        key={nomor}
                        type="button"
                        onClick={() => onUbah(nomor)}
                        aria-label={`Halaman ${nomor}`}
                        aria-current={nomor === halaman ? 'page' : undefined}
                        className={`size-9 rounded-full text-sm font-medium transition ${
                            nomor === halaman
                                ? 'bg-tinta text-krem shadow-sm'
                                : 'border border-transparent text-tinta-lembut hover:border-garis hover:bg-kertas'
                        }`}
                    >
                        {nomor}
                    </button>
                ))}
                {akhir < totalHalaman && <span className="px-1 text-sm text-abu">…</span>}

                <button
                    type="button"
                    onClick={() => onUbah(halaman + 1)}
                    disabled={halaman >= totalHalaman}
                    aria-label="Halaman berikutnya"
                    className="flex size-9 items-center justify-center rounded-full border border-garis bg-kertas text-tinta transition hover:border-tinta/40 hover:bg-krem-tua disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
}
