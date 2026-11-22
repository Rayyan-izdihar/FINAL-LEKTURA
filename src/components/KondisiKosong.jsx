// Tampilan saat daftar kosong: ikon, judul, penjelasan singkat, dan (opsional) tombol.
export default function KondisiKosong({ ikon: Ikon, judul, teks, children }) {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-garis px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-tinta/5 text-tinta-lembut">
                <Ikon size={26} aria-hidden="true" />
            </span>
            
            <p className="mt-4 font-judul text-xl">{judul}</p>

            {teks && <p className="mt-1 max-w-sm text-sm text-tinta-lembut">{teks}</p>}
            {children && <div className="mt-5">{children}</div>}
        </div>
    );
}