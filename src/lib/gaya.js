const dasarTombol =
    'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 active:scale-95';

export const kelasTombol = {
    gelap: `${dasarTombol} bg-tinta text-krem hover:bg-tinta-lembut`,
    koral: `${dasarTombol} bg-koral text-white hover:bg-koral-tua`,
    hijau: `${dasarTombol} bg-hijau text-white hover:bg-hijau/90`,
    garis: `${dasarTombol} border border-tinta/30 text-tinta hover:bg-tinta/5`,
};

// Versi lebih kecil untuk tombol di dalam daftar dan kartu
const dasarTombolKecil =
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 active:scale-95';

export const kelasTombolKecil = {
    gelap: `${dasarTombolKecil} bg-tinta text-krem hover:bg-tinta-lembut`,
    koral: `${dasarTombolKecil} bg-koral text-white hover:bg-koral-tua`,
    hijau: `${dasarTombolKecil} bg-hijau text-white hover:bg-hijau/90`,
    garis: `${dasarTombolKecil} border border-tinta/30 text-tinta hover:bg-tinta/5`,
};

export const kelasInput =
    'min-h-11 w-full rounded-xl border border-garis bg-kertas px-4 text-sm text-tinta placeholder:text-abu focus:border-tinta';

export const kelasKartu = 'rounded-2xl border border-garis bg-kertas p-5';

// Panel dengan bayangan lembut, dipakai di dashboard pegawai dan admin
export const kelasPanel = 'rounded-2xl border border-garis bg-kertas shadow-kartu';

export const kelasChip = 'min-h-10 cursor-pointer rounded-full border px-4 text-sm transition-colors';


// ---- Baris daftar di dashboard pegawai (antrean, sirkulasi, denda) ----
// Sampul + isi di kiri, "slip" aksi di kanan (dipisah garis putus-putus).
export const kelasBaris = `${kelasPanel} flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5`;

export const kelasAksi =
    'flex shrink-0 gap-2 border-t border-dashed border-garis pt-4 sm:w-52 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0';

// Tombol di dalam slip: berbagi lebar di HP, penuh ke samping di layar lebar
export const kelasTombolAksi = 'flex-1 sm:w-full sm:flex-none';

// Pil kecil berisi avatar + nama + NIM peminjam
export const kelasPeminjam =
    'inline-flex items-center gap-2 rounded-full border border-garis bg-krem py-1 pl-1 pr-3 text-sm';